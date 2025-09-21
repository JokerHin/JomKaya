import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { DBInvestorProfile } from "@/components/auth-provider";

// Nova Pro request shape used by BedrockService
type NovaProRequest = {
  messages: Array<{ role: string; content: { text: string }[] }>;
  inferenceConfig?: { maxTokens?: number; temperature?: number };
  system?: { text: string }[];
};

const bedrockClient = new BedrockRuntimeClient(
  (() => {
    const clientConfig: any = { region: process.env.REGION };
    const accessKey = process.env.ACCESS_KEY_ID;
    const secretKey = process.env.SECRET_ACCESS_KEY;

    if (accessKey && secretKey) {
      clientConfig.credentials = {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      };
    }
    return clientConfig;
  })()
);

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BedrockRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userLanguage?: "en" | "ms";
}

export interface BedrockResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason?: string;
}

export class BedrockService {
  private static readonly MODEL_ID = "amazon.nova-pro-v1:0";
  private static readonly DEFAULT_MAX_TOKENS = 2048;
  private static readonly DEFAULT_TEMPERATURE = 0.7;

  static async generateResponse({
    messages,
    maxTokens = this.DEFAULT_MAX_TOKENS,
    temperature = this.DEFAULT_TEMPERATURE,
    systemPrompt,
  }: BedrockRequest): Promise<BedrockResponse> {
    try {
      const novaProMessages = this.formatMessagesForNovaPro(messages);

      const requestBody: NovaProRequest = {
        messages: novaProMessages,
        inferenceConfig: {
          maxTokens: maxTokens,
          temperature: temperature,
        },
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.system = [{ text: systemPrompt }];
      }

      const command = new InvokeModelCommand({
        modelId: this.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody),
      });

      const response = await bedrockClient.send(command);

      if (!response.body) {
        throw new Error("No response body received from Bedrock");
      }

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return {
        content:
          responseBody.output?.message?.content?.[0]?.text ||
          responseBody.content?.[0]?.text ||
          responseBody.content ||
          responseBody.output?.text ||
          responseBody.completion ||
          "",
        usage: {
          inputTokens:
            responseBody.usage?.inputTokens ||
            responseBody.usage?.input_tokens ||
            0,
          outputTokens:
            responseBody.usage?.outputTokens ||
            responseBody.usage?.output_tokens ||
            0,
        },
        stopReason: responseBody.stopReason || responseBody.stop_reason,
      };
    } catch (error) {
      console.error("Bedrock API error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate response"
      );
    }
  }

  static async generateStreamingResponse({
    messages,
    maxTokens = this.DEFAULT_MAX_TOKENS,
    temperature = this.DEFAULT_TEMPERATURE,
    systemPrompt,
  }: BedrockRequest): Promise<AsyncIterable<string>> {
    try {
      const novaProMessages = this.formatMessagesForNovaPro(messages);

      const requestBody: NovaProRequest = {
        messages: novaProMessages,
        inferenceConfig: {
          maxTokens: maxTokens,
          temperature: temperature,
        },
      };

      // Add system prompt if provided
      if (systemPrompt) {
        requestBody.system = [{ text: systemPrompt }];
      }

      const command = new InvokeModelWithResponseStreamCommand({
        modelId: this.MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(requestBody),
      });

      const response = await bedrockClient.send(command);

      if (!response.body) {
        throw new Error("No response stream received from Bedrock");
      }

      return this.parseStreamingResponse(response.body);
    } catch (error) {
      console.error("Bedrock streaming error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to generate streaming response"
      );
    }
  }

  private static async *parseStreamingResponse(
    stream: AsyncIterable<unknown>
  ): AsyncIterable<string> {
    try {
      for await (const chunk of stream) {
        // narrow unknown to a reasonable object shape
        if (typeof chunk === "object" && chunk !== null && "chunk" in chunk) {
          const c = chunk as { chunk?: { bytes?: Uint8Array } };
          if (c.chunk?.bytes) {
            const decoded = new TextDecoder().decode(c.chunk.bytes);

            let parsed: unknown;
            try {
              parsed = JSON.parse(decoded);
            } catch {
              yield decoded;
              continue;
            }

            if (typeof parsed === "object" && parsed !== null) {
              const obj = parsed as Record<string, unknown>;

              // Nova Pro: contentBlockDelta.delta.text
              const cbd = obj["contentBlockDelta"];
              if (typeof cbd === "object" && cbd !== null) {
                const delta = (cbd as Record<string, unknown>)["delta"];
                if (typeof delta === "object" && delta !== null) {
                  const text = (delta as Record<string, unknown>)["text"];
                  if (typeof text === "string") {
                    yield text;
                    continue;
                  }
                }
              }

              // content_block_delta with delta.text
              if (obj["type"] === "content_block_delta") {
                const delta = obj["delta"];
                if (typeof delta === "object" && delta !== null) {
                  const text = (delta as Record<string, unknown>)["text"];
                  if (typeof text === "string") {
                    yield text;
                    continue;
                  }
                }
              }

              // delta.text
              if (typeof obj["delta"] === "object" && obj["delta"] !== null) {
                const text = (obj["delta"] as Record<string, unknown>)["text"];
                if (typeof text === "string") {
                  yield text;
                  continue;
                }
              }

              // output.message.content[0].text
              const output = obj["output"];
              if (typeof output === "object" && output !== null) {
                const message = (output as Record<string, unknown>)["message"];
                if (typeof message === "object" && message !== null) {
                  const content = (message as Record<string, unknown>)[
                    "content"
                  ];
                  if (
                    Array.isArray(content) &&
                    typeof content[0] === "object" &&
                    content[0] !== null
                  ) {
                    const text = (content[0] as Record<string, unknown>)[
                      "text"
                    ];
                    if (typeof text === "string") {
                      yield text;
                      continue;
                    }
                  }
                }
              }

              // content[0].text or content
              const contentTop = obj["content"];
              if (Array.isArray(contentTop)) {
                const first = contentTop[0];
                if (typeof first === "object" && first !== null) {
                  const text = (first as Record<string, unknown>)["text"];
                  if (typeof text === "string") {
                    yield text;
                    continue;
                  }
                }
              } else if (typeof contentTop === "string") {
                yield contentTop;
                continue;
              }

              // completion or text fields
              if (typeof obj["completion"] === "string") {
                yield obj["completion"] as string;
                continue;
              }
              if (typeof obj["text"] === "string") {
                yield obj["text"] as string;
                continue;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing streaming response:", error);
      throw error;
    }
  }

  static createSystemPrompt(
    userProfile?: DBInvestorProfile | null,
    userLanguage?: "en" | "ms"
  ): string {
    let systemPrompt = `You are JomKaya AI Assistant, a specialized AI advisor for Shariah-compliant investments in Malaysia. Your expertise includes:

🎯 Core Responsibilities:
- Provide guidance on Shariah-compliant investment principles
- Recommend halal investment options in Malaysia
- Explain Islamic finance concepts and screening criteria
- Analyze Malaysian stocks for Shariah compliance
- Suggest portfolio allocations based on Islamic principles

📋 Key Guidelines:
- Always prioritize Shariah compliance in recommendations
- Reference Securities Commission Malaysia's approved lists when relevant
- Explain both opportunities and risks transparently
- Encourage consultation with licensed Islamic financial advisors
- Provide educational content rather than direct financial advice

🚫 Prohibited Areas:
- Never recommend haram investments (alcohol, gambling, conventional interest-based products)
- Avoid giving specific buy/sell advice
- Don't guarantee returns or outcomes

🌟 Communication Style:
- Be helpful, professional, and educational
- Use clear explanations for complex concepts
- Include relevant emojis and formatting for readability
- Provide practical, actionable guidance`;

    // Add language preference instruction
    if (userLanguage === "ms") {
      systemPrompt += `\n\n🌏 Language Preference:
- IMPORTANT: Respond in Bahasa Melayu (Malay language)
- Use formal and polite Malay language appropriate for financial advice
- Maintain technical accuracy while using accessible Malay terminology
- When user writes in Malay, always respond in Malay`;
    } else {
      systemPrompt += `\n\n🌏 Language Preference:
- IMPORTANT: Respond in English unless user specifically requests Malay
- If user writes in Bahasa Melayu, respond in Bahasa Melayu
- Match the user's language preference automatically`;
    }

    if (userProfile) {
      systemPrompt += `\n\n👤 User Profile Context:
- Risk Tolerance: ${userProfile.riskTolerance || "Not specified"}
- Investment Experience: ${userProfile.investmentExperience || "Not specified"}
- Time Horizon: ${userProfile.timeHorizon || "Not specified"}
- Investment Goals: ${
        userProfile.investmentGoals?.join(", ") || "Not specified"
      }
- Liquidity Needs: ${userProfile.liquidityNeeds || "Not specified"}

Tailor your responses to match their profile while maintaining Shariah compliance.`;
    }

    return systemPrompt;
  }

  private static buildPromptFromMessages(messages: ChatMessage[]): string {
    const lines: string[] = [];
    for (const msg of messages) {
      if (msg.role === "user") {
        lines.push(`User: ${msg.content}`);
      } else {
        lines.push(`Assistant: ${msg.content}`);
      }
    }
    return lines.join("\n\n");
  }

  static formatConversationHistory(
    messages: Array<{ content: string; isUser: boolean }>
  ): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));
  }

  /**
   * Format messages for Nova Pro which expects content as an array of content blocks
   */
  private static formatMessagesForNovaPro(messages: ChatMessage[]) {
    return messages.map((msg) => ({
      role: msg.role,
      content: [
        {
          text: msg.content,
        },
      ],
    }));
  }
}

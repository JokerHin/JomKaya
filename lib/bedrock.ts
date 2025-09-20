import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BedrockRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
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
  private static readonly MODEL_ID = "us.amazon.nova-pro-v1:0";
  private static readonly DEFAULT_MAX_TOKENS = 2048;
  private static readonly DEFAULT_TEMPERATURE = 0.7;
  private static readonly DEFAULT_TOP_P = 0.9;

  /**
   * Generate a response using Nova Pro model
   */
  static async generateResponse({
    messages,
    maxTokens = this.DEFAULT_MAX_TOKENS,
    temperature = this.DEFAULT_TEMPERATURE,
    topP = this.DEFAULT_TOP_P,
    systemPrompt,
  }: BedrockRequest): Promise<BedrockResponse> {
    try {
      // Prepare the messages array with system prompt if provided
      const formattedMessages = [...messages];

      if (systemPrompt) {
        formattedMessages.unshift({
          role: "assistant",
          content: systemPrompt,
        });
      }

      const requestBody = {
        messages: formattedMessages,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        anthropic_version: "bedrock-2023-05-31",
      };

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
          responseBody.content?.[0]?.text || responseBody.completion || "",
        usage: {
          inputTokens: responseBody.usage?.input_tokens || 0,
          outputTokens: responseBody.usage?.output_tokens || 0,
        },
        stopReason: responseBody.stop_reason,
      };
    } catch (error) {
      console.error("Bedrock API error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate response"
      );
    }
  }

  /**
   * Generate streaming response using Nova Pro model
   */
  static async generateStreamingResponse({
    messages,
    maxTokens = this.DEFAULT_MAX_TOKENS,
    temperature = this.DEFAULT_TEMPERATURE,
    topP = this.DEFAULT_TOP_P,
    systemPrompt,
  }: BedrockRequest): Promise<AsyncIterable<string>> {
    try {
      const formattedMessages = [...messages];

      if (systemPrompt) {
        formattedMessages.unshift({
          role: "assistant",
          content: systemPrompt,
        });
      }

      const requestBody = {
        messages: formattedMessages,
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        anthropic_version: "bedrock-2023-05-31",
      };

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

  /**
   * Parse streaming response from Bedrock
   */
  private static async *parseStreamingResponse(
    stream: AsyncIterable<any>
  ): AsyncIterable<string> {
    try {
      for await (const chunk of stream) {
        if (chunk.chunk?.bytes) {
          const chunkData = JSON.parse(
            new TextDecoder().decode(chunk.chunk.bytes)
          );

          if (chunkData.type === "content_block_delta") {
            yield chunkData.delta?.text || "";
          } else if (chunkData.delta?.text) {
            yield chunkData.delta.text;
          } else if (chunkData.completion) {
            yield chunkData.completion;
          }
        }
      }
    } catch (error) {
      console.error("Error parsing streaming response:", error);
      throw error;
    }
  }

  /**
   * Create system prompt for Shariah-compliant investment assistant
   */
  static createSystemPrompt(userProfile?: any): string {
    let systemPrompt = `You are JomKaya AI Assistant, a specialized AI advisor for Shariah-compliant investments in Malaysia. Your expertise includes:

🎯 **Core Responsibilities:**
- Provide guidance on Shariah-compliant investment principles
- Recommend halal investment options in Malaysia
- Explain Islamic finance concepts and screening criteria
- Analyze Malaysian stocks for Shariah compliance
- Suggest portfolio allocations based on Islamic principles

📋 **Key Guidelines:**
- Always prioritize Shariah compliance in recommendations
- Reference Securities Commission Malaysia's approved lists when relevant
- Explain both opportunities and risks transparently
- Encourage consultation with licensed Islamic financial advisors
- Provide educational content rather than direct financial advice

🚫 **Prohibited Areas:**
- Never recommend haram investments (alcohol, gambling, conventional interest-based products)
- Avoid giving specific buy/sell advice
- Don't guarantee returns or outcomes

🌟 **Communication Style:**
- Be helpful, professional, and educational
- Use clear explanations for complex concepts
- Include relevant emojis and formatting for readability
- Provide practical, actionable guidance`;

    if (userProfile) {
      systemPrompt += `\n\n👤 **User Profile Context:**
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

  /**
   * Format conversation history for Bedrock
   */
  static formatConversationHistory(
    messages: Array<{
      content: string;
      isUser: boolean;
    }>
  ): ChatMessage[] {
    return messages.map((msg) => ({
      role: msg.isUser ? "user" : "assistant",
      content: msg.content,
    }));
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  BedrockAgentRuntimeClient,
  InvokeFlowCommand,
  InvokeFlowCommandInput,
  InvokeFlowCommandOutput,
} from "@aws-sdk/client-bedrock-agent-runtime";
import { DatabaseService } from "@/lib/database";
import { TranslationService } from "@/lib/translate";

const client = new BedrockAgentRuntimeClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

const FLOW_ID = process.env.FLOW_ID;
const FLOW_ALIAS = process.env.FLOW_ALIAS;
const AWS_REGION = process.env.REGION;

export async function POST(request: NextRequest) {
  let bodyJson: any;
  try {
    bodyJson = await request.json();
  } catch (e) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Handle health check
  if (bodyJson.action === "health") {
    return NextResponse.json({ success: true, status: "connected" });
  }

  const {
    message,
    conversationHistory = [],
    userId,
    useStreaming = false,
  } = bodyJson;
  if (!message || typeof message !== "string") {
    return NextResponse.json(
      { success: false, error: "Message is required" },
      { status: 400 }
    );
  }

  // get user profile
  let userProfile = null;
  if (userId) {
    try {
      userProfile = await DatabaseService.getInvestorProfile(userId);
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
  }

  // build the input for the Flow
  const flowInput: InvokeFlowCommandInput = {
    flowIdentifier: FLOW_ID,
    flowAliasIdentifier: FLOW_ALIAS,

    inputs: [
      {
        nodeName: "FlowInputNode",
        nodeOutputName: "document",
        content: {
          document: message,
        },
      },
    ],
  };

  try {
    const command = new InvokeFlowCommand(flowInput);

    if (useStreaming) {
      // streaming mode: read from response.responseStream
      const response: InvokeFlowCommandOutput = await client.send(command);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of response.responseStream!) {
              if (event.flowOutputEvent) {
                const outputEvent = event.flowOutputEvent;
                let textContent = "";

                if (outputEvent.content?.document) {
                  if (typeof outputEvent.content.document === "string") {
                    textContent = outputEvent.content.document;
                  } else {
                    textContent = JSON.stringify(outputEvent.content.document);
                  }
                }

                if (textContent) {
                  const dataToSend = `data: ${JSON.stringify({
                    chunk: textContent,
                  })}\n\n`;
                  controller.enqueue(encoder.encode(dataToSend));
                }
              } else if (event.flowCompletionEvent) {
                console.log("Flow completed successfully");
              }
            }

            // When stream ends
            const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
            controller.enqueue(encoder.encode(endData));
            controller.close();
          } catch (streamErr) {
            console.error("Streaming flow error:", streamErr);
            const errorData = `data: ${JSON.stringify({
              error:
                streamErr instanceof Error
                  ? streamErr.message
                  : "Flow stream error",
            })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // non-streaming: collect all output events
      const response: InvokeFlowCommandOutput = await client.send(command);

      // Collect all output from the flow
      let allOutput = "";
      for await (const event of response.responseStream!) {
        if (event.flowOutputEvent?.content?.document) {
          const content = event.flowOutputEvent.content.document;
          if (typeof content === "string") {
            allOutput += content;
          } else {
            allOutput += JSON.stringify(content);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: allOutput || "No output from flow",
      });
    }
  } catch (invokeErr) {
    console.error("Flow invocation failed:", invokeErr);

    // Provide more specific error messages
    let errorMessage = "Flow failed";
    if (invokeErr instanceof Error) {
      if (invokeErr.message.includes("Invalid flow alias arn")) {
        errorMessage = `Invalid flow alias. Please check that the flow "${FLOW_ID}" exists and alias "${FLOW_ALIAS}" is valid in region ${AWS_REGION}.`;
      } else if (invokeErr.message.includes("AccessDenied")) {
        errorMessage =
          "Access denied. Please check your AWS credentials and permissions for Bedrock Agent Runtime.";
      } else {
        errorMessage = invokeErr.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        flowId: FLOW_ID,
        flowAlias: FLOW_ALIAS,
        region: AWS_REGION,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: "Please use POST" },
    { status: 400 }
  );
}

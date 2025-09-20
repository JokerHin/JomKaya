import { NextRequest, NextResponse } from "next/server";
import { BedrockService, ChatMessage } from "@/lib/bedrock";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      conversationHistory = [],
      userId,
      useStreaming = false,
    } = await request.json();

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user profile for personalized responses
    let userProfile = null;
    if (userId) {
      try {
        userProfile = await DatabaseService.getInvestorProfile(userId);
      } catch (error) {
        console.log("Could not fetch user profile:", error);
        // Continue without profile - not critical
      }
    }

    // Format conversation history
    const messages: ChatMessage[] = [
      ...BedrockService.formatConversationHistory(conversationHistory),
      { role: "user", content: message },
    ];

    // Create system prompt
    const systemPrompt = BedrockService.createSystemPrompt(userProfile);

    if (useStreaming) {
      // Return streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const responseStream =
              await BedrockService.generateStreamingResponse({
                messages,
                systemPrompt,
                maxTokens: 2048,
                temperature: 0.7,
              });

            for await (const chunk of responseStream) {
              const data = `data: ${JSON.stringify({ chunk })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }

            // Send completion signal
            const endData = `data: ${JSON.stringify({ done: true })}\n\n`;
            controller.enqueue(encoder.encode(endData));
            controller.close();
          } catch (error) {
            console.error("Streaming error:", error);
            const errorData = `data: ${JSON.stringify({
              error:
                error instanceof Error ? error.message : "Streaming failed",
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
      // Return regular response
      const response = await BedrockService.generateResponse({
        messages,
        systemPrompt,
        maxTokens: 2048,
        temperature: 0.7,
      });

      return NextResponse.json({
        success: true,
        message: response.content,
        usage: response.usage,
        stopReason: response.stopReason,
      });
    }
  } catch (error) {
    console.error("Bedrock chat error:", error);

    // Return fallback response
    const fallbackMessage = `I apologize, but I'm experiencing technical difficulties right now. Here's some general guidance:

🤖 **JomKaya AI Assistant**

For Shariah-compliant investment guidance in Malaysia, I recommend:

📊 **General Principles:**
• Focus on halal sectors (technology, healthcare, real estate)
• Avoid haram industries (alcohol, gambling, conventional banking)
• Consider Securities Commission Malaysia's approved list
• Maintain diversified portfolio with appropriate risk management

🔍 **Next Steps:**
• Consult with a licensed Islamic financial advisor
• Review your risk tolerance and investment goals
• Research specific stocks through official SC Malaysia resources

Please try again in a moment, or consult with a qualified financial professional for immediate assistance.`;

    return NextResponse.json(
      {
        success: false,
        message: fallbackMessage,
        error:
          error instanceof Error
            ? error.message
            : "AI service temporarily unavailable",
        fallback: true,
      },
      { status: 200 }
    ); // Return 200 to prevent UI errors
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "health") {
      // Health check endpoint
      return NextResponse.json({
        success: true,
        service: "Bedrock Nova Pro",
        status: "operational",
        model: "us.amazon.nova-pro-v1:0",
        timestamp: new Date().toISOString(),
      });
    }

    if (action === "models") {
      // Return available models info
      return NextResponse.json({
        success: true,
        models: [
          {
            id: "us.amazon.nova-pro-v1:0",
            name: "Amazon Nova Pro",
            description: "Advanced multimodal model for text generation",
            capabilities: ["text", "reasoning", "analysis"],
            maxTokens: 4096,
          },
        ],
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Bedrock API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

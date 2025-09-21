import { NextRequest, NextResponse } from "next/server";
import { TranslationService, TranslationRequest } from "@/lib/translate";

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest | { action?: string; text?: string } =
      await request.json();

    // Handle query actions (languages, detect)
    if ("action" in body && body.action) {
      const action = body.action;

      if (action === "languages") {
        // Return supported languages
        const supportedLanguages = TranslationService.getSupportedLanguages();
        return NextResponse.json({
          success: true,
          ...supportedLanguages,
        });
      }

      if (action === "detect") {
        const text = body?.text;
        if (!text) {
          return NextResponse.json(
            {
              success: false,
              error: "Text parameter is required for detection",
            },
            { status: 400 }
          );
        }

        const language = await TranslationService.detectLanguage(text);
        return NextResponse.json({
          success: true,
          detectedLanguage: language,
        });
      }

      return NextResponse.json(
        { success: false, error: "Unknown action" },
        { status: 400 }
      );
    }

    // Handle translation requests (existing logic)
    const { text, sourceLanguage, targetLanguage } = body as TranslationRequest;

    // Validate input
    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    if (!sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: "Source and target languages are required" },
        { status: 400 }
      );
    }

    // Validate language codes
    const supportedLanguages = ["en", "ms", "auto"];
    if (
      !supportedLanguages.includes(sourceLanguage) ||
      !["en", "ms"].includes(targetLanguage)
    ) {
      return NextResponse.json(
        { success: false, error: "Unsupported language code" },
        { status: 400 }
      );
    }

    const result = await TranslationService.translateText({
      text,
      sourceLanguage,
      targetLanguage,
    });

    if (!result.success) {
      if (result.error?.includes("AWS permissions required")) {
        return NextResponse.json(
          {
            success: false,
            error: result.error,
            translatedText: result.translatedText,
            fallback: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
    });
  } catch (error) {
    const errAny = error as any;
    try {
      console.error("Translation API error:", errAny, errAny?.stack);
    } catch (logErr) {
      console.error("Translation API error (failed to print stack):", error);
    }

    if (errAny && typeof errAny.message === "string") {
      return NextResponse.json(
        { success: false, error: errAny.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, error: "Please use POST with JSON body" },
    { status: 400 }
  );
}

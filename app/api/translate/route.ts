import { NextRequest, NextResponse } from "next/server";
import { TranslationService, TranslationRequest } from "@/lib/translate";

export async function POST(request: NextRequest) {
  try {
    const body: TranslationRequest = await request.json();
    const { text, sourceLanguage, targetLanguage } = body;

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

    // Perform translation
    const result = await TranslationService.translateText({
      text,
      sourceLanguage,
      targetLanguage,
    });

    if (!result.success) {
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
    console.error("Translation API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "languages") {
      // Return supported languages
      const supportedLanguages = TranslationService.getSupportedLanguages();
      return NextResponse.json({
        success: true,
        ...supportedLanguages,
      });
    }

    if (action === "detect") {
      const text = searchParams.get("text");
      if (!text) {
        return NextResponse.json(
          { success: false, error: "Text parameter is required for detection" },
          { status: 400 }
        );
      }

      const detection = await TranslationService.detectLanguage(text);
      return NextResponse.json({
        success: detection.success,
        language: detection.language,
        confidence: detection.confidence,
        error: detection.error,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Translation API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

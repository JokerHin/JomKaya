import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

// Initialize the Translate client
const translateClient = new TranslateClient({
  region: process.env.REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export interface TranslationRequest {
  text: string;
  sourceLanguage: "en" | "ms" | "auto";
  targetLanguage: "en" | "ms";
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
}

export class TranslationService {
  /**
   * Translate text between English and Bahasa Melayu
   */
  static async translateText({
    text,
    sourceLanguage,
    targetLanguage,
  }: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Validate input
      if (!text || text.trim() === "") {
        return {
          translatedText: "",
          sourceLanguage,
          targetLanguage,
          success: false,
          error: "Text is required for translation",
        };
      }

      // Skip translation if source and target are the same (and source is not auto-detect)
      if (sourceLanguage !== "auto" && sourceLanguage === targetLanguage) {
        return {
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          success: true,
        };
      }

      const command = new TranslateTextCommand({
        Text: text,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage,
      });

      const response = await translateClient.send(command);

      return {
        translatedText: response.TranslatedText || "",
        sourceLanguage: response.SourceLanguageCode || sourceLanguage,
        targetLanguage,
        success: true,
      };
    } catch (error) {
      console.error("Translation error:", error);

      if (
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "AccessDeniedException"
      ) {
        console.warn(
          "AWS Translate access denied - translation feature disabled"
        );
        return {
          translatedText: text,
          sourceLanguage,
          targetLanguage,
          success: false,
          error: "Translation service unavailable - AWS permissions required",
        };
      }

      return {
        translatedText: text,
        sourceLanguage,
        targetLanguage,
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      };
    }
  }

  static detectLanguage(text: string): "en" | "ms" {
    const cleanText = text.toLowerCase().trim();

    // Common Malay words and patterns
    const malayPatterns = [
      /\byang\b/,
      /\bdan\b/,
      /\bsaya\b/,
      /\badalah\b/,
      /\buntuk\b/,
      /\bdalam\b/,
      /\bini\b/,
      /\bitu\b/,
      /\bmaklumat\b/,
      /\bpelaburan\b/,
      /\bboleh\b/,
      /\bsyariah\b/,
      /\bhalal\b/,
      /\bharam\b/,
      /\bbank\b/,
      /\bwang\b/,
      /\bawan\b/,
      /\bkita\b/,
      /\bmereka\b/,
      /\bjuga\b/,
      /\btetapi\b/,
      /\bseperti\b/,
      /\bdengan\b/,
      /\bkepada\b/,
      /\bdari\b/,
      /\bpada\b/,
    ];

    // Count Malay pattern matches
    const malayMatches = malayPatterns.filter((pattern) =>
      pattern.test(cleanText)
    ).length;

    // If we find 2 or more Malay patterns, assume it's Malay
    return malayMatches >= 2 ? "ms" : "en";
  }

  /**
   * Get supported language pairs
   */
  static getSupportedLanguages() {
    return {
      languages: [
        { code: "en", name: "English", nativeName: "English" },
        { code: "ms", name: "Malay", nativeName: "Bahasa Melayu" },
      ],
      pairs: [
        { from: "en", to: "ms" },
        { from: "ms", to: "en" },
        { from: "auto", to: "en" },
        { from: "auto", to: "ms" },
      ],
    };
  }

  /**
   * Batch translate multiple texts
   */
  static async translateBatch(
    texts: string[],
    sourceLanguage: "en" | "ms" | "auto",
    targetLanguage: "en" | "ms"
  ): Promise<TranslationResponse[]> {
    const translations = await Promise.all(
      texts.map((text) =>
        this.translateText({ text, sourceLanguage, targetLanguage })
      )
    );
    return translations;
  }
}

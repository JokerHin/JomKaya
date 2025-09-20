import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

// Initialize the Translate client
const translateClient = new TranslateClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
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
      return {
        translatedText: text, // Return original text on error
        sourceLanguage,
        targetLanguage,
        success: false,
        error: error instanceof Error ? error.message : "Translation failed",
      };
    }
  }

  /**
   * Detect the language of the given text
   */
  static async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
    success: boolean;
    error?: string;
  }> {
    try {
      // For simple detection, we can use a basic heuristic
      // In a real implementation, you might want to use Amazon Comprehend
      const englishPattern = /^[a-zA-Z0-9\s.,!?'"()-]+$/;
      const hasEnglishWords =
        /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/i.test(text);

      if (englishPattern.test(text) && hasEnglishWords) {
        return {
          language: "en",
          confidence: 0.8,
          success: true,
        };
      } else {
        return {
          language: "ms",
          confidence: 0.7,
          success: true,
        };
      }
    } catch (error) {
      console.error("Language detection error:", error);
      return {
        language: "auto",
        confidence: 0,
        success: false,
        error:
          error instanceof Error ? error.message : "Language detection failed",
      };
    }
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

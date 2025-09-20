import { useState, useCallback } from "react";

interface TranslationHookReturn {
  translateText: (text: string, targetLanguage: "en" | "ms") => Promise<string>;
  isTranslating: boolean;
  error: string | null;
  currentLanguage: "en" | "ms" | "auto";
  setCurrentLanguage: (language: "en" | "ms") => void;
}

export function useTranslation(): TranslationHookReturn {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "ms" | "auto">(
    "auto"
  );

  const translateText = useCallback(
    async (text: string, targetLanguage: "en" | "ms"): Promise<string> => {
      setIsTranslating(true);
      setError(null);

      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            sourceLanguage: "auto",
            targetLanguage,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          // If it's a permission error with fallback, show a warning but don't throw
          if (data.fallback && data.translatedText) {
            console.warn("Translation service unavailable:", data.error);
            setError("Translation unavailable - showing original text");
            return data.translatedText; // Return original text
          }
          throw new Error(data.error || "Translation failed");
        }

        return data.translatedText;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Translation failed";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsTranslating(false);
      }
    },
    []
  );

  return {
    translateText,
    isTranslating,
    error,
    currentLanguage,
    setCurrentLanguage,
  };
}

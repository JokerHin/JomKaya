import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Bot, User } from "lucide-react";
import { MessageTranslation } from "@/components/translation-controls";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  isLoading?: boolean;
  enableTranslation?: boolean;
  onTranslate?: (text: string, targetLanguage: "en" | "ms") => Promise<string>;
}

export function ChatBubble({
  message,
  isUser,
  timestamp,
  isLoading,
  enableTranslation = false,
  onTranslate,
}: ChatBubbleProps) {
  const [translatedText, setTranslatedText] = useState<string>("");
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<"en" | "ms">("ms");

  const handleToggleTranslation = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (!onTranslate) return;

    setIsTranslating(true);
    try {
      const translated = await onTranslate(message, targetLanguage);
      setTranslatedText(translated);
      setIsTranslated(true);
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Auto-detect and set target language based on message content
  React.useEffect(() => {
    if (message) {
      const hasEnglishWords =
        /\b(the|and|or|but|in|on|at|to|for|of|with|by|investment|stock|shariah)\b/i.test(
          message
        );
      const englishPattern = /^[a-zA-Z0-9\s.,!?'"()-]+$/;

      if (englishPattern.test(message) && hasEnglishWords) {
        setTargetLanguage("ms"); // If message is in English, translate to Malay
      } else {
        setTargetLanguage("en"); // If message is in Malay, translate to English
      }
    }
  }, [message]);
  return (
    <div
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] sm:max-w-[75%] gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full text-sm font-medium shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
              : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Message bubble */}
        <Card
          className={cn(
            "px-4 py-3 shadow-sm border-0 min-w-0 break-words",
            isUser
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "bg-white dark:bg-card border border-amber-100 dark:border-amber-900/20"
          )}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"></div>
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce delay-100"></div>
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-muted-foreground">
                AI is thinking...
              </span>
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {isTranslated ? translatedText : message}
            </div>
          )}

          {timestamp && !isLoading && (
            <div
              className={cn(
                "mt-2 text-xs opacity-70",
                isUser ? "text-amber-100" : "text-muted-foreground"
              )}
            >
              {timestamp}
            </div>
          )}

          {/* Translation controls - only show for non-user messages and when translation is enabled */}
          {enableTranslation && !isUser && !isLoading && (
            <MessageTranslation
              originalText={message}
              translatedText={translatedText}
              isTranslated={isTranslated}
              onToggleTranslation={handleToggleTranslation}
              targetLanguage={targetLanguage}
              isTranslating={isTranslating}
            />
          )}
        </Card>
      </div>
    </div>
  );
}

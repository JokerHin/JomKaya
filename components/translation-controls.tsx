import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Languages, Loader2 } from "lucide-react";

interface TranslationControlsProps {
  onTranslate: (text: string, targetLanguage: "en" | "ms") => Promise<void>;
  isTranslating: boolean;
  currentLanguage: "en" | "ms" | "auto";
  onLanguageChange: (language: "en" | "ms") => void;
}

export function TranslationControls({
  isTranslating,
  currentLanguage,
  onLanguageChange,
}: TranslationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="text-xs bg-amber-50 border-amber-200 text-amber-700"
      >
        {currentLanguage === "en"
          ? "English"
          : currentLanguage === "ms"
          ? "Bahasa Melayu"
          : "Auto"}
      </Badge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-amber-200 hover:bg-amber-50"
            disabled={isTranslating}
          >
            {isTranslating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Languages className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onLanguageChange("en")}
            className="cursor-pointer"
          >
            🇺🇸 English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onLanguageChange("ms")}
            className="cursor-pointer"
          >
            🇲🇾 Bahasa Melayu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface MessageTranslationProps {
  originalText: string;
  translatedText?: string;
  isTranslated: boolean;
  onToggleTranslation: () => void;
  targetLanguage: "en" | "ms";
  isTranslating: boolean;
}

export function MessageTranslation({
  translatedText,
  isTranslated,
  onToggleTranslation,
  targetLanguage,
  isTranslating,
}: MessageTranslationProps) {
  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleTranslation}
        disabled={isTranslating}
        className="text-xs text-muted-foreground hover:text-amber-600 p-1 h-auto"
      >
        {isTranslating ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Translating...
          </>
        ) : isTranslated ? (
          `Show original`
        ) : (
          `Translate to ${
            targetLanguage === "en" ? "English" : "Bahasa Melayu"
          }`
        )}
      </Button>

      {isTranslated && translatedText && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-amber-700 font-medium">
              Translated to{" "}
              {targetLanguage === "en" ? "English" : "Bahasa Melayu"}
            </span>
          </div>
          <div className="text-sm text-amber-900 whitespace-pre-wrap">
            {translatedText}
          </div>
        </div>
      )}
    </div>
  );
}

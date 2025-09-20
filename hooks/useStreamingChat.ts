import { useState, useCallback } from "react";

interface StreamingChatHookReturn {
  sendMessage: (
    message: string,
    conversationHistory: Array<{ content: string; isUser: boolean }>,
    userId?: string,
    useStreaming?: boolean
  ) => Promise<string>;
  sendStreamingMessage: (
    message: string,
    conversationHistory: Array<{ content: string; isUser: boolean }>,
    userId?: string,
    onChunk?: (chunk: string) => void
  ) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

export function useStreamingChat(): StreamingChatHookReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      message: string,
      conversationHistory: Array<{ content: string; isUser: boolean }>,
      userId?: string,
      useStreaming = false
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversationHistory,
            userId,
            useStreaming,
          }),
        });

        const data = await response.json();

        if (data.success) {
          return data.message;
        } else {
          throw new Error(data.error || "Failed to get response");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Chat service error";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const sendStreamingMessage = useCallback(
    async (
      message: string,
      conversationHistory: Array<{ content: string; isUser: boolean }>,
      userId?: string,
      onChunk?: (chunk: string) => void
    ): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversationHistory,
            userId,
            useStreaming: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response stream available");
        }

        const decoder = new TextDecoder();
        let fullResponse = "";

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.error) {
                    throw new Error(data.error);
                  }

                  if (data.chunk) {
                    fullResponse += data.chunk;
                    onChunk?.(data.chunk);
                  }

                  if (data.done) {
                    return fullResponse;
                  }
                } catch (parseError) {
                  console.warn("Failed to parse streaming data:", parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        return fullResponse;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Streaming chat error";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    sendMessage,
    sendStreamingMessage,
    isLoading,
    error,
  };
}

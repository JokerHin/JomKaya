"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/chat-bubble";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";
import { TranslationControls } from "@/components/translation-controls";
import { useTranslation } from "@/hooks/useTranslation";
import { useStreamingChat } from "@/hooks/useStreamingChat";
import { TranslationService } from "@/lib/translate";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface UserProfile {
  riskTolerance?: string;
  investmentExperience?: string;
  timeHorizon?: string;
  investmentGoals?: string[];
  liquidityNeeds?: string;
}

interface UserMinimal {
  id: string;
  name: string;
  hasCompletedAssessment?: boolean;
}

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bedrockStatus, setBedrockStatus] = useState<
    "unknown" | "connected" | "offline"
  >("unknown");
  const { translateText, isTranslating, currentLanguage, setCurrentLanguage } =
    useTranslation();
  const { sendStreamingMessage } = useStreamingChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/assessment?userId=${user.id}`);
      const data = await response.json();
      if (data.success && data.profile) {
        setUserProfile(data.profile);
        const personalizedWelcome = getPersonalizedWelcome(user, data.profile);
        setMessages([personalizedWelcome]);
      } else {
        const welcomeMessage = getPersonalizedWelcome(user, null);
        setMessages([welcomeMessage]);
      }
    } catch {
      console.error("Failed to fetch user profile:");
      const basicWelcome = getPersonalizedWelcome(user, null);
      setMessages([basicWelcome]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.hasCompletedAssessment) {
      router.push("/assessment");
      return;
    }
    fetchUserProfile();
    checkBedrockStatus();
  }, [user, router, fetchUserProfile]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  // Clean AI response formatting
  const cleanAIResponse = (text: string): string => {
    return (
      text
        // Remove markdown headers (### ## #)
        .replace(/^#{1,6}\s+/gm, "")
        // Remove bold/italic markers (**text** *text*)
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        // Remove bullet points with asterisks
        .replace(/^\s*\*\s+/gm, "• ")
        // Clean up extra whitespace
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  };

  const checkBedrockStatus = async () => {
    try {
      const response = await fetch("/api/chat?action=health");
      const data = await response.json();
      setBedrockStatus(data.success ? "connected" : "offline");
    } catch {
      setBedrockStatus("offline");
    }
  };

  const getPersonalizedWelcome = (
    user: UserMinimal,
    profile: UserProfile | null
  ): Message => {
    let welcomeMessage = `Hello ${user.name}! 👋\n\nWelcome to JomKaya AI Assistant. I'm here to help you with Shariah-compliant investment guidance.\n\n`;

    if (profile) {
      welcomeMessage += `📊 **Your Investment Profile:**\n`;
      if (profile.riskTolerance) {
        welcomeMessage += `• Risk Tolerance: ${profile.riskTolerance}\n`;
      }
      if (profile.investmentExperience) {
        welcomeMessage += `• Investment Experience: ${profile.investmentExperience}\n`;
      }
      if (profile.timeHorizon) {
        welcomeMessage += `• Time Horizon: ${profile.timeHorizon}\n`;
      }
      if (profile.liquidityNeeds) {
        welcomeMessage += `• Liquidity Needs: ${profile.liquidityNeeds}\n`;
      }
      welcomeMessage += `\n✅ I'll provide personalized recommendations based on your profile.\n\n`;
      welcomeMessage += `💡 **I can help you with:**\n`;
      welcomeMessage += `• Personalized stock recommendations\n`;
      welcomeMessage += `• Portfolio allocation suggestions\n`;
      welcomeMessage += `• Shariah compliance explanations\n`;
      welcomeMessage += `• Investment strategy guidance\n\n`;
      welcomeMessage += `What would you like to know about investing today?`;
    } else {
      welcomeMessage += `I can help you with general Shariah-compliant investment questions including:\n\n`;
      welcomeMessage += `🔍 **Topics I cover:**\n`;
      welcomeMessage += `• Shariah compliance principles\n`;
      welcomeMessage += `• Stock screening criteria\n`;
      welcomeMessage += `• Prohibited sectors\n`;
      welcomeMessage += `• Investment strategies\n\n`;
      welcomeMessage += `For personalized recommendations, please complete your investor assessment first.\n\nWhat would you like to know?`;
    }

    return {
      id: "welcome",
      content: welcomeMessage,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const getPersonalizedResponse = (userQuestion: string): string => {
    const question = userQuestion.toLowerCase();

    if (
      userProfile &&
      (question.includes("recommend") || question.includes("suggest"))
    ) {
      return getProfileBasedRecommendation(userProfile, question);
    }
    if (
      userProfile &&
      (question.includes("portfolio") || question.includes("allocation"))
    ) {
      return getPortfolioAllocation(userProfile);
    }
    return getStandardResponse(question);
  };

  const getProfileBasedRecommendation = (
    profile: UserProfile | null,
    question?: string
  ): string => {
    if (!profile) {
      return getStandardResponse(question || "");
    }
    let response = `Based on your ${
      profile.riskTolerance || "moderate"
    } risk profile, here are my recommendations:\n\n`;
    const riskLevel = profile.riskTolerance || "Moderate";

    if (riskLevel === "Conservative") {
      response += `🛡️ **Conservative Portfolio (Suitable for you):**\n`;
      response += `• **REITs (40%):** Al-Aqar Healthcare REIT, Axis REIT\n`;
      response += `• **Blue-chip stocks (35%):** Maybank, Public Bank, Tenaga Nasional\n`;
      response += `• **Islamic bonds (25%):** Government and corporate sukuk\n\n`;
      response += `This allocation prioritizes capital preservation with steady income.`;
    } else if (riskLevel === "Moderate") {
      response += `⚖️ **Balanced Portfolio (Suitable for you):**\n`;
      response += `• **Growth stocks (45%):** MYEG, Genting Malaysia, IHH Healthcare\n`;
      response += `• **REITs (25%):** Sunway REIT, KLCC REIT\n`;
      response += `• **Blue-chip stocks (30%):** CIMB, Axiata, MMC Corp\n\n`;
      response += `This balanced approach offers growth potential with manageable risk.`;
    } else {
      response += `🚀 **Growth Portfolio (Suitable for you):**\n`;
      response += `• **Tech & Growth (60%):** MYEG, Pentamaster, VSTECS\n`;
      response += `• **Emerging sectors (25%):** Healthcare, renewable energy\n`;
      response += `• **Blue-chip anchor (15%):** Maybank, Public Bank\n\n`;
      response += `This aggressive allocation targets higher returns for long-term growth.`;
    }

    response += `\n\n✅ All recommendations are Shariah-compliant securities from the SC Malaysia approved list.`;
    response += `\n\n⚠️ **Important:** This is general guidance. Please consult with a licensed financial advisor before making investment decisions.`;
    return response;
  };

  const getPortfolioAllocation = (profile: UserProfile | null): string => {
    if (!profile) return getStandardResponse("");
    const riskLevel = profile.riskTolerance || "Moderate";
    const timeHorizon = profile.timeHorizon || "5-10 years";
    let response = `Based on your ${riskLevel.toLowerCase()} risk profile and ${timeHorizon} investment horizon:\n\n`;

    if (riskLevel === "Conservative") {
      response += `📊 **Conservative Allocation:**\n`;
      response += `• Fixed Income/Sukuk: 50%\n`;
      response += `• REITs: 30%\n`;
      response += `• Blue-chip stocks: 20%\n`;
    } else if (riskLevel === "Moderate") {
      response += `📊 **Moderate Allocation:**\n`;
      response += `• Equities: 60%\n`;
      response += `• REITs: 25%\n`;
      response += `• Fixed Income: 15%\n`;
    } else {
      response += `📊 **Aggressive Allocation:**\n`;
      response += `• Growth stocks: 70%\n`;
      response += `• REITs: 20%\n`;
      response += `• Cash/Fixed Income: 10%\n`;
    }

    response += `\n💡 This allocation considers your investment timeline and risk tolerance.`;
    response += `\n\n🔄 **Rebalancing:** Review and adjust quarterly to maintain target allocation.`;
    return response;
  };

  const getStandardResponse = (question: string): string => {
    if (
      question.includes("maybank") ||
      question.includes("public bank") ||
      question.includes("bank")
    ) {
      return "Most major Malaysian banks like Maybank, CIMB, and Public Bank are generally Shariah-compliant. However, they do have conventional banking operations, so Islamic scholars may have varying opinions. I recommend checking the latest Securities Commission Malaysia's Shariah-compliant securities list for the most current status.\n\n📊 **Quick tip:** Banks often have both conventional and Islamic subsidiaries, so compliance can vary by specific entity.";
    }
    if (
      question.includes("prohibited") ||
      question.includes("haram") ||
      question.includes("forbidden")
    ) {
      return "The main prohibited sectors in Islamic finance include:\n\n🚫 **Clearly Prohibited:**\n• Conventional banking & insurance\n• Gambling and casinos\n• Alcohol production\n• Tobacco companies\n• Adult entertainment\n• Pork-related businesses\n\n⚠️ **Financial Screening:**\n• Companies with excessive debt (>33% debt-to-equity)\n• High interest income (>5% of total income)\n\nWould you like more details about any specific sector?";
    }
    if (question.includes("screening") || question.includes("criteria")) {
      return "Shariah screening involves both qualitative and quantitative filters:\n\n**🔍 Qualitative Screening:**\n• Business activities must be halal\n• No involvement in prohibited sectors\n• Company's core business should be permissible\n\n**📊 Quantitative Screening:**\n• Debt ratio: Usually <33% of total equity\n• Interest income: <5% of total income\n• Non-compliant income: <5% of total income\n• Cash & interest-bearing securities: <33% of total assets\n\nThe Securities Commission Malaysia updates these criteria regularly based on contemporary scholarship.";
    }
    return "Thank you for your question! 🤖\n\nAs an AI assistant, I provide general guidance based on common Shariah principles and practices in Malaysia. For specific investment decisions, please:\n\n📋 **Always consult:**\n• Latest Securities Commission Malaysia's Shariah-compliant securities list\n• Qualified Islamic scholars\n• Certified Islamic financial advisors\n\n🔍 **I can help you with:**\n• General Shariah compliance principles\n• Sector analysis\n• Screening criteria explanations\n• Investment concepts in Islamic finance\n\nWhat specific aspect of Shariah-compliant investing would you like to explore?";
  };

  const handleTranslate = async (text: string, targetLanguage: "en" | "ms") => {
    try {
      await translateText(text, targetLanguage);
    } catch (_error) {
      console.error("Translation failed:", _error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const currentInput = input;
    const aiMessageId = (Date.now() + 1).toString();

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Scroll to bottom after adding user message
    setTimeout(scrollToBottom, 100);

    // Add empty AI message that will be updated with streaming content
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      // Prepare conversation history (exclude welcome message)
      const conversationHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          content: msg.content,
          isUser: msg.isUser,
        }));

      let finalResponse = "";

      // Use streaming for better UX
      await sendStreamingMessage(
        currentInput,
        conversationHistory,
        user.id,
        (chunk: string) => {
          // Update the AI message with each chunk
          finalResponse += chunk;
          const cleanedResponse = cleanAIResponse(finalResponse);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessageId
                ? { ...msg, content: cleanedResponse }
                : msg
            )
          );
          // Auto-scroll as content updates
          setTimeout(scrollToBottom, 50);
        }
      );

      // After streaming is complete, check if we need to auto-translate
      if (finalResponse) {
        const userInputLanguage =
          TranslationService.detectLanguage(currentInput);
        const responseLanguage =
          TranslationService.detectLanguage(finalResponse);

        // If languages don't match and we have translation enabled, auto-translate
        if (
          userInputLanguage !== responseLanguage &&
          currentLanguage !== "auto"
        ) {
          try {
            const translatedResponse = await translateText(
              finalResponse,
              userInputLanguage
            );
            if (translatedResponse && translatedResponse !== finalResponse) {
              const cleanedTranslation = cleanAIResponse(translatedResponse);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMessageId
                    ? { ...msg, content: cleanedTranslation }
                    : msg
                )
              );
              setTimeout(scrollToBottom, 100);
            }
          } catch {
            console.log("Auto-translation failed, keeping original response");
          }
        }
      }
    } catch (_error) {
      console.error("Failed to send message:", _error);
      setBedrockStatus("offline");

      // Fallback to mock response on error
      const response = getPersonalizedResponse(currentInput);
      const cleanedResponse = cleanAIResponse(
        response +
          "\n\n⚠️ *Using offline mode - AI service temporarily unavailable*"
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: cleanedResponse,
              }
            : msg
        )
      );
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) {
    return (
      <Layout hideFooter={true}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please log in to access the personalized investment chat.
              </p>
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user.hasCompletedAssessment) {
    return (
      <Layout hideFooter={true}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Assessment Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please complete your investor suitability assessment to receive
                personalized recommendations.
              </p>
              <Button asChild>
                <Link href="/assessment">Complete Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter={true}>
      <div className="h-[calc(100vh-4rem)] w-full flex flex-col">
        <Card className="flex-1 flex flex-col bg-gradient-to-b from-white to-amber-50/30 dark:from-card dark:to-amber-950/10 border-amber-200 rounded-none md:rounded-lg md:m-4 h-full">
          <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shrink-0">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <div
                  className={`w-3 h-3 rounded-full ${
                    bedrockStatus === "connected"
                      ? "bg-green-400 animate-pulse"
                      : bedrockStatus === "offline"
                      ? "bg-red-400"
                      : "bg-yellow-400 animate-pulse"
                  }`}
                ></div>
              </div>
              <div className="flex flex-col">
                <span>JomKaya AI Assistant</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {bedrockStatus === "connected"
                    ? "🤖 Nova Pro • Online"
                    : bedrockStatus === "offline"
                    ? "📱 Offline Mode"
                    : "🔄 Connecting..."}
                </span>
              </div>
              <span className="text-sm font-normal text-muted-foreground ml-auto mr-4">
                Personalized for {user.name}
              </span>
              <TranslationControls
                onTranslate={handleTranslate}
                isTranslating={isTranslating}
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
              />
            </CardTitle>
          </CardHeader>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 w-full">
            <div className="space-y-4  mx-auto">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  message={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  enableTranslation={true}
                  onTranslate={translateText}
                />
              ))}
              {isLoading && (
                <ChatBubble
                  message=""
                  isUser={false}
                  timestamp=""
                  isLoading={true}
                  enableTranslation={false}
                />
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-amber-100 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-950/10 dark:to-orange-950/10 shrink-0">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentLanguage === "ms"
                    ? "Tanya tentang pelaburan patuh Syariah..."
                    : "Ask about Shariah-compliant investments..."
                }
                className="flex-1 border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center max-w-4xl mx-auto">
              Press Enter to send • Educational guidance only - consult
              professionals for investment decisions
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

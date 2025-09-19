"use client";

import { useState, useEffect } from "react";
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

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.hasCompletedAssessment) {
      router.push("/assessment");
      return;
    }

    // Initialize with personalized welcome message
    const personalizedWelcome = getPersonalizedWelcome(user);
    setMessages([personalizedWelcome]);
  }, [user, router]);

  const getPersonalizedWelcome = (user: any): Message => {
    const assessment = user.assessmentData;
    let welcomeMessage = `Hello ${user.name}! 👋\n\nBased on your investment profile, I'm here to help you with personalized Shariah-compliant investment advice.\n\n`;
    
    if (assessment) {
      welcomeMessage += `📊 **Your Profile:**\n`;
      welcomeMessage += `• Risk Tolerance: ${assessment.riskTolerance}\n`;
      welcomeMessage += `• Investment Experience: ${assessment.investmentExperience}\n`;
      welcomeMessage += `• Investment Horizon: ${assessment.investmentHorizon}-term\n`;
      welcomeMessage += `• Monthly Investment: RM${assessment.monthlyInvestmentAmount}\n\n`;
      
      if (assessment.shariahCompliantOnly) {
        welcomeMessage += `✅ I'll only recommend Shariah-compliant investments as per your preference.\n\n`;
      }
      
      welcomeMessage += `💡 **I can help you with:**\n`;
      welcomeMessage += `• Personalized stock recommendations\n`;
      welcomeMessage += `• Portfolio allocation suggestions\n`;
      welcomeMessage += `• Sector-specific advice\n`;
      welcomeMessage += `• Investment strategy based on your goals\n\n`;
      welcomeMessage += `What would you like to know about investing today?`;
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

  const getPersonalizedResponse = (userQuestion: string, user: any): string => {
    const assessment = user.assessmentData;
    const question = userQuestion.toLowerCase();
    
    if (question.includes("recommend") || question.includes("suggest")) {
      let response = `Based on your ${assessment.riskTolerance} risk profile and ${assessment.investmentExperience} experience level, here are my recommendations:\n\n`;
      
      if (assessment.riskTolerance === "conservative") {
        response += `🛡️ **Conservative Portfolio (Suitable for you):**\n`;
        response += `• **REITs (40%):** Al-Aqar Healthcare REIT, Axis REIT\n`;
        response += `• **Blue-chip stocks (35%):** Maybank, Public Bank, Tenaga Nasional\n`;
        response += `• **Fixed income (25%):** Islamic bonds, sukuk\n\n`;
      } else if (assessment.riskTolerance === "moderate") {
        response += `⚖️ **Balanced Portfolio (Suitable for you):**\n`;
        response += `• **Growth stocks (45%):** MYEG, Genting Malaysia, IHH Healthcare\n`;
        response += `• **REITs (25%):** Sunway REIT, KLCC REIT\n`;
        response += `• **Blue-chip stocks (30%):** CIMB, Axiata, MMC Corp\n\n`;
      } else {
        response += `🚀 **Growth Portfolio (Suitable for you):**\n`;
        response += `• **Tech & Growth (60%):** MYEG, Pentamaster, VSTECS\n`;
        response += `• **Emerging sectors (25%):** Glove stocks, renewable energy\n`;
        response += `• **Blue-chip anchor (15%):** Maybank, Public Bank\n\n`;
      }
      
      response += `💰 **Monthly Investment Strategy (RM${assessment.monthlyInvestmentAmount}):**\n`;
      response += `Consider dollar-cost averaging across these sectors based on your ${assessment.investmentHorizon}-term horizon.\n\n`;
      
      if (assessment.preferredSectors?.length > 0) {
        response += `🎯 **Your Preferred Sectors:** ${assessment.preferredSectors.join(", ")}\n`;
        response += `I've included recommendations from these sectors where possible.\n\n`;
      }
      
      response += `⚠️ **Important:** This is general guidance. Please consult with a licensed financial advisor before making investment decisions.`;
      
      return response;
    }
    
    // Return existing response logic for other questions
    return getStandardResponse(question);
  };

  const getStandardResponse = (userQuestion: string): string => {
    if (
      userQuestion.includes("maybank") ||
      userQuestion.includes("public bank") ||
      userQuestion.includes("bank")
    ) {
      return "Most major Malaysian banks like Maybank, CIMB, and Public Bank are generally Shariah-compliant. However, they do have conventional banking operations, so Islamic scholars may have varying opinions. I recommend checking the latest Securities Commission Malaysia's Shariah-compliant securities list for the most current status.\n\n📊 **Quick tip:** Banks often have both conventional and Islamic subsidiaries, so compliance can vary by specific entity.";
    } else if (
      userQuestion.includes("prohibited") ||
      userQuestion.includes("haram") ||
      userQuestion.includes("forbidden")
    ) {
      return "The main prohibited sectors in Islamic finance include:\n\n🚫 **Clearly Prohibited:**\n• Conventional banking & insurance\n• Gambling and casinos\n• Alcohol production\n• Tobacco companies\n• Entertainment (adult entertainment)\n• Pork-related businesses\n\n⚠️ **Financial Screening:**\n• Companies with excessive debt (>33% debt-to-equity)\n• High interest income (>5% of total income)\n\nWould you like more details about any specific sector?";
    } else if (
      userQuestion.includes("screening") ||
      userQuestion.includes("criteria")
    ) {
      return "Shariah screening involves both qualitative and quantitative filters:\n\n**🔍 Qualitative Screening:**\n• Business activities must be halal\n• No involvement in prohibited sectors\n• Company's core business should be permissible\n\n**📊 Quantitative Screening:**\n• Debt ratio: Usually <33% of total equity\n• Interest income: <5% of total income\n• Non-compliant income: <5% of total income\n• Cash & interest-bearing securities: <33% of total assets\n\nThe Securities Commission Malaysia updates these criteria regularly based on contemporary scholarship.";
    } else {
      return "Thank you for your question! 🤖\n\nAs an AI assistant, I provide general guidance based on common Shariah principles and practices in Malaysia. For specific investment decisions, please:\n\n📋 **Always consult:**\n• Latest Securities Commission Malaysia's Shariah-compliant securities list\n• Qualified Islamic scholars\n• Certified Islamic financial advisors\n\n🔍 **I can help you with:**\n• General Shariah compliance principles\n• Sector analysis\n• Screening criteria explanations\n• Investment concepts in Islamic finance\n\nWhat specific aspect of Shariah-compliant investing would you like to explore?";
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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Generate personalized AI response
    setTimeout(() => {
      const response = getPersonalizedResponse(input, user);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
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
                Please complete your investor suitability assessment to receive personalized recommendations.
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
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              JomKaya AI Assistant
              <span className="text-sm font-normal text-muted-foreground bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                ✨ Demo
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6 min-h-full">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message.content}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                  />
                ))}
                {isLoading && (
                  <ChatBubble message="" isUser={false} isLoading={true} />
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t border-amber-100 p-4 bg-amber-50/50 dark:bg-amber-950/10 shrink-0">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about Shariah-compliant stocks, sectors, or Islamic finance principles..."
                className="flex-1 border-amber-200 focus:border-amber-400 bg-white"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center max-w-4xl mx-auto">
              Press Enter to send, Shift+Enter for new line • Demo mode -
              consult official sources for investment decisions
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

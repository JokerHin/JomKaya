import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Shield,
  Sparkles,
  BookOpen,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Layout } from "@/components/layout";

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20" />
        <div className="container relative w-full max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8 w-full">
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl shadow-amber-500/25">
                    <Shield className="h-10 w-10" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20"></div>
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block mb-2">Your AI Assistant for</span>
                <span className="block bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Shariah-Compliant Investments
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                Get instant answers about Shariah-compliant securities in
                Malaysia. Ask about stock compliance, sectors, and Islamic
                screening rules with our AI-powered assistant.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
              >
                <Link href="/chat">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Try the Chatbot
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-amber-200 hover:bg-amber-50"
              >
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 w-full">
        <div className="container w-full max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Why Choose JomKaya?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powered by AI and official data from Securities Commission
              Malaysia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full">
            <Card className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-200 w-full">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Official Data</CardTitle>
                <CardDescription className="text-base">
                  Information sourced directly from Securities Commission
                  Malaysia's official Shariah-compliant securities list
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-200 w-full">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">AI-Powered</CardTitle>
                <CardDescription className="text-base">
                  Smart assistant that understands your questions and provides
                  clear, accurate answers about Islamic finance principles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-amber-100 hover:border-amber-200 w-full">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">Easy to Use</CardTitle>
                <CardDescription className="text-base">
                  Simple chat interface - just ask questions in plain English
                  and get instant, helpful responses
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 w-full">
        <div className="container w-full max-w-7xl mx-auto px-4">
          <Card className="bg-gradient-to-br from-white to-amber-50/50 dark:from-card dark:to-amber-950/10 border-amber-200 shadow-xl w-full">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Ready to Start Your Shariah-Compliant Investment Journey?
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Ask questions like "Is Maybank Shariah-compliant?" or "What
                sectors are typically halal?" and get instant answers.
              </p>
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
              >
                <Link href="/chat">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Start Chatting Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}

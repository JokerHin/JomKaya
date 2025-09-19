import Link from "next/link";
import {
  Shield,
  BookOpen,
  TrendingUp,
  Scale,
  Globe,
  Lightbulb,
  ExternalLink,
  ArrowRight,
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

export default function AboutPage() {
  return (
    <Layout>
      <div className="w-full">
        <div className="container max-w-7xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16 w-full">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl shadow-amber-500/25">
                  <Shield className="h-10 w-10" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                JomKaya
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your trusted AI assistant for navigating Shariah-compliant
              investments in Malaysia's dynamic financial markets.
            </p>
          </div>

          {/* Mission Section */}
          <Card className="mb-12 border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 w-full">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-amber-900 dark:text-amber-100">
                    Our Mission
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We believe that ethical investing should be accessible to
                    everyone. JomKaya bridges the gap between Islamic finance
                    principles and modern technology, making Shariah-compliant
                    investment information readily available to Malaysian
                    investors.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    By combining AI technology with official data sources, we
                    empower investors to make informed decisions that align with
                    their values and faith.
                  </p>
                </div>
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center">
                      <Scale className="h-16 w-16 text-amber-600" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur opacity-10"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We Offer */}
          <div className="mb-12 w-full">
            <h2 className="text-3xl font-bold text-center mb-8">
              What We Offer
            </h2>
            <div className="grid md:grid-cols-3 gap-6 w-full">
              <Card className="border-amber-100 hover:shadow-lg transition-all duration-300 group w-full">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Educational Content</CardTitle>
                  <CardDescription>
                    Learn about Islamic finance principles, screening criteria,
                    and investment guidelines in plain language.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-amber-100 hover:shadow-lg transition-all duration-300 group w-full">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">Stock Analysis</CardTitle>
                  <CardDescription>
                    Get insights about specific stocks, sectors, and their
                    compliance status based on current screening criteria.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-amber-100 hover:shadow-lg transition-all duration-300 group w-full">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">AI Guidance</CardTitle>
                  <CardDescription>
                    Ask questions naturally and receive instant, contextual
                    answers powered by artificial intelligence.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Important Disclaimer */}
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-950/10 dark:to-red-950/10 w-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3 text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Important Disclaimer
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong>
                    This is a demo application for educational purposes.
                  </strong>{" "}
                  JomKaya provides general guidance based on publicly available
                  information and common Islamic finance principles.
                </p>
                <p>
                  <strong>Not Financial Advice:</strong> The information
                  provided should not be considered as financial advice or
                  investment recommendations. Always conduct your own research
                  and consult with qualified professionals.
                </p>
                <p>
                  <strong>Verify Information:</strong> Investment compliance can
                  change frequently. Always verify the latest information from
                  official sources like the Securities Commission Malaysia
                  before making investment decisions.
                </p>
                <p>
                  <strong>Consult Experts:</strong> For specific Islamic finance
                  rulings or complex investment scenarios, consult qualified
                  Islamic scholars or certified Islamic financial advisors.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12 w-full">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Start Learning?
            </h3>
            <p className="text-muted-foreground mb-6">
              Try our AI assistant and discover how Shariah-compliant investing
              can work for you.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
            >
              <Link href="/chat">
                Start Chatting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

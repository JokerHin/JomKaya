"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout";
import { useAuth } from "@/components/auth-provider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    const success = await login(email, password);
    if (success) {
      router.push("/assessment");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20" />
        <div className="container relative max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Header Section */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-2xl shadow-amber-500/25">
                      <Shield className="h-8 w-8" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-20"></div>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Welcome{" "}
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    Back
                  </span>
                </h1>
                <p className="text-muted-foreground">
                  Sign in to access your personalized investment recommendations
                </p>
              </div>

              <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10 shadow-xl">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/register"
                        className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-4"
                      >
                        Create one here
                      </Link>
                    </p>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Demo credentials: Use any email and password to continue
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

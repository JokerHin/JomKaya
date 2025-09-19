"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, CheckCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/components/auth-provider";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="flex flex-row h-14 w-full items-center justify-between px-5">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <div className="flex h-6 items-center justify-center rounded-md text-orange-400 text-xl font-bold">
              JomKaya
            </div>
            <span className="hidden font-bold sm:inline-block ml-2">
              Chatbot
            </span>
          </Link>
        </div>
        <div className="hidden md:flex">
          <nav className="flex items-center text-sm font-medium space-x-8">
            <Link
              href="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              href="/chat"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/chat" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Chatbot
            </Link>
            <Link
              href="/about"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/about" ? "text-foreground" : "text-foreground/60"
              )}
            >
              About
            </Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-muted">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">{user.name}</span>
                {user.hasCompletedAssessment && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end md:hidden">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
                J
              </div>
              <span className="font-bold">JomKaya</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <Button asChild variant="ghost" size="sm">
                <Link href="/chat">Chat</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/about">About</Link>
              </Button>
              {!user && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
              )}
              {user && (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-3 w-3" />
                </Button>
              )}
            </div>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

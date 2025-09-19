import * as React from "react";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
}

export function Layout({
  children,
  className,
  hideFooter = false,
}: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className={cn("flex-1", className)}>{children}</main>
      {!hideFooter && (
        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-12 md:flex-row md:py-0">
            <div className="flex flex-col items-center gap-4 px-8 justify-center">
              <p className="text-center text-sm leading-loose text-muted-foreground ">
                Built for educational purposes. Data sourced from{" "}
                <a
                  href="https://www.sc.com.my"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  Securities Commission Malaysia
                </a>
                .
              </p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>© 2024 JomKaya</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

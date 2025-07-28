// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import '@/lib/startup'; // Initialize the system

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "نظام إدارة الحضور المتطور",
  description: "نظام شامل لإدارة الحضور والمدفوعات بتقنية 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col bg-background">
          <Nav />
          <main className="flex-grow">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-border/50 bg-muted/30 py-8 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p className="text-muted-foreground text-sm">
                © 2025 نظام إدارة الحضور المتطور. جميع الحقوق محفوظة.
              </p>
              <p className="text-muted-foreground text-xs mt-2">
                مصمم بأحدث تقنيات 2025 للتعليم الرقمي
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

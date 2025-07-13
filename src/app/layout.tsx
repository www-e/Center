// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";  // Import the new Client Component

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "نظام إدارة الحضور",
  description: "نظام إدارة الحضور والمدفوعات",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <header className="bg-white shadow-md">
            <Nav />  {/* Use the new Client-side Nav here */}
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

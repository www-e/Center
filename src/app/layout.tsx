// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
      <body className={cn(inter.className, "bg-gray-100 text-gray-900")}>
        <div className="flex min-h-screen flex-col">
          <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-xl font-bold text-gray-800">
                <Link href="/">نظام الحضور</Link>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <Link href="/students" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  الطلاب
                </Link>
                <Link href="/attendance" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  الحضور
                </Link>
                <Link href="/payments" className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                  المدفوعات
                </Link>
              </div>
            </nav>
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { useState } from "react";  // For mobile menu state
import { usePathname } from "next/navigation";  // For active links
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
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <html lang="ar" dir="rtl">
      <body className={cn(inter.className, "bg-gray-100 text-gray-900")}>
        <div className="flex min-h-screen flex-col">
          <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-xl font-bold text-primary">
                <Link href="/">نظام الحضور</Link>
              </div>
              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-4 space-x-reverse">
                <Link href="/students" className={cn("px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/students" ? "bg-neutral text-primary" : "text-foreground")}>
                  {/* Icon placeholder */} <span className="mr-1">👥</span> الطلاب
                </Link>
                <Link href="/attendance" className={cn("px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/attendance" ? "bg-neutral text-primary" : "text-foreground")}>
                  {/* Icon placeholder */} <span className="mr-1">📅</span> الحضور
                </Link>
                <Link href="/payments" className={cn("px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/payments" ? "bg-neutral text-primary" : "text-foreground")}>
                  {/* Icon placeholder */} <span className="mr-1">💰</span> المدفوعات
                </Link>
              </div>
              {/* Mobile Menu Button */}
              <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {/* Hamburger Icon */} ☰
              </button>
            </nav>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-2">
                <Link href="/students" className={cn("block px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/students" ? "bg-neutral text-primary" : "text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  👥 الطلاب
                </Link>
                <Link href="/attendance" className={cn("block px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/attendance" ? "bg-neutral text-primary" : "text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  📅 الحضور
                </Link>
                <Link href="/payments" className={cn("block px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral transition-smooth", pathname === "/payments" ? "bg-neutral text-primary" : "text-foreground")} onClick={() => setIsMobileMenuOpen(false)}>
                  💰 المدفوعات
                </Link>
              </div>
            )}
          </header>
          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

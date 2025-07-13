// src/components/nav.tsx
"use client";  // Mark as Client Component

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Nav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
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
    </>
  );
}

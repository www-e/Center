// src/components/nav.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Menu, 
  X, 
  Home,
  GraduationCap,
  Bell,
  Settings,
  ChevronDown
} from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    {
      href: "/",
      label: "الرئيسية",
      icon: Home,
      active: pathname === "/"
    },
    {
      href: "/students",
      label: "الطلاب",
      icon: Users,
      active: pathname.startsWith("/students")
    },
    {
      href: "/attendance",
      label: "الحضور",
      icon: Calendar,
      active: pathname.startsWith("/attendance")
    },
    {
      href: "/payments",
      label: "المدفوعات",
      icon: CreditCard,
      active: pathname.startsWith("/payments")
    }
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-card border-border" 
          : "bg-background border-transparent"
      )}>
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link 
                href="/" 
                className="flex items-center space-x-3 space-x-reverse group transition duration-300"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:shadow-md transition-all">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    نظام الحضور
                  </h1>
                  <p className="text-xs text-muted-foreground">إدارة تعليمية متقدمة</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 space-x-reverse">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover-lift",
                      item.active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Notification Bell (Desktop) */}
              <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="h-4 w-4" />
              </button>

              {/* Settings (Desktop) */}
              <button className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Settings className="h-4 w-4" />
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "md:hidden flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                  isMobileMenuOpen
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border",
          isMobileMenuOpen 
            ? "max-h-96 opacity-100" 
            : "max-h-0 opacity-0"
        )}>
          <div className="bg-muted/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      item.active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile-only actions */}
              <div className="pt-2 border-t border-border/50 space-y-2">
                <button className="flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background w-full transition-all">
                  <Bell className="h-5 w-5" />
                  <span>الإشعارات</span>
                </button>
                <button className="flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background w-full transition-all">
                  <Settings className="h-5 w-5" />
                  <span>الإعدادات</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

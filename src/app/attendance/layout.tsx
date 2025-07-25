// src/app/attendance/layout.tsx
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "الحضور - نظام إدارة الحضور",
  description: "متابعة الحضور والغياب",
};

export default function AttendanceLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {children}  {/* This wraps the page content */}
    </div>
  );
}

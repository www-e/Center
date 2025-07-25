// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword } from '@/lib/payment-config';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { error: 'كلمة المرور مطلوبة' },
        { status: 400 }
      );
    }
    
    const isValid = validateAdminPassword(password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'كلمة مرور خاطئة' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
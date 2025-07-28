// src/app/api/admin/auto-absence/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { setGracePeriod } from '@/lib/auto-absence';

export async function POST(request: NextRequest) {
  try {
    const { gracePeriod } = await request.json();

    if (!gracePeriod || gracePeriod < 5 || gracePeriod > 60) {
      return NextResponse.json({
        success: false,
        message: 'المدة يجب أن تكون بين 5 و 60 دقيقة'
      }, { status: 400 });
    }

    const success = await setGracePeriod(gracePeriod);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'تم حفظ الإعدادات بنجاح'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'خطأ في حفظ الإعدادات'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error saving auto-absence settings:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم'
    }, { status: 500 });
  }
}
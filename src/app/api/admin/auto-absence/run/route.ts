// src/app/api/admin/auto-absence/run/route.ts
import { NextResponse } from 'next/server';
import { processAutoAbsences } from '@/lib/auto-absence';

export async function POST() {
  try {
    const result = await processAutoAbsences();
    
    return NextResponse.json({
      success: true,
      message: `تم تشغيل الفحص اليدوي بنجاح`,
      data: result
    });

  } catch (error) {
    console.error('Error running manual auto-absence check:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في تشغيل الفحص اليدوي'
    }, { status: 500 });
  }
}
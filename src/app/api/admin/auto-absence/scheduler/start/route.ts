// src/app/api/admin/auto-absence/scheduler/start/route.ts
import { NextResponse } from 'next/server';
import { startAutoAbsenceScheduler } from '@/lib/auto-absence';

export async function POST() {
  try {
    startAutoAbsenceScheduler();
    
    return NextResponse.json({
      success: true,
      message: 'تم تشغيل النظام التلقائي بنجاح'
    });

  } catch (error) {
    console.error('Error starting auto-absence scheduler:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في تشغيل النظام'
    }, { status: 500 });
  }
}
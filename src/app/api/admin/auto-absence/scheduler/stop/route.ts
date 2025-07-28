// src/app/api/admin/auto-absence/scheduler/stop/route.ts
import { NextResponse } from 'next/server';
import { stopAutoAbsenceScheduler } from '@/lib/auto-absence';

export async function POST() {
  try {
    stopAutoAbsenceScheduler();
    
    return NextResponse.json({
      success: true,
      message: 'تم إيقاف النظام التلقائي بنجاح'
    });

  } catch (error) {
    console.error('Error stopping auto-absence scheduler:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في إيقاف النظام'
    }, { status: 500 });
  }
}
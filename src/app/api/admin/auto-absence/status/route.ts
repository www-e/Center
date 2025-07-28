// src/app/api/admin/auto-absence/status/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSchedulerStatus } from '@/lib/auto-absence';

export async function GET() {
  try {
    // Get grace period setting
    const gracePeriodSetting = await prisma.adminSettings.findUnique({
      where: { settingKey: 'AUTO_ABSENCE_GRACE_PERIOD' }
    });
    
    const gracePeriod = gracePeriodSetting 
      ? parseInt(gracePeriodSetting.settingValue) 
      : 15;

    // Get scheduler status
    const schedulerStatus = getSchedulerStatus();

    // Get today's auto-absence count
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayMarked = await prisma.attendanceRecord.count({
      where: {
        status: 'ABSENT_AUTO',
        markedAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // Get total processed count
    const totalProcessed = await prisma.attendanceRecord.count({
      where: {
        status: 'ABSENT_AUTO'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        gracePeriod,
        isSchedulerRunning: schedulerStatus.isRunning,
        lastProcessed: schedulerStatus.nextRun?.toISOString(),
        todayMarked,
        totalProcessed
      }
    });

  } catch (error) {
    console.error('Error getting auto-absence status:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في تحميل حالة النظام'
    }, { status: 500 });
  }
}
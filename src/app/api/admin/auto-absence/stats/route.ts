// src/app/api/admin/auto-absence/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    
    // Today's stats
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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

    // This week's stats
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    
    const weekMarked = await prisma.attendanceRecord.count({
      where: {
        status: 'ABSENT_AUTO',
        markedAt: {
          gte: startOfWeek,
          lt: endOfDay
        }
      }
    });

    // This month's stats
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthMarked = await prisma.attendanceRecord.count({
      where: {
        status: 'ABSENT_AUTO',
        markedAt: {
          gte: startOfMonth,
          lt: endOfDay
        }
      }
    });

    // Overrides count
    const overrides = await prisma.attendanceRecord.count({
      where: {
        overriddenAt: {
          not: null
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        todayMarked,
        weekMarked,
        monthMarked,
        overrides
      }
    });

  } catch (error) {
    console.error('Error getting auto-absence stats:', error);
    return NextResponse.json({
      success: false,
      message: 'خطأ في تحميل الإحصائيات'
    }, { status: 500 });
  }
}
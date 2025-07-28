// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get current month/year
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get total students
    const totalStudents = await prisma.student.count();

    // Get payments for current month
    const monthlyPayments = await prisma.paymentRecord.count({
      where: {
        month: currentMonth,
        year: currentYear,
        isPaid: true,
      },
    });

    // Get monthly revenue
    const receipts = await prisma.receipt.findMany({
      where: {
        month: currentMonth,
        year: currentYear,
      },
    });

    const monthlyRevenue = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);

    // Get payment configs count
    const paymentConfigs = await prisma.paymentConfig.count();

    // Get recent activity (last 10 activities)
    const recentStudents = await prisma.student.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        grade: true,
        section: true,
        createdAt: true,
      },
    });

    const recentPayments = await prisma.receipt.findMany({
      take: 3,
      orderBy: { issuedAt: 'desc' },
      include: {
        paymentRecord: {
          include: {
            student: {
              select: { name: true },
            },
          },
        },
      },
    });

    const recentActivity = [
      ...recentStudents.map(student => ({
        type: 'student_added',
        description: `تم إضافة طالب جديد`,
        details: `${student.name} - ${student.grade} ${student.section || ''}`,
        timestamp: student.createdAt,
      })),
      ...recentPayments.map(receipt => ({
        type: 'payment_received',
        description: `تم تسجيل دفعة جديدة`,
        details: `${receipt.paymentRecord.student.name} - ${receipt.amount} ج.م`,
        timestamp: receipt.issuedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        monthlyPayments,
        monthlyRevenue,
        paymentConfigs,
        recentActivity,
        systemHealth: 'good', // This could be determined by various factors
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب إحصائيات الإدارة' },
      { status: 500 }
    );
  }
}
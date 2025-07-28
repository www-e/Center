// src/components/payments/payment-view.tsx
import { getStudentsWithMonthlyPayments, StudentFilters } from "@/lib/data";
import { MonthlyPaymentTable } from "@/components/monthly-payment-table";
import { Grade, GroupDay } from '@prisma/client';
import { PaymentControls } from "@/components/payment-controls";
import { MonthlyPaymentNavigation } from "@/components/monthly-payment-navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

export async function PaymentView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams to handle async nature in Next.js 15
  const params = await searchParams;

  const currentDate = new Date();
  const month = Number(params.month) || (currentDate.getMonth() + 1);
  const year = Number(params.year) || currentDate.getFullYear();

  const filters: StudentFilters = {
    grade: params.grade as Grade | undefined,
    groupDay: params.groupDay as GroupDay | undefined,
    groupTime: params.groupTime as string | undefined,
  };

  const studentsWithPayments = await getStudentsWithMonthlyPayments(year, month, filters);

  // Calculate monthly payment statistics
  const totalStudents = studentsWithPayments.length;
  let totalPaid = 0;
  let totalOverdue = 0;
  let totalRevenue = 0;

  studentsWithPayments.forEach(student => {
    const monthlyPayment = student.payments.find(p => p.month === month && p.year === year);
    if (monthlyPayment?.isPaid) {
      totalPaid++;
      // Get amount from receipt if available, otherwise use default
      const receipt = student.payments.find(p => p.receipt)?.receipt;
      totalRevenue += receipt?.amount || 200;
    } else {
      // Check if student was enrolled before this month
      const enrollmentDate = new Date(student.enrollmentDate);
      const targetDate = new Date(year, month - 1, 1);
      if (enrollmentDate <= targetDate) {
        totalOverdue++;
      }
    }
  });

  const paymentRate = totalStudents > 0 ? ((totalPaid / totalStudents) * 100) : 0;
  
  // Get month name in Arabic
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const currentMonthName = monthNames[month - 1];

  return (
    <div className="container space-y-4 animate-fade-in">
      {/* Compact Header with Navigation & Controls */}
      <Card className="modern-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">مدفوعات {currentMonthName} {year}</h1>
                <p className="text-xs text-muted-foreground">
                  {totalStudents} طالب • {totalPaid} مدفوع • {totalOverdue} متأخر • {totalRevenue.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MonthlyPaymentNavigation currentMonth={month} currentYear={year} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <PaymentControls />

      {/* Payment Table */}
      <MonthlyPaymentTable students={studentsWithPayments} month={month} year={year} />
    </div>
  );
}

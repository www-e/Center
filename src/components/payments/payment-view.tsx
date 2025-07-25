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
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-success/5 to-primary/5 rounded-2xl"></div>
        <Card className="shadow-elevated glass-effect relative">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-success rounded-3xl flex items-center justify-center">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              مدفوعات {currentMonthName} {year}
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              متابعة مدفوعات الشهر الحالي مع إمكانية التنقل بين الشهور وتسجيل دفعات جديدة
            </p>
            
            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Users className="h-3 w-3 mr-1" />
                {totalStudents} طالب
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                <DollarSign className="h-3 w-3 mr-1" />
                {totalRevenue.toLocaleString('ar-EG')} ج.م
              </Badge>
              {paymentRate > 0 && (
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {paymentRate.toFixed(1)}% دفع
                </Badge>
              )}
              {totalOverdue > 0 && (
                <Badge variant="outline" className="bg-error/10 text-error border-error/20">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {totalOverdue} متأخر
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Monthly Navigation */}
      <MonthlyPaymentNavigation currentMonth={month} currentYear={year} />

      {/* Controls Section */}
      <PaymentControls />

      {/* Monthly Payment Table */}
      <MonthlyPaymentTable students={studentsWithPayments} month={month} year={year} />
    </div>
  );
}

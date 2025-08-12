import { getStudentsWithMonthlyPayments, getAvailableGroupTimes, StudentFilters } from "@/lib/data";
import { Grade, GroupDay, PaymentRecord, Receipt, Student } from '@prisma/client';
import { FilterControls } from '@/components/filter-controls'; // Corrected import
import { MonthlyPaymentNavigation } from "@/components/monthly-payment-navigation";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, Users, BarChart, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MonthlyPaymentTable } from '@/components/monthly-payment-table';

// Helper type based on your Prisma Schema
type StudentWithPayments = Student & {
  payments: (PaymentRecord & { receipt: Receipt | null })[];
};

export async function PaymentView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = searchParams;
  const year = Number(params.year) || new Date().getFullYear();
  const month = Number(params.month) || new Date().getMonth() + 1;

  const filters: StudentFilters = {
    grade: params.grade as Grade | undefined,
    groupDay: params.groupDay as GroupDay | undefined,
    groupTime: params.groupTime as string | undefined,
  };

  const [studentsWithPayments, availableGroupTimes] = await Promise.all([
    getStudentsWithMonthlyPayments(year, month, filters),
    getAvailableGroupTimes(),
  ]);

  // Calculate payment statistics
  const totalStudents = studentsWithPayments.length;
  let paidStudents = 0;
  let totalRevenue = 0;

  studentsWithPayments.forEach((student: StudentWithPayments) => {
    // A student is considered paid for the month if they have a payment record for that month which is paid.
    const hasPaid = student.payments.some(p => p.isPaid && p.month === month && p.year === year);
    if (hasPaid) {
      paidStudents++;
      // Sum revenue from the receipt associated with this month's payment.
      student.payments.forEach(p => {
        if (p.isPaid && p.month === month && p.year === year && p.receipt) {
          totalRevenue += p.receipt.amount;
        }
      });
    }
  });

  const paidPercentage = totalStudents > 0 ? (paidStudents / totalStudents) * 100 : 0;
  const currentMonthName = new Date(year, month - 1).toLocaleString('ar-EG', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <Card className="shadow-elevated glass-effect">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-success rounded-3xl flex items-center justify-center">
            <CreditCard className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            تحصيلات شهر {currentMonthName}
          </CardTitle>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            عرض حالة الدفع للطلاب، وتصفيتهم، وتسجيل المدفوعات الجديدة باستخدام ماسح الكود.
          </p>

          {/* Stats Badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Users className="h-3 w-3 mr-1" />
              {totalStudents} طالب مسجل
            </Badge>
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <BarChart className="h-3 w-3 mr-1" />
              {paidPercentage.toFixed(1)}% مدفوع ({paidStudents} طالب)
            </Badge>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
              <DollarSign className="h-3 w-3 mr-1" />
              {totalRevenue.toLocaleString('ar-EG')} جنيه إجمالي
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation & Controls */}
      <MonthlyPaymentNavigation month={month} year={year} basePath="/payments" />
      <FilterControls groupTimes={availableGroupTimes} />

      <MonthlyPaymentTable
        students={studentsWithPayments}
        month={month}
        year={year}
      />
    </div>
  );
}
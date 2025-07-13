// src/components/payments/payment-view.tsx
import { getStudentsWithPayments, StudentFilters } from "@/lib/data";
import { PaymentTable } from "@/components/payment-table";
import { Grade, GroupDay } from '@prisma/client';
import { PaymentControls } from "@/components/payment-controls";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function PaymentView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams to handle async nature in Next.js 15
  const params = await searchParams;

  const year = Number(params.year) || new Date().getFullYear();

  const filters: StudentFilters = {
    grade: params.grade as Grade | undefined,
    groupDay: params.groupDay as GroupDay | undefined,
    groupTime: params.groupTime as string | undefined,
  };

  const studentsWithPayments = await getStudentsWithPayments(year, filters);

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader className="flex items-center justify-between" dir="rtl">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">متابعة المدفوعات لسنة: {year}</CardTitle>
            <p className="text-neutral mt-1">عرض وتسجيل المدفوعات الشهرية للطلاب.</p>
          </div>
        </CardHeader>
      </Card>
      <PaymentControls />
      <PaymentTable students={studentsWithPayments} year={year} />
    </div>
  );
}

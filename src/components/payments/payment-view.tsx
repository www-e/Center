// src/components/payments/payment-view.tsx
import { getStudentsWithPayments, StudentFilters } from "@/lib/data";
import { PaymentTable } from "@/components/payment-table";
import { Grade, GroupDay } from '@prisma/client';
import { PaymentControls } from "@/components/payment-controls";

export async function PaymentView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Using the same, correct access pattern
  const year = Number(searchParams.year) || new Date().getFullYear();

  const filters: StudentFilters = {
    grade: searchParams.grade as Grade | undefined,
    groupDay: searchParams.groupDay as GroupDay | undefined,
    groupTime: searchParams.groupTime as string | undefined,
  };

  const studentsWithPayments = await getStudentsWithPayments(year, filters);

  return (
    <main className="p-4 md:p-10 mx-auto w-full max-w-screen-2xl">
      <div className="flex items-center justify-between mb-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">متابعة المدفوعات لسنة: {year}</h1>
          <p className="text-gray-500 mt-1">عرض وتسجيل المدفوعات الشهرية للطلاب.</p>
        </div>
      </div>
      <PaymentControls />
      <PaymentTable students={studentsWithPayments} year={year} />
    </main>
  );
}
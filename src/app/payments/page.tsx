// src/app/payments/page.tsx
import { PaymentView } from '@/components/payments/payment-view';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';

// Make the page async to align with async child component
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Card className="shadow-card p-4 md:p-10 mx-auto w-full max-w-screen-2xl transition-smooth">
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <PaymentView searchParams={searchParams || {}} />
      </Suspense>
    </Card>
  );
}

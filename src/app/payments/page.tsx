// src/app/payments/page.tsx
import { PaymentView } from '@/components/payments/payment-view';
import { Suspense } from 'react';

// Make the page async to align with async child component
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <PaymentView searchParams={searchParams || {}} />
    </Suspense>
  );
}

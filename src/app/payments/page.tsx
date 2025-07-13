// src/app/payments/page.tsx
import { PaymentView } from '@/components/payments/payment-view';
import { Suspense } from 'react';

export default function PaymentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentView searchParams={searchParams || {}} />
    </Suspense>
  );
}
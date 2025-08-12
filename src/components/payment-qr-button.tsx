'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentScannerModal } from '@/components/payment-scanner-modal';
import { CreditCard } from 'lucide-react';

type PaymentQRButtonProps = {
  month: number;
  year: number;
};

export function PaymentQRButton({ month, year }: PaymentQRButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-success hover:bg-success-hover text-white"
        size="sm"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        تسجيل دفع
      </Button>
      <PaymentScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetMonth={month}
        targetYear={year}
      />
    </>
  );
}
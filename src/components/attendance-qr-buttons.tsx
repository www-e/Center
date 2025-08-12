'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { QrCode, Clock } from 'lucide-react';

export function AttendanceQRButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary-hover text-white"
        size="sm"
      >
        <QrCode className="h-4 w-4 mr-2" />
        تسجيل حضور
      </Button>
      <QrScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isMakeup={false}
      />
    </>
  );
}

export function MakeupQRButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-warning text-warning hover:bg-warning hover:text-white"
        size="sm"
      >
        <Clock className="h-4 w-4 mr-2" />
        حضور تعويضي
      </Button>
      <QrScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isMakeup={true}
      />
    </>
  );
}
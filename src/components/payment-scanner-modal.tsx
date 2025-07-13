// src/components/payment-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { recordPayment, PaymentState } from '@/lib/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const initialState: PaymentState = { success: false, message: '' };

export function PaymentScannerModal({ isOpen, onClose }: PaymentModalProps) {
  const [state, formAction] = useActionState(recordPayment, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When we get a successful result, reset the form
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);
  
  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // The view to show AFTER a successful payment
  if (state.success && state.receipt) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-success">تم الاستلام بنجاح</DialogTitle>
          </DialogHeader>
          <Card className="shadow-card">
            <CardContent className="space-y-3 text-foreground pt-4">
              <p><strong>اسم الطالب:</strong> {state.receipt.studentName}</p>
              <p><strong>كود الطالب:</strong> {state.receipt.studentReadableId}</p>
              <p><strong>المبلغ:</strong> {state.receipt.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
              <p><strong>عن شهر:</strong> {new Date(state.receipt.year, state.receipt.month - 1).toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</p>
              <p><strong>تاريخ الايصال:</strong> {new Date(state.receipt.issuedAt).toLocaleString('ar-EG')}</p>
            </CardContent>
          </Card>
          <Button onClick={onClose} className="w-full bg-primary text-background hover:bg-primary/90 transition-smooth">
            إغلاق (أو عملية جديدة)
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  // The initial form view
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">تسجيل دفعة جديدة</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="studentReadableId" className="block text-sm font-medium text-foreground mb-1">كود الطالب (من السكانر)</label>
            <Input
              ref={inputRef}
              type="text"
              name="studentReadableId"
              id="studentReadableId"
              className="w-full p-2 font-mono"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">المبلغ المدفوع</label>
            <Input
              type="number"
              name="amount"
              id="amount"
              className="w-full p-2"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-success text-background hover:bg-success/90 transition-smooth">
            تسجيل الدفع
          </Button>
        </form>
        {state && !state.success && state.message && (
          <Card className="mt-4 bg-error/20 text-error">
            <CardContent className="p-3 text-center">
              <p>{state.message}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

// src/components/payment-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { recordPayment, PaymentState } from '@/lib/actions';

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

  if (!isOpen) return null;

  // The view to show AFTER a successful payment
  if (state.success && state.receipt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()} dir="rtl">
          <h2 className="text-2xl font-bold text-green-600 mb-4">تم الاستلام بنجاح</h2>
          <div className="space-y-3 text-gray-700 border-t border-b py-4 my-4">
            <p><strong>اسم الطالب:</strong> {state.receipt.studentName}</p>
            <p><strong>كود الطالب:</strong> {state.receipt.studentReadableId}</p>
            <p><strong>المبلغ:</strong> {state.receipt.amount.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}</p>
            <p><strong>عن شهر:</strong> {new Date(state.receipt.year, state.receipt.month - 1).toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</p>
            <p><strong>تاريخ الايصال:</strong> {new Date(state.receipt.issuedAt).toLocaleString('ar-EG')}</p>
          </div>
          <button onClick={onClose} className="w-full px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700">
            إغلاق (أو عملية جديدة)
          </button>
        </div>
      </div>
    );
  }

  // The initial form view
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()} dir="rtl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">تسجيل دفعة جديدة</h2>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="studentReadableId" className="block text-sm font-medium text-gray-700 mb-1">كود الطالب (من السكانر)</label>
            <input
              ref={inputRef}
              type="text"
              name="studentReadableId"
              id="studentReadableId"
              className="w-full p-2 border border-gray-300 rounded-md font-mono"
              required
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع</label>
            <input
              type="number"
              name="amount"
              id="amount"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-md shadow-sm hover:bg-green-700">
            تسجيل الدفع
          </button>
        </form>
        {state && !state.success && state.message && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md text-center">
            <p>{state.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
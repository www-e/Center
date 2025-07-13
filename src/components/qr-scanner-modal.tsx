// src/components/qr-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { markAttendance, AttendanceState } from '@/lib/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

type QrScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isMakeup: boolean;
};

export function QrScannerModal({ isOpen, onClose, isMakeup }: QrScannerModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<AttendanceState | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setResult(null); // Reset result state when opening
    }
  }, [isOpen]);

  // Handle form submission when QR scanner inputs data
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!inputValue) return;

    const res = await markAttendance(inputValue, isMakeup);
    setResult(res);
    setInputValue(''); // Clear input for the next scan

    // Refocus for continuous scanning
    inputRef.current?.focus();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isMakeup ? 'تسجيل حضور تعويضي' : 'تسجيل حضور'}
          </DialogTitle>
        </DialogHeader>
        <p className="text-neutral mb-6">امسح كود الطالب ضوئياً أو أدخله يدوياً. النظام جاهز للمسح التالي تلقائياً.</p>
        
        <form onSubmit={handleSubmit}>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 text-center text-lg font-mono transition-smooth"
            placeholder="... في انتظار كود الطالب"
          />
        </form>

        {result && (
          <Card className={`mt-6 ${result.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
            <CardContent className="p-4 text-center">
              <p className="font-semibold">{result.studentName}</p>
              <p>{result.message}</p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

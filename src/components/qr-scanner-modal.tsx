// src/components/qr-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { markAttendance, AttendanceState } from '@/lib/actions';

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

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        dir="rtl"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isMakeup ? 'تسجيل حضور تعويضي' : 'تسجيل حضور'}
        </h2>
        <p className="text-gray-500 mb-6">امسح كود الطالب ضوئياً أو أدخله يدوياً. النظام جاهز للمسح التالي تلقائياً.</p>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-3 border border-gray-400 rounded-md text-center text-lg font-mono"
            placeholder="... في انتظار كود الطالب"
          />
        </form>

        {result && (
          <div 
            className={`mt-6 p-4 rounded-md text-center ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            <p className="font-semibold">{result.studentName}</p>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
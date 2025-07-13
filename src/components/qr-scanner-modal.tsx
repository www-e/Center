// src/components/qr-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { markAttendance, AttendanceState } from '@/lib/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  ScanLine, 
  CheckCircle, 
  AlertCircle, 
  UserCheck, 
  Clock,
  Keyboard
} from 'lucide-react';

type QrScannerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isMakeup: boolean;
};

export function QrScannerModal({ isOpen, onClose, isMakeup }: QrScannerModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<AttendanceState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setResult(null);
      setInputValue('');
    }
  }, [isOpen]);

  // Handle form submission when QR scanner inputs data
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!inputValue || isProcessing) return;

    setIsProcessing(true);
    const res = await markAttendance(inputValue, isMakeup);
    setResult(res);
    setInputValue('');
    setIsProcessing(false);

    // Refocus for continuous scanning
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  // Clear result after 3 seconds for continuous scanning
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => setResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/30" dir="rtl">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center">
            {isMakeup ? (
              <Clock className="h-8 w-8 text-white" />
            ) : (
              <UserCheck className="h-8 w-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {isMakeup ? 'تسجيل حضور تعويضي' : 'تسجيل حضور عادي'}
          </DialogTitle>
          <p className="text-muted-foreground">
            امسح كود الطالب أو أدخله يدوياً للتسجيل الفوري
          </p>
        </DialogHeader>

        {/* Scanner Interface */}
        <div className="space-y-6">
          {/* Scanner Visual */}
          <div className="relative">
            <div className="w-full h-32 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-xl flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">منطقة المسح الضوئي</p>
              </div>
            </div>
            
            {/* Scanning Animation */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                كود الطالب
              </label>
              <Input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-4 text-center text-lg font-mono focus-ring"
                placeholder="std-g1-0001"
                disabled={isProcessing}
              />
            </div>

            <Button 
              type="submit" 
              disabled={!inputValue || isProcessing}
              className="w-full btn-primary h-12 text-base font-semibold rounded-xl"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري التسجيل...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5" />
                  تسجيل الحضور
                </div>
              )}
            </Button>
          </form>

          {/* Result Display */}
          {result && (
            <Card className={`shadow-card animate-fade-in ${
              result.success 
                ? 'bg-success/10 border-success/20' 
                : 'bg-error/10 border-error/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    result.success ? 'bg-success/20' : 'bg-error/20'
                  }`}>
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-error" />
                    )}
                  </div>
                  <div className="flex-1">
                    {result.studentName && (
                      <p className={`font-semibold ${result.success ? 'text-success' : 'text-error'}`}>
                        {result.studentName}
                      </p>
                    )}
                    <p className={`text-sm ${result.success ? 'text-success' : 'text-error'}`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>نصيحة:</strong> النظام جاهز للمسح المستمر - لا حاجة لإغلاق النافذة بين العمليات
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

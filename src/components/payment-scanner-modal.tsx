// src/components/payment-scanner-modal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { recordQRPayment, getPaymentInfo, QRPaymentState } from '@/lib/payment-actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Receipt, 
  QrCode, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  User,
  Calendar
} from 'lucide-react';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetMonth?: number;
  targetYear?: number;
};

export function PaymentScannerModal({ isOpen, onClose, targetMonth, targetYear }: PaymentModalProps) {
  const [state, setState] = useState<QRPaymentState>({ success: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [studentCode, setStudentCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if we're dealing with a non-current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const paymentMonth = targetMonth || currentMonth;
  const paymentYear = targetYear || currentYear;
  const isNonCurrentMonth = paymentMonth !== currentMonth || paymentYear !== currentYear;

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Auto-focus the input when the modal opens and reset state
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setIsProcessing(false);
      setStudentInfo(null);
      setStudentCode('');
      setState({ success: false, message: '' });
    }
  }, [isOpen]);

  // Handle student code input and fetch payment info
  const handleStudentCodeChange = async (code: string) => {
    setStudentCode(code);
    setStudentInfo(null);
    
    if (code.length >= 8) { // Minimum length for a valid student code
      setIsLoadingInfo(true);
      try {
        const info = await getPaymentInfo(code);
        if (info.success) {
          setStudentInfo(info);
        } else {
          setStudentInfo({ success: false, message: info.message });
        }
      } catch (error) {
        setStudentInfo({ success: false, message: 'خطأ في الحصول على بيانات الطالب' });
      } finally {
        setIsLoadingInfo(false);
      }
    }
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!studentCode || !studentInfo?.success) return;
    
    // Show confirmation for non-current month payments
    if (isNonCurrentMonth && !showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await recordQRPayment(studentCode, paymentMonth, paymentYear);
      setState(result);
      setShowConfirmation(false);
    } catch (error) {
      setState({ success: false, message: 'خطأ في تسجيل الدفع' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle confirmation dialog
  const handleConfirmPayment = () => {
    setShowConfirmation(false);
    handlePayment();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // Success view with enhanced receipt display
  if (state.success && state.receipt) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-success/5 to-primary/5" dir="rtl">
          <DialogHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-success rounded-2xl flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-success">تم الاستلام بنجاح</DialogTitle>
            <p className="text-muted-foreground">تم إنشاء الإيصال وحفظ العملية</p>
          </DialogHeader>
          
          {/* Receipt Display */}
          <Card className="shadow-elevated bg-background">
            <CardContent className="p-6 space-y-4">
              {/* Receipt Header */}
              <div className="text-center border-b border-border pb-4">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">إيصال دفع</h3>
                <p className="text-sm text-muted-foreground">إيصال رقم {state.receipt.id.slice(-8)}</p>
              </div>

              {/* Receipt Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">اسم الطالب</p>
                    <p className="font-semibold text-foreground">{state.receipt.studentName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <QrCode className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">كود الطالب</p>
                    <p className="font-mono text-foreground">{state.receipt.studentReadableId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">المبلغ المدفوع</p>
                    <p className="font-bold text-lg text-primary">
                      {state.receipt.amount.toLocaleString('ar-EG')} جنيه مصري
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">عن شهر</p>
                    <p className="font-semibold text-foreground">
                      {new Date(state.receipt.year, state.receipt.month - 1).toLocaleString('ar-EG', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    تاريخ الإصدار: {new Date(state.receipt.issuedAt).toLocaleString('ar-EG')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button 
              onClick={onClose} 
              className="flex-1 btn-primary h-12 font-semibold rounded-xl"
            >
              عملية جديدة
            </Button>
            <Button 
              variant="outline"
              onClick={onClose} 
              className="px-6 h-12 font-semibold rounded-xl"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Confirmation dialog for non-current month payments
  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-warning/5 to-primary/5" dir="rtl">
          <DialogHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-2xl flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-warning" />
            </div>
            <DialogTitle className="text-2xl font-bold text-foreground">تأكيد الدفع</DialogTitle>
            <p className="text-muted-foreground">أنت على وشك تسجيل دفعة لشهر غير حالي</p>
          </DialogHeader>

          <Card className="bg-warning/10 border-warning/20">
            <CardContent className="p-4 space-y-3">
              <div className="text-center">
                <p className="font-semibold text-foreground mb-2">بيانات الدفعة:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الطالب:</span>
                    <span className="font-medium">{studentInfo?.student?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ:</span>
                    <span className="font-bold text-primary">{studentInfo?.amount?.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الشهر:</span>
                    <span className="font-bold text-warning">{monthNames[paymentMonth - 1]} {paymentYear}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-warning/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning mb-1">تنبيه مهم:</p>
                <p className="text-muted-foreground">
                  {paymentMonth < currentMonth || paymentYear < currentYear 
                    ? 'أنت تسجل دفعة لشهر سابق. تأكد من صحة التاريخ قبل المتابعة.'
                    : 'أنت تسجل دفعة لشهر مستقبلي. تأكد من صحة التاريخ قبل المتابعة.'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="flex-1 bg-warning text-white hover:bg-warning/90 h-12 font-semibold rounded-xl"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري التسجيل...
                </div>
              ) : (
                'تأكيد الدفع'
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isProcessing}
              className="px-6 h-12 font-semibold rounded-xl"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main payment form view
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background to-muted/30" dir="rtl">
        <DialogHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-success rounded-2xl flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">
            تسجيل دفعة جديدة
            {isNonCurrentMonth && (
              <span className="block text-lg text-warning mt-1">
                لشهر {monthNames[paymentMonth - 1]} {paymentYear}
              </span>
            )}
          </DialogTitle>
          <p className="text-muted-foreground">
            {isNonCurrentMonth 
              ? `تسجيل دفعة لشهر ${monthNames[paymentMonth - 1]} ${paymentYear} - سيتم طلب تأكيد إضافي`
              : 'امسح كود الطالب وسيتم تحديد المبلغ تلقائياً'
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="w-full h-24 bg-gradient-to-r from-success/5 to-primary/5 rounded-xl border-2 border-dashed border-success/20 flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-8 w-8 mx-auto mb-1 text-success" />
                  <p className="text-xs text-muted-foreground">امسح كود الطالب أو أدخله يدوياً</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كود الطالب</label>
              <Input
                ref={inputRef}
                type="text"
                value={studentCode}
                onChange={(e) => handleStudentCodeChange(e.target.value)}
                className="w-full p-3 font-mono text-center focus-ring"
                placeholder="std10001 أو std-g1-0001"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Student Info Display */}
          {isLoadingInfo && (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">جاري البحث عن الطالب...</p>
              </CardContent>
            </Card>
          )}

          {studentInfo && studentInfo.success && (
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{studentInfo.student.name}</p>
                    <p className="text-sm text-muted-foreground">كود: {studentInfo.student.studentId}</p>
                  </div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">المبلغ المطلوب:</span>
                    <span className="font-bold text-lg text-primary">
                      {studentInfo.amount?.toLocaleString('ar-EG')} جنيه
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {studentInfo && !studentInfo.success && (
            <Card className="bg-error/10 border-error/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-error" />
                  <p className="text-error font-medium">{studentInfo.message}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handlePayment}
            disabled={isProcessing || !studentInfo?.success}
            className="w-full bg-gradient-success text-white h-12 text-base font-semibold rounded-xl hover-lift disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                جاري التسجيل...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                تسجيل الدفع وإصدار الإيصال
              </div>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {state && !state.success && state.message && (
          <Card className="bg-error/10 border-error/20 animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-error" />
                <p className="text-error font-medium">{state.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 <strong>نصيحة:</strong> المبلغ يتم تحديده تلقائياً حسب صف وشعبة الطالب
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

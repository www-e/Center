// src/components/monthly-payment-navigation.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

interface MonthlyPaymentNavigationProps {
  currentMonth: number;
  currentYear: number;
}

export function MonthlyPaymentNavigation({ currentMonth, currentYear }: MonthlyPaymentNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const currentDate = new Date();
  const actualCurrentMonth = currentDate.getMonth() + 1;
  const actualCurrentYear = currentDate.getFullYear();
  
  const isCurrentMonth = currentMonth === actualCurrentMonth && currentYear === actualCurrentYear;
  const isPastMonth = currentYear < actualCurrentYear || 
    (currentYear === actualCurrentYear && currentMonth < actualCurrentMonth);
  const isFutureMonth = currentYear > actualCurrentYear || 
    (currentYear === actualCurrentYear && currentMonth > actualCurrentMonth);

  const navigateToMonth = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', month.toString());
    params.set('year', year.toString());
    router.push(`/payments?${params.toString()}`);
  };

  const getPreviousMonth = () => {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  };

  const getNextMonth = () => {
    if (currentMonth === 12) {
      return { month: 1, year: currentYear + 1 };
    }
    return { month: currentMonth + 1, year: currentYear };
  };

  const previousMonth = getPreviousMonth();
  const nextMonth = getNextMonth();

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between" dir="rtl">
          {/* Previous Month Button */}
          <Button
            variant="outline"
            onClick={() => navigateToMonth(previousMonth.month, previousMonth.year)}
            className="flex items-center gap-2 hover-lift"
          >
            <ChevronRight className="h-4 w-4" />
            {monthNames[previousMonth.month - 1]} {previousMonth.year}
          </Button>

          {/* Current Month Display */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">
                  {monthNames[currentMonth - 1]} {currentYear}
                </h3>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                {isCurrentMonth && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    الشهر الحالي
                  </Badge>
                )}
                {isPastMonth && (
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    شهر سابق
                  </Badge>
                )}
                {isFutureMonth && (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    شهر مستقبلي
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Next Month Button */}
          <Button
            variant="outline"
            onClick={() => navigateToMonth(nextMonth.month, nextMonth.year)}
            className="flex items-center gap-2 hover-lift"
          >
            {monthNames[nextMonth.month - 1]} {nextMonth.year}
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Warning for non-current month */}
        {!isCurrentMonth && (
          <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isPastMonth 
                  ? 'تعرض بيانات شهر سابق - قد تحتاج لتأكيد إضافي عند تسجيل مدفوعات'
                  : 'تعرض بيانات شهر مستقبلي - تأكد من التاريخ قبل تسجيل المدفوعات'
                }
              </span>
            </div>
          </div>
        )}

        {/* Quick Navigation to Current Month */}
        {!isCurrentMonth && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToMonth(actualCurrentMonth, actualCurrentYear)}
              className="text-primary hover:text-primary-hover"
            >
              العودة للشهر الحالي ({monthNames[actualCurrentMonth - 1]} {actualCurrentYear})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
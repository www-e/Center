// src/components/payment-controls.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { translations, scheduleData } from '@/lib/constants';
import { Grade, GroupDay } from '@prisma/client';
import { PaymentScannerModal } from './payment-scanner-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Calendar, 
  Clock, 
  GraduationCap, 
  CreditCard, 
  ChevronLeft, 
  ChevronRight,
  X,
  DollarSign,
  Receipt
} from 'lucide-react';

export function PaymentControls() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentGrade = searchParams.get('grade') as Grade | null;
  const currentGroupDay = searchParams.get('groupDay') as GroupDay | null;
  const currentGroupTime = searchParams.get('groupTime') as string | null;

  // Get current year and month from URL or default to current
  const currentYear = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const currentMonth = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  function handleFilterChange(key: 'grade' | 'groupDay' | 'groupTime', value: string) {
    const params = new URLSearchParams(searchParams);
    
    if (value === "ALL" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Clear dependent filters when parent filter changes
    if (key === 'grade') {
      params.delete('groupDay');
      params.delete('groupTime');
    }
    if (key === 'groupDay') {
      params.delete('groupTime');
    }
    
    replace(`${pathname}?${params.toString()}`);
  }

  function clearFilter(key: 'grade' | 'groupDay' | 'groupTime') {
    handleFilterChange(key, '');
  }

  function handleYearChange(direction: 'next' | 'prev') {
    const params = new URLSearchParams(searchParams);
    const newYear = direction === 'next' ? currentYear + 1 : currentYear - 1;
    params.set('year', newYear.toString());
    replace(`${pathname}?${params.toString()}`);
  }

  const groupDayOptions = currentGrade ? Object.keys(scheduleData[currentGrade].groupDays) : [];
  const groupTimeOptions = (currentGrade && currentGroupDay && scheduleData[currentGrade].groupDays[currentGroupDay as keyof typeof scheduleData[Grade]['groupDays']]) || [];

  // Calculate active filters count
  const activeFiltersCount = [currentGrade, currentGroupDay, currentGroupTime].filter(Boolean).length;

  return (
    <>
      <PaymentScannerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetMonth={currentMonth}
        targetYear={currentYear}
      />
      
      <div className="space-y-6">
        {/* Filter Header */}
        <Card className="shadow-card glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">فلاتر المدفوعات</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {activeFiltersCount > 0 ? `${activeFiltersCount} فلتر نشط` : 'عرض جميع الطلاب'}
                  </p>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => replace(pathname + `?year=${currentYear}`)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">الفلاتر المطبقة:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentGrade && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 gap-2">
                      <GraduationCap className="h-3 w-3" />
                      {translations[currentGrade]}
                      <button onClick={() => clearFilter('grade')} className="hover:bg-primary/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {currentGroupDay && (
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20 gap-2">
                      <Calendar className="h-3 w-3" />
                      {translations[currentGroupDay]}
                      <button onClick={() => clearFilter('groupDay')} className="hover:bg-secondary/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {currentGroupTime && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-2">
                      <Clock className="h-3 w-3" />
                      {currentGroupTime}
                      <button onClick={() => clearFilter('groupTime')} className="hover:bg-success/20 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Filter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  الصف الدراسي
                </label>
                <Select value={currentGrade ?? ''} onValueChange={(value) => handleFilterChange('grade', value)}>
                  <SelectTrigger className="focus-ring">
                    <SelectValue placeholder="اختر الصف الدراسي" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الصفوف</SelectItem>
                    {Object.values(Grade).map(g => (
                      <SelectItem key={g} value={g}>{translations[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-secondary" />
                  مجموعة الأيام
                </label>
                <Select 
                  value={currentGroupDay ?? ''} 
                  onValueChange={(value) => handleFilterChange('groupDay', value)}
                  disabled={!currentGrade}
                >
                  <SelectTrigger className="focus-ring disabled:opacity-50">
                    <SelectValue placeholder="اختر أيام المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع الأيام</SelectItem>
                    {groupDayOptions.map(gd => (
                      <SelectItem key={gd} value={gd}>{translations[gd as GroupDay]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  ميعاد المجموعة
                </label>
                <Select 
                  value={currentGroupTime ?? ''} 
                  onValueChange={(value) => handleFilterChange('groupTime', value)}
                  disabled={!currentGroupDay}
                >
                  <SelectTrigger className="focus-ring disabled:opacity-50">
                    <SelectValue placeholder="اختر ميعاد المجموعة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">جميع المواعيد</SelectItem>
                    {(groupTimeOptions as string[]).map(gt => (
                      <SelectItem key={gt} value={gt}>{gt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Year Navigation & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Year Navigation */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleYearChange('prev')}
                  className="flex items-center gap-2 hover-lift"
                >
                  <ChevronRight className="h-4 w-4" />
                  السنة السابقة
                </Button>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{currentYear}</div>
                  <div className="text-sm text-muted-foreground">السنة الحالية</div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handleYearChange('next')}
                  className="flex items-center gap-2 hover-lift"
                >
                  السنة التالية
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Action */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-success text-white h-16 text-lg font-semibold rounded-xl hover-lift group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-lg">تسجيل دفعة جديدة</div>
                    <div className="text-sm opacity-90">مسح كود الطالب وتحديد المبلغ</div>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

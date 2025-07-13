// src/components/attendance-controls.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { translations, scheduleData } from '@/lib/constants';
import { Grade, GroupDay } from '@prisma/client';
import { QrScannerModal } from './qr-scanner-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Calendar, 
  Clock, 
  GraduationCap, 
  QrCode, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  X,
  ScanLine,
  UserCheck
} from 'lucide-react';

export function AttendanceControls() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMakeupMode, setIsMakeupMode] = useState(false);

  const currentGrade = searchParams.get('grade') as Grade | null;
  const currentGroupDay = searchParams.get('groupDay') as GroupDay | null;
  const currentGroupTime = searchParams.get('groupTime') as string | null;

  // Get current month/year from URL or default to current
  const currentYear = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const currentMonth = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  function handleFilterChange(key: 'grade' | 'groupDay' | 'groupTime', value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
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

  function handleMonthChange(direction: 'next' | 'prev') {
    const params = new URLSearchParams(searchParams);
    let newDate;
    if (direction === 'next') {
      newDate = new Date(currentYear, currentMonth, 1);
    } else {
      newDate = new Date(currentYear, currentMonth - 2, 1);
    }

    params.set('year', newDate.getFullYear().toString());
    params.set('month', (newDate.getMonth() + 1).toString());
    replace(`${pathname}?${params.toString()}`);
  }

  function openScanner(makeup: boolean) {
    setIsMakeupMode(makeup);
    setIsModalOpen(true);
  }

  const groupDayOptions = currentGrade ? Object.keys(scheduleData[currentGrade].groupDays) : [];
  const groupTimeOptions = (currentGrade && currentGroupDay && scheduleData[currentGrade].groupDays[currentGroupDay as keyof typeof scheduleData[Grade]['groupDays']]) || [];

  // Calculate active filters count
  const activeFiltersCount = [currentGrade, currentGroupDay, currentGroupTime].filter(Boolean).length;

  // Format current month display
  const currentMonthName = new Date(currentYear, currentMonth - 1).toLocaleString('ar-EG', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <>
      <QrScannerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isMakeup={isMakeupMode}
      />
      
      <div className="space-y-6">
        {/* Filter Header */}
        <Card className="shadow-card glass-effect">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">فلاتر البحث المتقدمة</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {activeFiltersCount > 0 ? `${activeFiltersCount} فلتر نشط` : 'لا توجد فلاتر مطبقة'}
                  </p>
                </div>
              </div>
              
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => replace(pathname)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-2" />
                  مسح الكل
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
                    <SelectItem value="">جميع الصفوف</SelectItem>
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
                    <SelectItem value="">جميع الأيام</SelectItem>
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
                    <SelectItem value="">جميع المواعيد</SelectItem>
                    {(groupTimeOptions as string[]).map(gt => (
                      <SelectItem key={gt} value={gt}>{gt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Month Navigation & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Month Navigation */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => handleMonthChange('prev')}
                  className="flex items-center gap-2 hover-lift"
                >
                  <ChevronRight className="h-4 w-4" />
                  الشهر السابق
                </Button>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{currentMonthName}</div>
                  <div className="text-sm text-muted-foreground">الشهر الحالي</div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => handleMonthChange('next')}
                  className="flex items-center gap-2 hover-lift"
                >
                  الشهر التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => openScanner(false)}
                  className="btn-primary h-12 text-base font-semibold rounded-xl hover-lift group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div className="text-right">
                      <div>تحضير طالب</div>
                      <div className="text-xs opacity-90">حضور عادي</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => openScanner(true)}
                  className="bg-warning text-white hover:bg-warning/90 h-12 text-base font-semibold rounded-xl hover-lift group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ScanLine className="h-4 w-4" />
                    </div>
                    <div className="text-right">
                      <div>تحضير تعويضي</div>
                      <div className="text-xs opacity-90">جلسة تعويضية</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

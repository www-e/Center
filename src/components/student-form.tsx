// src/components/student-form.tsx
'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { createStudent } from '@/lib/actions';
import { scheduleData, translations } from '@/lib/constants';
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StudentForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createStudent, initialState);

  // State to manage dynamic dropdowns
  const [grade, setGrade] = useState<Grade>(Grade.FIRST);
  const [section, setSection] = useState<Section>(Section.NONE);
  const [groupDay, setGroupDay] = useState<GroupDay>(GroupDay.SAT_TUE);
  
  // Reset dependent fields when the grade changes
  useEffect(() => {
    const defaultSection = scheduleData[grade].sections[0];
    setSection(defaultSection);
  }, [grade]);
  
  const sectionOptions = useMemo(() => scheduleData[grade].sections, [grade]);
  
  const groupDayOptions = useMemo(() => {
    if (grade === Grade.THIRD) {
      if (section === Section.SCIENTIFIC) return Object.keys(scheduleData[grade].groupDays.SCIENTIFIC);
      if (section === Section.LITERARY) return Object.keys(scheduleData[grade].groupDays.LITERARY);
      return [];
    }
    return Object.keys(scheduleData[grade].groupDays);
  }, [grade, section]);

  const groupTimeOptions = useMemo(() => {
    try {
      if (grade === Grade.THIRD) {
        if (section === Section.SCIENTIFIC) return scheduleData[grade].groupDays.SCIENTIFIC[groupDay as 'SAT_TUE_THU'];
        if (section === Section.LITERARY) return scheduleData[grade].groupDays.LITERARY[groupDay as 'SUN_WED'];
        return [];
      }
      return scheduleData[grade].groupDays[groupDay as 'SAT_TUE' | 'SUN_WED' | 'MON_THU'];
    } catch {
      return [];
    }
  }, [grade, section, groupDay]);


  return (
    <Card className="shadow-card">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">إضافة طالب جديد</CardTitle>
        <p className="text-neutral">سيتم إنشاء كود الطالب تلقائياً عند الحفظ</p>
      </CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">اسم الطالب</label>
              <Input type="text" name="name" id="name" required />
              {state.errors?.name && <p className="text-error text-xs mt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">رقم هاتف الطالب</label>
              <Input type="tel" name="phone" id="phone" required />
              {state.errors?.phone && <p className="text-error text-xs mt-1">{state.errors.phone[0]}</p>}
            </div>
            <div>
              <label htmlFor="parentPhone" className="block text-sm font-medium text-foreground mb-1">رقم هاتف ولي الأمر</label>
              <Input type="tel" name="parentPhone" id="parentPhone" required />
              {state.errors?.parentPhone && <p className="text-error text-xs mt-1">{state.errors.parentPhone[0]}</p>}
            </div>

            {/* Dynamic Dropdowns */}
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-foreground mb-1">الصف الدراسي</label>
              <Select name="grade" value={grade} onValueChange={(value) => setGrade(value as Grade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Grade).map(g => <SelectItem key={g} value={g}>{translations[g]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="section" className="block text-sm font-medium text-foreground mb-1">الشعبة</label>
              <Select name="section" value={section} onValueChange={(value) => setSection(value as Section)} disabled={sectionOptions.length <= 1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sectionOptions.map(s => <SelectItem key={s} value={s}>{translations[s as Section]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="groupDay" className="block text-sm font-medium text-foreground mb-1">مجموعة الأيام</label>
              <Select name="groupDay" value={groupDay} onValueChange={(value) => setGroupDay(value as GroupDay)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(groupDayOptions as string[]).map(gd => <SelectItem key={gd} value={gd}>{translations[gd as GroupDay]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="groupTime" className="block text-sm font-medium text-foreground mb-1">ميعاد المجموعة</label>
              <Select name="groupTime" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupTimeOptions?.map(gt => <SelectItem key={gt} value={gt}>{gt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="paymentPref" className="block text-sm font-medium text-foreground mb-1">طريقة الدفع</label>
              <Select name="paymentPref">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PaymentPref).map(p => <SelectItem key={p} value={p}>{translations[p]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {state.message && <p className="text-error text-sm mt-4">{state.message}</p>}

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-primary text-background hover:bg-primary/90 transition-smooth">حفظ الطالب</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

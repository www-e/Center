'use client';

import { useActionState, useState, useEffect, useMemo } from 'react'; // 1. CHANGED: useActionState from 'react'
import { useFormStatus } from 'react-dom';
import { createStudent } from '@/lib/actions';
import { scheduleData, translations } from '@/lib/constants';
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';

export function StudentForm() {
  const initialState = { message: null, errors: {} };
  // 2. CHANGED: using useActionState
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
    <form action={dispatch} className="space-y-6 bg-gray-50 p-8 rounded-lg shadow-md" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">إضافة طالب جديد</h2>
        <p className="text-gray-500">سيتم إنشاء كود الطالب تلقائياً عند الحفظ</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Fields */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم الطالب</label>
          <input type="text" name="name" id="name" className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
          {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">رقم هاتف الطالب</label>
          <input type="tel" name="phone" id="phone" className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
          {state.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
        </div>
        <div>
          <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700 mb-1">رقم هاتف ولي الأمر</label>
          <input type="tel" name="parentPhone" id="parentPhone" className="w-full p-2 border border-gray-300 rounded-md shadow-sm" required />
           {state.errors?.parentPhone && <p className="text-red-500 text-xs mt-1">{state.errors.parentPhone[0]}</p>}
        </div>

        {/* Dynamic Dropdowns */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">الصف الدراسي</label>
          <select name="grade" id="grade" className="w-full p-2 border border-gray-300 rounded-md" value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
            {Object.values(Grade).map(g => <option key={g} value={g}>{translations[g]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">الشعبة</label>
          <select name="section" id="section" className="w-full p-2 border border-gray-300 rounded-md" value={section} onChange={(e) => setSection(e.target.value as Section)} disabled={sectionOptions.length <= 1}>
            {sectionOptions.map(s => <option key={s} value={s}>{translations[s as Section]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="groupDay" className="block text-sm font-medium text-gray-700 mb-1">مجموعة الأيام</label>
          <select name="groupDay" id="groupDay" className="w-full p-2 border border-gray-300 rounded-md" value={groupDay} onChange={(e) => setGroupDay(e.target.value as GroupDay)}>
            {(groupDayOptions as string[]).map(gd => <option key={gd} value={gd}>{translations[gd as GroupDay]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="groupTime" className="block text-sm font-medium text-gray-700 mb-1">ميعاد المجموعة</label>
          <select name="groupTime" id="groupTime" className="w-full p-2 border border-gray-300 rounded-md" required>
            {groupTimeOptions?.map(gt => <option key={gt} value={gt}>{gt}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="paymentPref" className="block text-sm font-medium text-gray-700 mb-1">طريقة الدفع</label>
          <select name="paymentPref" id="paymentPref" className="w-full p-2 border border-gray-300 rounded-md">
            {Object.values(PaymentPref).map(p => <option key={p} value={p}>{translations[p]}</option>)}
          </select>
        </div>
      </div>
      
      {state.message && <p className="text-red-500 text-sm mt-4">{state.message}</p>}

      <div className="flex justify-end pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
      {pending ? 'جاري الحفظ...' : 'حفظ الطالب'}
    </button>
  );
}
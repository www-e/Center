// src/components/attendance-controls.tsx
'use client';

// NEW: Import useState to manage modal state
import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { translations, scheduleData } from '@/lib/constants';
import { Grade, GroupDay } from '@prisma/client';
// NEW: Import the modal component
import { QrScannerModal } from './qr-scanner-modal';

export function AttendanceControls() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // NEW: State to control the visibility and mode of the QR scanner modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMakeupMode, setIsMakeupMode] = useState(false);

  const currentGrade = searchParams.get('grade') as Grade | null;
  const currentGroupDay = searchParams.get('groupDay') as GroupDay | null;
  const currentGroupTime = searchParams.get('groupTime') as string | null;

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

  function handleMonthChange(direction: 'next' | 'prev') {
    const params = new URLSearchParams(searchParams);
    const year = parseInt(params.get('year') || new Date().getFullYear().toString());
    const month = parseInt(params.get('month') || (new Date().getMonth() + 1).toString());

    let newDate;
    if (direction === 'next') {
        newDate = new Date(year, month, 1);
    } else {
        newDate = new Date(year, month - 2, 1);
    }

    params.set('year', newDate.getFullYear().toString());
    params.set('month', (newDate.getMonth() + 1).toString());
    replace(`${pathname}?${params.toString()}`);
  }
  
  // NEW: Function to open the modal in the correct mode
  function openScanner(makeup: boolean) {
    setIsMakeupMode(makeup);
    setIsModalOpen(true);
  }

  const groupDayOptions = currentGrade ? Object.keys(scheduleData[currentGrade].groupDays) : [];
  const groupTimeOptions = (currentGrade && currentGroupDay && scheduleData[currentGrade].groupDays[currentGroupDay as keyof typeof scheduleData[Grade]['groupDays']]) || [];

  return (
    // NEW: Wrap the output in a React Fragment (<> ... </>) to include the modal
    <>
      <QrScannerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isMakeup={isMakeupMode}
      />
      <div className="bg-white p-4 rounded-lg shadow mb-8" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Filters (This part is unchanged) */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="grade-filter" className="block text-sm font-medium text-gray-700 mb-1">الصف</label>
              <select
                id="grade-filter"
                value={currentGrade ?? ''}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">الكل</option>
                {Object.values(Grade).map(g => <option key={g} value={g}>{translations[g]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="groupday-filter" className="block text-sm font-medium text-gray-700 mb-1">الأيام</label>
              <select
                id="groupday-filter"
                disabled={!currentGrade}
                value={currentGroupDay ?? ''}
                onChange={(e) => handleFilterChange('groupDay', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
              >
                <option value="">الكل</option>
                {groupDayOptions.map(gd => <option key={gd} value={gd}>{translations[gd as GroupDay]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="grouptime-filter" className="block text-sm font-medium text-gray-700 mb-1">الميعاد</label>
              <select
                id="grouptime-filter"
                disabled={!currentGroupDay}
                value={currentGroupTime ?? ''}
                onChange={(e) => handleFilterChange('groupTime', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm disabled:bg-gray-100"
              >
                <option value="">الكل</option>
                {(groupTimeOptions as string[]).map(gt => <option key={gt} value={gt}>{gt}</option>)}
              </select>
            </div>
          </div>

          {/* Month Navigation (This part is unchanged) */}
          <div className="md:col-span-1 flex justify-center items-center space-x-2 space-x-reverse">
              <button onClick={() => handleMonthChange('prev')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">الشهر السابق</button>
              <button onClick={() => handleMonthChange('next')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">الشهر التالي</button>
          </div>

          {/* Action Buttons (This part is UPDATED with onClick handlers) */}
          <div className="md:col-span-2 flex justify-end items-center space-x-3 space-x-reverse">
              <button onClick={() => openScanner(false)} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 transition-all">
                  تحضير طالب
              </button>
              <button onClick={() => openScanner(true)} className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-sm hover:bg-orange-600 transition-all">
                  تحضير تعويضي
              </button>
          </div>
        </div>
      </div>
    </>
  );
}
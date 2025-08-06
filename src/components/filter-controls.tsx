// src/components/filter-controls.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Grade, GroupDay } from '@prisma/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, GraduationCap, Calendar, Clock } from 'lucide-react';
import { useCallback } from 'react';

// Define the props for the component
type FilterControlsProps = {
  groupTimes: string[];
};

// Define the filter options
const grades = Object.values(Grade);
const groupDays = Object.values(GroupDay);

// Helper to create a consistent style for filter buttons
const getButtonVariant = (isActive: boolean) => (isActive ? 'default' : 'outline');

export function FilterControls({ groupTimes }: FilterControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current filter values from the URL
  const activeGrade = searchParams.get('grade') as Grade | null;
  const activeGroupDay = searchParams.get('groupDay') as GroupDay | null;
  const activeGroupTime = searchParams.get('groupTime') as string | null;

  // A memoized function to handle filter changes efficiently
  const handleFilterChange = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // If we change the grade or group day, reset the group time
      if (key === 'grade' || key === 'groupDay') {
        params.delete('groupTime');
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <Card className="shadow-card glass-effect mb-6">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Filter className="h-5 w-5 text-primary" />
          <span>الفلاتر</span>
        </div>

        {/* Grade Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>الصف الدراسي</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {grades.map(grade => (
              <Button
                key={grade}
                variant={getButtonVariant(activeGrade === grade)}
                size="sm"
                onClick={() => handleFilterChange('grade', activeGrade === grade ? null : grade)}
              >
                {`الصف ${grade}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Group Day Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>مجموعة الأيام</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {groupDays.map(day => (
              <Button
                key={day}
                variant={getButtonVariant(activeGroupDay === day)}
                size="sm"
                onClick={() => handleFilterChange('groupDay', activeGroupDay === day ? null : day)}
              >
                {day.replace('_', '-')}
              </Button>
            ))}
          </div>
        </div>

        {/* Group Time Filters (only shown if a group day is selected) */}
        {activeGroupDay && groupTimes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>ميعاد المجموعة</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupTimes.map(time => (
                <Button
                  key={time}
                  variant={getButtonVariant(activeGroupTime === time)}
                  size="sm"
                  onClick={() => handleFilterChange('groupTime', activeGroupTime === time ? null : time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

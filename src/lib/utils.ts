// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { GroupDay } from '@prisma/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dayMap: Record<GroupDay, number[]> = {
  [GroupDay.SAT_TUE]: [6, 2],
  [GroupDay.SUN_WED]: [0, 3],
  [GroupDay.MON_THU]: [1, 4],
  [GroupDay.SAT_TUE_THU]: [6, 2, 4],
};

export function getSessionDatesForMonth(year: number, month: number, groupDay: GroupDay): Date[] {
  const dates: Date[] = [];
  const date = new Date(Date.UTC(year, month - 1, 1)); 

  const targetDays = dayMap[groupDay];
  if (!targetDays) return [];

  while (date.getUTCMonth() === month - 1) {
    if (targetDays.includes(date.getUTCDay())) {
      dates.push(new Date(date));
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return dates;
}

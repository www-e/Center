// src/lib/constants.ts
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';

// This object holds all the schedule data you provided.
// It is safe to import into client components.
export const scheduleData = {
  [Grade.FIRST]: {
    sections: [Section.NONE],
    groupDays: {
      SAT_TUE: ['03:15 PM', '04:30 PM'],
      SUN_WED: ['02:00 PM'],
      MON_THU: ['02:00 PM'],
    },
  },
  [Grade.SECOND]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: {
      SAT_TUE: ['02:00 PM'],
      SUN_WED: ['03:15 PM'],
      MON_THU: ['03:15 PM'],
    },
  },
  [Grade.THIRD]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: {
      SCIENTIFIC: {
        SAT_TUE_THU: ['12:00 PM'],
      },
      LITERARY: {
        SUN_WED: ['04:30 PM'],
      },
    },
  },
};

// Mappings for displaying Enum values in Arabic
export const translations = {
  [Grade.FIRST]: 'الصف الأول الثانوي',
  [Grade.SECOND]: 'الصف الثاني الثانوي',
  [Grade.THIRD]: 'الصف الثالث الثانوي',
  [Section.NONE]: 'لا يوجد',
  [Section.SCIENTIFIC]: 'علمي',
  [Section.LITERARY]: 'أدبي',
  [GroupDay.SAT_TUE]: 'السبت و الثلاثاء',
  [GroupDay.SUN_WED]: 'الأحد و الأربعاء',
  [GroupDay.MON_THU]: 'الاثنين و الخميس',
  [GroupDay.SAT_TUE_THU]: 'السبت و الثلاثاء و الخميس',
  [PaymentPref.PREPAID]: 'مقدم',
  [PaymentPref.POSTPAID]: 'مؤخر',
};
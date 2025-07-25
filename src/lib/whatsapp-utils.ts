// src/lib/whatsapp-utils.ts
import { validateEgyptianPhone } from './phone-validation';

export interface WhatsAppMessage {
  to: string;
  message: string;
  type: 'student' | 'parent';
  studentName?: string;
}

/**
 * Generates WhatsApp URL for direct messaging
 */
export function generateWhatsAppUrl(phoneNumber: string, message?: string): string {
  // Validate phone number first
  const validation = validateEgyptianPhone(phoneNumber);
  if (!validation.isValid) {
    throw new Error(`رقم الهاتف غير صحيح: ${validation.message}`);
  }

  // Clean and format phone number
  const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Convert to international format (remove leading 0, add +20)
  const internationalPhone = cleanPhone.startsWith('0') 
    ? `+2${cleanPhone.slice(1)}` 
    : `+20${cleanPhone}`;

  // Encode message if provided
  const encodedMessage = message ? encodeURIComponent(message) : '';
  
  // Generate WhatsApp URL
  const baseUrl = 'https://wa.me/';
  const phoneParam = internationalPhone.replace('+', '');
  const messageParam = encodedMessage ? `?text=${encodedMessage}` : '';
  
  return `${baseUrl}${phoneParam}${messageParam}`;
}

/**
 * Predefined message templates for different scenarios
 */
export const messageTemplates = {
  student: {
    welcome: (studentName: string) => 
      `مرحباً ${studentName}! نرحب بك في المركز التعليمي. نتمنى لك التوفيق في دراستك.`,
    
    reminder: (studentName: string) => 
      `تذكير: ${studentName}، لديك حصة اليوم. يرجى الحضور في الموعد المحدد.`,
    
    absence: (studentName: string) => 
      `${studentName}، لاحظنا غيابك اليوم. يرجى التواصل معنا لمعرفة سبب الغياب.`,
    
    payment: (studentName: string, amount: number) => 
      `${studentName}، تذكير بدفع الرسوم الشهرية: ${amount} جنيه. يرجى الدفع في أقرب وقت ممكن.`,
    
    congratulations: (studentName: string) => 
      `مبروك ${studentName}! أداؤك ممتاز هذا الشهر. استمر في التفوق!`
  },
  
  parent: {
    welcome: (studentName: string) => 
      `مرحباً، نرحب بانضمام ${studentName} إلى المركز التعليمي. نحن ملتزمون بتقديم أفضل تعليم لابنكم/ابنتكم.`,
    
    progress: (studentName: string) => 
      `تقرير عن ${studentName}: الطالب يحرز تقدماً ممتازاً في الدراسة. نحن فخورون بأدائه/أدائها.`,
    
    absence: (studentName: string) => 
      `إشعار غياب: ${studentName} لم يحضر اليوم. يرجى التأكد من حالته الصحية والتواصل معنا.`,
    
    payment: (studentName: string, amount: number, month: string) => 
      `تذكير دفع رسوم ${studentName} لشهر ${month}: ${amount} جنيه. يرجى الدفع لضمان استمرار الخدمة التعليمية.`,
    
    meeting: (studentName: string) => 
      `دعوة لاجتماع: نود مناقشة تقدم ${studentName} معكم. يرجى تحديد موعد مناسب للاجتماع.`,
    
    emergency: (studentName: string) => 
      `إشعار عاجل بخصوص ${studentName}. يرجى التواصل معنا فوراً على هذا الرقم.`
  }
};

/**
 * Validates if WhatsApp is available on the device
 */
export function isWhatsAppAvailable(): boolean {
  // Check if running on mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // On mobile, WhatsApp should be available
  if (isMobile) {
    return true;
  }
  
  // On desktop, WhatsApp Web should work
  return true;
}

/**
 * Opens WhatsApp with error handling
 */
export function openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      if (!isWhatsAppAvailable()) {
        reject(new Error('WhatsApp غير متوفر على هذا الجهاز'));
        return;
      }

      const url = generateWhatsAppUrl(phoneNumber, message);
      
      // Try to open WhatsApp
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        resolve(true);
      } else {
        // Popup blocked, try alternative method
        window.location.href = url;
        resolve(true);
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Bulk WhatsApp messaging utility
 */
export interface BulkMessageOptions {
  recipients: Array<{
    phone: string;
    name: string;
    type: 'student' | 'parent';
  }>;
  template: string;
  customMessage?: string;
}

export function generateBulkWhatsAppUrls(options: BulkMessageOptions): Array<{
  name: string;
  phone: string;
  url: string;
  type: 'student' | 'parent';
}> {
  return options.recipients.map(recipient => {
    let message = options.customMessage;
    
    if (!message && options.template) {
      // Use template if no custom message
      const templates = messageTemplates[recipient.type];
      if (templates && templates[options.template as keyof typeof templates]) {
        message = (templates[options.template as keyof typeof templates] as Function)(recipient.name);
      }
    }
    
    return {
      name: recipient.name,
      phone: recipient.phone,
      type: recipient.type,
      url: generateWhatsAppUrl(recipient.phone, message)
    };
  });
}

/**
 * Format phone number for display in WhatsApp context
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  const validation = validateEgyptianPhone(phoneNumber);
  if (!validation.isValid) {
    return phoneNumber;
  }
  
  return validation.formattedValue || phoneNumber;
}

/**
 * Check if a phone number can be used with WhatsApp
 */
export function canUseWhatsApp(phoneNumber: string): boolean {
  const validation = validateEgyptianPhone(phoneNumber);
  return validation.isValid;
}

/**
 * Generate WhatsApp group invite URL (for class groups)
 */
export function generateGroupInviteMessage(groupName: string, inviteLink?: string): string {
  if (inviteLink) {
    return `مرحباً! تم دعوتك للانضمام إلى مجموعة ${groupName} على WhatsApp: ${inviteLink}`;
  }
  
  return `مرحباً! سيتم دعوتك قريباً للانضمام إلى مجموعة ${groupName} على WhatsApp للتواصل مع زملائك والمدرسين.`;
}
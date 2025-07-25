// src/lib/phone-validation.ts

import { z } from 'zod';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  formattedValue?: string;
}

/**
 * Validates Egyptian phone numbers
 * Format: 01xxxxxxxxx (11 digits total, starting with 01)
 */
export function validateEgyptianPhone(phone: string): ValidationResult {
  // Remove any spaces, dashes, or other formatting
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if empty
  if (!cleanPhone) {
    return {
      isValid: false,
      message: 'رقم الهاتف مطلوب'
    };
  }
  
  // Check if it contains only digits
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'رقم الهاتف يجب أن يحتوي على أرقام فقط'
    };
  }
  
  // Check length (must be exactly 11 digits)
  if (cleanPhone.length !== 11) {
    if (cleanPhone.length < 11) {
      return {
        isValid: false,
        message: `رقم الهاتف يجب أن يكون 11 رقم (${cleanPhone.length}/11)`
      };
    } else {
      return {
        isValid: false,
        message: `رقم الهاتف يجب أن يكون 11 رقم فقط (${cleanPhone.length}/11)`
      };
    }
  }
  
  // Check if it starts with 01
  if (!cleanPhone.startsWith('01')) {
    return {
      isValid: false,
      message: 'رقم الهاتف يجب أن يبدأ بـ 01'
    };
  }
  
  // Check if the third digit is valid (Egyptian mobile operators)
  const thirdDigit = cleanPhone[2];
  const validThirdDigits = ['0', '1', '2', '5']; // Common Egyptian mobile prefixes
  
  if (!validThirdDigits.includes(thirdDigit)) {
    return {
      isValid: false,
      message: 'رقم الهاتف غير صحيح - يرجى التأكد من الرقم'
    };
  }
  
  return {
    isValid: true,
    message: 'رقم هاتف صحيح',
    formattedValue: formatEgyptianPhone(cleanPhone)
  };
}

/**
 * Formats Egyptian phone number for display
 * Example: 01234567890 -> 0123 456 7890
 */
export function formatEgyptianPhone(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleanPhone.length !== 11) {
    return cleanPhone;
  }
  
  return `${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
}

/**
 * Checks if phone number is valid length (11 digits)
 */
export function isValidLength(phone: string): boolean {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return cleanPhone.length === 11;
}

/**
 * Real-time validation for input fields
 * Returns validation state for UI feedback
 */
export function getRealTimeValidation(phone: string): {
  isValid: boolean;
  isComplete: boolean;
  message: string;
  variant: 'success' | 'error' | 'warning' | 'default';
} {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (!cleanPhone) {
    return {
      isValid: false,
      isComplete: false,
      message: 'أدخل رقم الهاتف',
      variant: 'default'
    };
  }
  
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      isComplete: false,
      message: 'أرقام فقط',
      variant: 'error'
    };
  }
  
  if (cleanPhone.length < 11) {
    if (!cleanPhone.startsWith('01')) {
      return {
        isValid: false,
        isComplete: false,
        message: 'يجب أن يبدأ بـ 01',
        variant: 'error'
      };
    }
    
    return {
      isValid: false,
      isComplete: false,
      message: `${cleanPhone.length}/11 رقم`,
      variant: 'warning'
    };
  }
  
  if (cleanPhone.length > 11) {
    return {
      isValid: false,
      isComplete: false,
      message: '11 رقم فقط',
      variant: 'error'
    };
  }
  
  // Exactly 11 digits - validate format
  const validation = validateEgyptianPhone(cleanPhone);
  
  return {
    isValid: validation.isValid,
    isComplete: true,
    message: validation.message,
    variant: validation.isValid ? 'success' : 'error'
  };
}

/**
 * Restricts input to only allow valid phone number characters
 * Returns the filtered input value
 */
export function restrictPhoneInput(value: string): string {
  // Only allow digits and common formatting characters
  return value.replace(/[^\d\s\-\(\)]/g, '');
}

/**
 * Handles phone input with automatic formatting and length restriction
 */
export function handlePhoneInput(value: string): string {
  // Remove all non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const limited = digitsOnly.slice(0, 11);
  
  return limited;
}

/**
 * Alias for handlePhoneInput for backward compatibility
 */
export function formatPhoneInput(value: string): string {
  return handlePhoneInput(value);
}

/**
 * Generates WhatsApp URL for a phone number
 */
export function generateWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Convert to international format (remove leading 0, add +20)
  const internationalPhone = cleanPhone.startsWith('0') 
    ? `+2${cleanPhone.slice(1)}` 
    : `+20${cleanPhone}`;
  
  const encodedMessage = message ? encodeURIComponent(message) : '';
  
  return `https://wa.me/${internationalPhone.replace('+', '')}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Zod schema for Egyptian phone number validation
 * Used in forms and server actions
 */
export const EgyptianPhoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .refine((phone) => {
    const validation = validateEgyptianPhone(phone);
    return validation.isValid;
  }, {
    message: 'رقم الهاتف غير صحيح - يجب أن يكون 11 رقم ويبدأ بـ 01'
  });
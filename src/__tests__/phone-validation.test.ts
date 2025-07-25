// src/__tests__/phone-validation.test.ts
import { 
  validateEgyptianPhone, 
  formatEgyptianPhone, 
  isValidLength,
  getRealTimeValidation,
  handlePhoneInput,
  generateWhatsAppUrl
} from '../lib/phone-validation';

describe('Phone Validation', () => {
  describe('validateEgyptianPhone', () => {
    test('should validate correct Egyptian phone numbers', () => {
      const validNumbers = [
        '01012345678',
        '01112345678',
        '01212345678',
        '01512345678'
      ];

      validNumbers.forEach(phone => {
        const result = validateEgyptianPhone(phone);
        expect(result.isValid).toBe(true);
        expect(result.message).toBe('رقم هاتف صحيح');
      });
    });

    test('should reject invalid Egyptian phone numbers', () => {
      const invalidNumbers = [
        '0123456789',    // 10 digits
        '012345678901',  // 12 digits
        '02012345678',   // doesn't start with 01
        '01312345678',   // invalid third digit
        '1012345678',    // missing leading 0
        'abc1234567',    // contains letters
        ''               // empty string
      ];

      invalidNumbers.forEach(phone => {
        const result = validateEgyptianPhone(phone);
        expect(result.isValid).toBe(false);
      });
    });

    test('should handle phone numbers with formatting', () => {
      const formattedNumbers = [
        '010 1234 5678',
        '010-1234-5678',
        '(010) 1234-5678'
      ];

      formattedNumbers.forEach(phone => {
        const result = validateEgyptianPhone(phone);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('formatEgyptianPhone', () => {
    test('should format valid phone numbers correctly', () => {
      const result = formatEgyptianPhone('01012345678');
      expect(result).toBe('0101 234 5678');
    });

    test('should return original for invalid numbers', () => {
      const invalidPhone = '123456';
      const result = formatEgyptianPhone(invalidPhone);
      expect(result).toBe(invalidPhone);
    });
  });

  describe('isValidLength', () => {
    test('should check length correctly', () => {
      expect(isValidLength('01012345678')).toBe(true);
      expect(isValidLength('0101234567')).toBe(false);
      expect(isValidLength('010123456789')).toBe(false);
    });
  });

  describe('getRealTimeValidation', () => {
    test('should provide real-time feedback', () => {
      // Empty input
      let result = getRealTimeValidation('');
      expect(result.variant).toBe('default');
      expect(result.message).toBe('أدخل رقم الهاتف');

      // Partial input
      result = getRealTimeValidation('010123');
      expect(result.variant).toBe('warning');
      expect(result.message).toContain('/11');

      // Complete valid input
      result = getRealTimeValidation('01012345678');
      expect(result.variant).toBe('success');
      expect(result.isValid).toBe(true);

      // Invalid input
      result = getRealTimeValidation('01312345678');
      expect(result.variant).toBe('error');
      expect(result.isValid).toBe(false);
    });
  });

  describe('handlePhoneInput', () => {
    test('should filter and limit input correctly', () => {
      expect(handlePhoneInput('abc01012345678def')).toBe('01012345678');
      expect(handlePhoneInput('010123456789012')).toBe('01012345678');
      expect(handlePhoneInput('010 123 456 78')).toBe('01012345678');
    });
  });

  describe('generateWhatsAppUrl', () => {
    test('should generate correct WhatsApp URLs', () => {
      const phone = '01012345678';
      const message = 'مرحباً';
      const url = generateWhatsAppUrl(phone, message);
      
      expect(url).toContain('https://wa.me/201012345678');
      expect(url).toContain(encodeURIComponent(message));
    });

    test('should handle URLs without messages', () => {
      const phone = '01012345678';
      const url = generateWhatsAppUrl(phone);
      
      expect(url).toBe('https://wa.me/201012345678');
    });

    test('should throw error for invalid phone numbers', () => {
      expect(() => {
        generateWhatsAppUrl('invalid');
      }).toThrow();
    });
  });
});
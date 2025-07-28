// src/lib/error-handling.ts
import { ZodError } from "zod";

export interface FormError {
  field?: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  success: boolean;
  errors: FormError[];
  message?: string;
}

/**
 * Formats Zod validation errors into user-friendly Arabic messages
 */
export function formatZodErrors(error: ZodError): FormError[] {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Formats database errors into user-friendly messages
 */
export function formatDatabaseError(error: Error): FormError {
  const message = error.message.toLowerCase();

  if (message.includes("unique constraint")) {
    if (message.includes("phone")) {
      return {
        field: "phone",
        message: "رقم الهاتف مستخدم بالفعل",
        code: "DUPLICATE_PHONE",
      };
    }
    if (message.includes("studentid")) {
      return {
        field: "studentId",
        message: "كود الطالب موجود بالفعل",
        code: "DUPLICATE_STUDENT_ID",
      };
    }
    return {
      message: "البيانات المدخلة مكررة",
      code: "DUPLICATE_DATA",
    };
  }

  if (message.includes("foreign key")) {
    return {
      message: "خطأ في ربط البيانات",
      code: "FOREIGN_KEY_ERROR",
    };
  }

  if (message.includes("not null")) {
    return {
      message: "حقل مطلوب مفقود",
      code: "MISSING_REQUIRED_FIELD",
    };
  }

  return {
    message: "خطأ في قاعدة البيانات",
    code: "DATABASE_ERROR",
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  errors: FormError[],
  generalMessage?: string
): {
  success: false;
  errors: { [key: string]: string[] };
  message: string;
} {
  const fieldErrors: { [key: string]: string[] } = {};

  errors.forEach((error) => {
    if (error.field) {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error.message);
    }
  });

  const errorCount = errors.length;
  const defaultMessage =
    errorCount > 1
      ? `تم العثور على ${errorCount} أخطاء. يرجى تصحيحها والمحاولة مرة أخرى.`
      : "يرجى تصحيح الخطأ والمحاولة مرة أخرى.";

  return {
    success: false,
    errors: fieldErrors,
    message: generalMessage || defaultMessage,
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse(
  message: string,
  data?: any
): {
  success: true;
  message: string;
  data?: any;
} {
  return {
    success: true,
    message,
    ...(data && { data }),
  };
}

/**
 * Validates form data with custom validation rules
 */
export function validateFormData(
  data: Record<string, any>,
  rules: Record<string, (value: any) => string | null>
): ValidationResult {
  const errors: FormError[] = [];

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(data[field]);
    if (error) {
      errors.push({
        field,
        message: error,
      });
    }
  });

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (fieldName: string) => (value: any) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldName} مطلوب`;
    }
    return null;
  },

  minLength: (fieldName: string, min: number) => (value: string) => {
    if (value && value.length < min) {
      return `${fieldName} يجب أن يكون ${min} أحرف على الأقل`;
    }
    return null;
  },

  maxLength: (fieldName: string, max: number) => (value: string) => {
    if (value && value.length > max) {
      return `${fieldName} يجب أن يكون ${max} حرف كحد أقصى`;
    }
    return null;
  },

  arabicOnly: (fieldName: string) => (value: string) => {
    if (value && !/^[\u0600-\u06FF\s]+$/.test(value)) {
      return `${fieldName} يجب أن يحتوي على أحرف عربية فقط`;
    }
    return null;
  },

  numbersOnly: (fieldName: string) => (value: string) => {
    if (value && !/^\d+$/.test(value)) {
      return `${fieldName} يجب أن يحتوي على أرقام فقط`;
    }
    return null;
  },
};

/**
 * Handles async operations with error catching
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<{ success: boolean; data?: T; error?: FormError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    console.error("Async operation error:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: formatDatabaseError(error),
      };
    }

    return {
      success: false,
      error: {
        message: errorMessage || "حدث خطأ غير متوقع",
        code: "UNKNOWN_ERROR",
      },
    };
  }
}

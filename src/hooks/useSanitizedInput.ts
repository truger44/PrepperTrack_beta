import { useState, useCallback } from 'react';
import { sanitizeText, sanitizeNumber, sanitizeEmail, sanitizeDate, sanitizeStringArray } from '../utils/sanitization';

/**
 * Custom hook for sanitized input handling
 * Automatically sanitizes input values and provides validation
 */

type SanitizationType = 'text' | 'number' | 'email' | 'date' | 'array';

interface UseSanitizedInputOptions {
  type: SanitizationType;
  initialValue?: any;
  validator?: (value: any) => boolean;
  onValidationError?: (error: string) => void;
}

export function useSanitizedInput({
  type,
  initialValue = '',
  validator,
  onValidationError,
}: UseSanitizedInputOptions) {
  const [value, setValue] = useState(() => {
    switch (type) {
      case 'text':
        return sanitizeText(initialValue);
      case 'number':
        return sanitizeNumber(initialValue);
      case 'email':
        return sanitizeEmail(initialValue);
      case 'date':
        return sanitizeDate(initialValue);
      case 'array':
        return sanitizeStringArray(initialValue);
      default:
        return sanitizeText(initialValue);
    }
  });

  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateValue = useCallback((newValue: any) => {
    let sanitizedValue: any;

    // Sanitize based on type
    switch (type) {
      case 'text':
        sanitizedValue = sanitizeText(newValue);
        break;
      case 'number':
        sanitizedValue = sanitizeNumber(newValue);
        break;
      case 'email':
        sanitizedValue = sanitizeEmail(newValue);
        break;
      case 'date':
        sanitizedValue = sanitizeDate(newValue);
        break;
      case 'array':
        sanitizedValue = sanitizeStringArray(newValue);
        break;
      default:
        sanitizedValue = sanitizeText(newValue);
    }

    // Validate if validator is provided
    let validationResult = true;
    let validationError: string | null = null;

    if (validator) {
      validationResult = validator(sanitizedValue);
      if (!validationResult) {
        validationError = `Invalid ${type} value`;
        if (onValidationError) {
          onValidationError(validationError);
        }
      }
    }

    // Additional type-specific validation
    if (type === 'email' && sanitizedValue && !sanitizedValue.includes('@')) {
      validationResult = false;
      validationError = 'Invalid email format';
    }

    if (type === 'number' && isNaN(sanitizedValue)) {
      validationResult = false;
      validationError = 'Invalid number format';
    }

    setValue(sanitizedValue);
    setIsValid(validationResult);
    setError(validationError);

    return sanitizedValue;
  }, [type, validator, onValidationError]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setIsValid(true);
    setError(null);
  }, [initialValue]);

  return {
    value,
    setValue: updateValue,
    isValid,
    error,
    reset,
  };
}

/**
 * Hook for sanitized form handling
 */
export function useSanitizedForm<T extends Record<string, any>>(
  initialValues: T,
  sanitizers: Record<keyof T, SanitizationType>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValid, setIsValid] = useState(true);

  const updateField = useCallback((field: keyof T, value: any) => {
    const sanitizerType = sanitizers[field];
    let sanitizedValue: any;

    switch (sanitizerType) {
      case 'text':
        sanitizedValue = sanitizeText(value);
        break;
      case 'number':
        sanitizedValue = sanitizeNumber(value);
        break;
      case 'email':
        sanitizedValue = sanitizeEmail(value);
        break;
      case 'date':
        sanitizedValue = sanitizeDate(value);
        break;
      case 'array':
        sanitizedValue = sanitizeStringArray(value);
        break;
      default:
        sanitizedValue = sanitizeText(value);
    }

    setValues(prev => ({ ...prev, [field]: sanitizedValue }));

    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, [sanitizers]);

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let formIsValid = true;

    Object.entries(values).forEach(([key, value]) => {
      const field = key as keyof T;
      const sanitizerType = sanitizers[field];

      // Type-specific validation
      if (sanitizerType === 'email' && value && !value.includes('@')) {
        newErrors[field] = 'Invalid email format';
        formIsValid = false;
      }

      if (sanitizerType === 'number' && isNaN(value)) {
        newErrors[field] = 'Invalid number format';
        formIsValid = false;
      }

      if (sanitizerType === 'text' && typeof value !== 'string') {
        newErrors[field] = 'Invalid text format';
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return formIsValid;
  }, [values, sanitizers]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsValid(true);
  }, [initialValues]);

  const getSanitizedValues = useCallback(() => {
    const sanitizedValues = { ...values };
    
    Object.keys(sanitizedValues).forEach(key => {
      const field = key as keyof T;
      const sanitizerType = sanitizers[field];
      
      switch (sanitizerType) {
        case 'text':
          sanitizedValues[field] = sanitizeText(sanitizedValues[field]);
          break;
        case 'number':
          sanitizedValues[field] = sanitizeNumber(sanitizedValues[field]);
          break;
        case 'email':
          sanitizedValues[field] = sanitizeEmail(sanitizedValues[field]);
          break;
        case 'date':
          sanitizedValues[field] = sanitizeDate(sanitizedValues[field]);
          break;
        case 'array':
          sanitizedValues[field] = sanitizeStringArray(sanitizedValues[field]);
          break;
      }
    });

    return sanitizedValues;
  }, [values, sanitizers]);

  return {
    values,
    errors,
    isValid,
    updateField,
    validateForm,
    reset,
    getSanitizedValues,
  };
}
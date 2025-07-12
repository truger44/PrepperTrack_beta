import React, { forwardRef, InputHTMLAttributes } from 'react';
import { useSanitizedInput } from '../../hooks/useSanitizedInput';

interface SecureInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  sanitizationType?: 'text' | 'number' | 'email' | 'date';
  validator?: (value: any) => boolean;
  onValidationError?: (error: string) => void;
  showError?: boolean;
}

const SecureInput = forwardRef<HTMLInputElement, SecureInputProps>(({
  value: externalValue,
  onChange: externalOnChange,
  sanitizationType = 'text',
  validator,
  onValidationError,
  showError = true,
  className = '',
  ...props
}, ref) => {
  const {
    value,
    setValue,
    isValid,
    error,
  } = useSanitizedInput({
    type: sanitizationType,
    initialValue: externalValue || '',
    validator,
    onValidationError,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = setValue(e.target.value);
    if (externalOnChange) {
      externalOnChange(newValue);
    }
  };

  const baseClassName = `
    w-full px-3 py-2 border rounded-lg transition-colors
    focus:ring-2 focus:ring-green-500 focus:border-transparent
    ${!isValid ? 'border-red-300 bg-red-50' : 'border-slate-300'}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      <input
        ref={ref}
        {...props}
        value={value}
        onChange={handleChange}
        className={baseClassName}
      />
      {showError && error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
});

SecureInput.displayName = 'SecureInput';

export default SecureInput;
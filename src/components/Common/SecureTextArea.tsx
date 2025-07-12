import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { useSanitizedInput } from '../../hooks/useSanitizedInput';

interface SecureTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  validator?: (value: any) => boolean;
  onValidationError?: (error: string) => void;
  showError?: boolean;
  maxLength?: number;
}

const SecureTextArea = forwardRef<HTMLTextAreaElement, SecureTextAreaProps>(({
  value: externalValue,
  onChange: externalOnChange,
  validator,
  onValidationError,
  showError = true,
  maxLength = 1000,
  className = '',
  ...props
}, ref) => {
  const {
    value,
    setValue,
    isValid,
    error,
  } = useSanitizedInput({
    type: 'text',
    initialValue: externalValue || '',
    validator: (val) => {
      if (val.length > maxLength) return false;
      return validator ? validator(val) : true;
    },
    onValidationError,
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = setValue(e.target.value);
    if (externalOnChange) {
      externalOnChange(newValue);
    }
  };

  const baseClassName = `
    w-full px-3 py-2 border rounded-lg transition-colors resize-vertical
    focus:ring-2 focus:ring-green-500 focus:border-transparent
    ${!isValid ? 'border-red-300 bg-red-50' : 'border-slate-300'}
    ${className}
  `.trim();

  return (
    <div className="w-full">
      <textarea
        ref={ref}
        {...props}
        value={value}
        onChange={handleChange}
        className={baseClassName}
        maxLength={maxLength}
      />
      <div className="flex justify-between items-center mt-1">
        {showError && error && (
          <p className="text-red-600 text-xs">{error}</p>
        )}
        <p className="text-slate-500 text-xs ml-auto">
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
});

SecureTextArea.displayName = 'SecureTextArea';

export default SecureTextArea;
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  className?: string; // applied to the outer wrapper so callers can control grid/span
  inputClassName?: string; // additional classes for the input element
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', inputClassName = '', ...props }, ref) => {
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder-gray-400';

  return (
    <div className={`form-field ${className}`.trim()}>
      <label className="form-label">{label}</label>
      <input
        ref={ref}
        className={`${baseClasses} ${inputClassName} ${error ? errorClasses : ''}`.trim()}
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text-primary, #c9c4b8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
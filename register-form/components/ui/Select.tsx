import React, { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string; // applied to wrapper
  selectClassName?: string; // applied to select element
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, children, className = '', selectClassName = '', ...props }, ref) => {
  const errorClasses = 'border-red-500 focus:border-red-500 focus:ring-red-500';
  const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none';

  return (
    <div className={`form-field relative ${className}`.trim()}>
      <label className="form-label">{label}</label>
      <select
        ref={ref}
        className={`${baseClasses} ${selectClassName} ${error ? errorClasses : ''}`.trim()}
        style={{
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text-primary, #c9c4b8)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2" style={{ color: 'var(--theme-text-secondary)' }}>
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
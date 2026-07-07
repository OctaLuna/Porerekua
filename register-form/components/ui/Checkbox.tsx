import React, { forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, ...props }, ref) => {
  return (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className="h-4 w-4 rounded focus:ring-blue-500"
        style={{
          borderColor: 'rgba(255, 255, 255, 0.1)',
          accentColor: 'var(--color-verde-brote)',
        }}
        {...props}
      />
      <span className="checkbox-label">{label}</span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
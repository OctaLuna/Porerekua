import React from 'react';
import { useFormContext } from 'react-hook-form';
import Checkbox from './Checkbox';

interface CheckboxGroupProps {
  name: string;
  label: string;
  options: string[];
  error?: string;
  validation?: object;
  className?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ name, label, options, error, validation, className='' }) => {
  const { register } = useFormContext();

  return (
    <div className={`form-field ${className}`}>
      <p className="form-label question-accent">{label}</p>
      <div className="grid grid-cols-2 gap-5">
        {options.map((option) => (
          <Checkbox
            key={option}
            label={option}
            value={option}
            {...register(name, validation)}
          />
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default CheckboxGroup;

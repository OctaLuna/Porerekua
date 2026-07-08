import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'btn';

  const variantStyles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    destructive: 'btn-destructive',
  };

  const sizeStyles = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-2.5 px-6 text-base',
    lg: 'py-3 px-8 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

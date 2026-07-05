{/* FIX: Implemented the reusable Card component. */}
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={`bg-blanco-puro/95 dark:bg-noche-selva/60 backdrop-blur-md border border-carbon/10 dark:border-white/10 shadow-subtle rounded-lg overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
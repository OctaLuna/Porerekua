import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const percentage = (currentStep / totalSteps) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium text-leaf-vibrant-adaptive">Paso {currentStep} de {totalSteps}</span>
        <span className="text-sm font-medium text-leaf-vibrant-adaptive">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-brand-earth-brown/10 rounded-full h-2.5">
        <div
          className="bg-brand-leaf-vibrant h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
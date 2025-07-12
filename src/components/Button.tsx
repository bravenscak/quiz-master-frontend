import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'white';
  disabled?: boolean;  
  className?: string;  
}

function Button({ 
  text, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = ''
}: ButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-quiz-primary text-white border-0 hover:bg-green-600';
      case 'secondary':
        return 'bg-quiz-gray text-white border-0 hover:bg-gray-600';
      case 'white':
        return 'bg-white text-quiz-primary border-2 border-white hover:bg-gray-50';
      default:
        return 'bg-quiz-primary text-white border-0 hover:bg-green-600';
    }
  };

  const getDisabledClasses = () => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed hover:transform-none';
    }
    return 'hover:-translate-y-0.5';
  };

  return (
    <button
      onClick={disabled ? undefined : onClick} 
      disabled={disabled}
      className={`
        ${getVariantClasses()}
        ${getDisabledClasses()}
        px-6 py-3 
        rounded-md 
        text-base 
        font-bold 
        shadow-md 
        transition-all 
        duration-200
        ${className}
      `}
    >
      {text}
    </button>
  );
}

export default Button;
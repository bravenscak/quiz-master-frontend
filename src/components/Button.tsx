import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'white';
}

function Button({ text, onClick, variant = 'primary' }: ButtonProps) {
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

  return (
    <button
      onClick={onClick}
      className={`
        ${getVariantClasses()}
        px-6 py-3 
        rounded-md 
        text-base 
        cursor-pointer 
        font-bold 
        shadow-md 
        transition-all 
        duration-200 
        hover:-translate-y-0.5
      `}
    >
      {text}
    </button>
  );
}

export default Button;
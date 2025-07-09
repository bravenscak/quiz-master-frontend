import React from 'react';
import { QuizCardData } from '../types/quiz';

interface QuizCardProps {
  quiz: QuizCardData;
  onClick: (quizId: number) => void;
}

function QuizCard({ quiz, onClick }: QuizCardProps) {
  const handleClick = () => {
    onClick(quiz.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      onClick={handleClick}
      className="
        bg-white 
        rounded-lg 
        p-6 
        shadow-lg 
        cursor-pointer 
        border 
        border-gray-200 
        transition-all 
        duration-200 
        hover:-translate-y-1 
        hover:shadow-xl
      "
    >
      <h3 className="text-quiz-primary text-xl font-bold mb-2">
        {quiz.name}
      </h3>
      
      <p className="text-quiz-primary-dark text-sm mb-2">
        <strong>Organizator:</strong> {quiz.organizerName}
      </p>
      
      <p className="text-quiz-gray text-sm mb-2">
        <strong>Lokacija:</strong> {quiz.locationName}
      </p>
      
      <p className="text-quiz-gray text-sm mb-3">
        <strong>Vrijeme:</strong> {formatDate(quiz.dateTime)}
      </p>
      
      <span className="
        bg-quiz-primary 
        text-white 
        px-3 
        py-1 
        rounded-full 
        text-xs 
        font-bold
        inline-block
      ">
        {quiz.categoryName}
      </span>
    </div>
  );
}

export default QuizCard;
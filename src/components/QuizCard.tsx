import React from 'react';
import { QuizCardData } from '../types/quiz';

interface QuizCardProps {
  quiz: QuizCardData;
  onClick: (quizId: number) => void;
  hideBadge?: boolean; 
}

const getDateBadge = (dateString: string): { text: string; color: string } | null => {
  const quizDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowMidnight = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  const quizDateMidnight = new Date(quizDate.getFullYear(), quizDate.getMonth(), quizDate.getDate());
  
  if (quizDateMidnight.getTime() === todayMidnight.getTime()) {
    return { text: 'Danas', color: 'bg-red-500 text-white' };
  }
  
  if (quizDateMidnight.getTime() === tomorrowMidnight.getTime()) {
    return { text: 'Sutra', color: 'bg-orange-500 text-white' };
  }
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  if (quizDate > tomorrow && quizDate <= nextWeek) {
    return { text: 'Uskoro', color: 'bg-blue-500 text-white' };
  }
  
  return null;
};

function QuizCard({ quiz, onClick, hideBadge = false }: QuizCardProps) {
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

  const badge = getDateBadge(quiz.dateTime);

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
        relative
      "
    >
      {badge && !hideBadge && (
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color} shadow-md`}>
            {badge.text}
          </span>
        </div>
      )}

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
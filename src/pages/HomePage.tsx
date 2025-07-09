import React, { useState, useMemo } from 'react';
import QuizCard from '../components/QuizCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { QuizCardData } from '../types/quiz';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleQuizClick = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  const mockQuizzes: QuizCardData[] = [
    {
      id: 1,
      name: "Opći kviz znanja",
      organizerName: "Bruno Kviz Tim", 
      locationName: "Pub Central",
      dateTime: "2025-07-15T20:00:00",
      categoryName: "Opće znanje"
    },
    {
      id: 2,
      name: "Sport i povijest",
      organizerName: "Zagrebački kvizovi",
      locationName: "Kavana Sport", 
      dateTime: "2025-07-18T19:30:00",
      categoryName: "Sport"
    },
    {
      id: 3,
      name: "Filmski kviz večer",
      organizerName: "CineQuiz Croatia",
      locationName: "Cinema Bar",
      dateTime: "2025-07-20T21:00:00", 
      categoryName: "Film"
    },
    {
      id: 4,
      name: "Glazbeni kviz 90-ih",
      organizerName: "Retro Sound",
      locationName: "Music Pub Zagreb",
      dateTime: "2025-07-22T20:30:00",
      categoryName: "Glazba"
    },
    {
      id: 5,
      name: "Tehnološki kviz",
      organizerName: "Tech Quiz Zagreb",
      locationName: "StartUp Hub",
      dateTime: "2025-07-25T19:00:00",
      categoryName: "Tehnologija"
    }
  ];

  const categories = useMemo(() => {
    return Array.from(new Set(mockQuizzes.map(quiz => quiz.categoryName)));
  }, [mockQuizzes]);

  const filteredQuizzes = useMemo(() => {
    return mockQuizzes.filter(quiz => {
      const matchesSearch = searchTerm === '' || 
        quiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.organizerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.locationName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || 
        quiz.categoryName === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [mockQuizzes, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h2 className="text-quiz-primary text-3xl font-bold mb-2">
          Dostupni kvizovi
        </h2>
        <p className="text-gray-600">
          Pronađi kviz koji te zanima
        </p>
      </div>

      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Pretraži po nazivu, organizatoru ili lokaciji..."
          />
          
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
          
          {(searchTerm || selectedCategory) && (
            <button
              onClick={clearFilters}
              className="
                text-quiz-primary 
                text-sm 
                underline 
                hover:no-underline
                transition-all
                duration-200
                whitespace-nowrap
              "
            >
              Očisti filtere
            </button>
          )}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          {filteredQuizzes.length === mockQuizzes.length 
            ? `Prikazuje se ${filteredQuizzes.length} kvizova`
            : `Prikazuje se ${filteredQuizzes.length} od ${mockQuizzes.length} kvizova`
          }
        </div>
      </div>
      
      {filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => (
            <QuizCard 
              key={quiz.id}
              quiz={quiz}
              onClick={handleQuizClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nema rezultata
          </h3>
          <p className="text-gray-500 mb-4">
            Pokušaj s drugačijim pretraživanjem ili promijeni filtere.
          </p>
          <button
            onClick={clearFilters}
            className="text-quiz-primary hover:underline"
          >
            Obriši sve filtere
          </button>
        </div>
      )}
    </main>
  );
}

export default HomePage;
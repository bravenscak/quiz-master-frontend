import React, { useState, useMemo, useEffect } from 'react';
import QuizCard from '../components/QuizCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { QuizCardData, QuizSearchParams } from '../types/quiz';
import { QuizService } from '../services/quizService';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleQuizClick = (quizId: number) => {
    navigate(`/quiz/${quizId}`);
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params: QuizSearchParams = {
        searchTerm: searchTerm || undefined,  
        sortBy: 'DateTime',
        sortDirection: 'Ascending'
      };

      // TODO: Dodaj categoryId kad implementiramo kategorije
      // if (selectedCategory) {
      //   params.categoryId = getCategoryIdByName(selectedCategory);
      // }

      const data = await QuizService.getQuizzes(params);
      setQuizzes(data);
      
    } catch (err: any) {
      setError(err.message || 'Greška pri dohvaćanju kvizova');
      setQuizzes([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []); 

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuizzes();
    }, 500);

    return () => clearTimeout(timeoutId); 
  }, [searchTerm, selectedCategory]);

  const categories = ['Opće znanje', 'Sport', 'Film', 'Glazba', 'Tehnologija'];

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
          {loading ? (
            'Učitavanje kvizova...'
          ) : error ? (
            <span className="text-red-600">Greška: {error}</span>
          ) : (
            `Prikazuje se ${quizzes.length} kvizova`
          )}
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4 animate-pulse">⏳</div>
          <h3 className="text-xl font-semibold text-gray-600">
            Učitavanje kvizova...
          </h3>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Greška pri učitavanju
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchQuizzes}
            className="text-quiz-primary hover:underline"
          >
            Pokušaj ponovno
          </button>
        </div>
      )}

      {!loading && !error && (
        quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
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
        )
      )}
    </main>
  );
}

export default HomePage;
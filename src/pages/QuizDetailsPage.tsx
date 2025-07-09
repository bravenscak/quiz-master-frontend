import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';

function QuizDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <main className="p-8">
      <div className="mb-6">
        <Button text="← Nazad" onClick={handleGoBack} variant="secondary" />
      </div>
      
      <h1 className="text-quiz-primary text-4xl font-bold mt-4 mb-6">
        Detalji kviza #{id}
      </h1>
      
      <p className="text-quiz-gray text-lg mb-8">
        Ovdje će biti detaljni prikaz kviza s ID: {id}
      </p>
      
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">TODO: Učitaj podatke kviza iz backend-a</h3>
        <p className="text-gray-600">URL parametar: {id}</p>
      </div>
    </main>
  );
}

export default QuizDetailsPage;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; 
import Header from './components/Header';
import HomePage from './pages/HomePage';
import QuizDetailsPage from './pages/QuizDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrganizatorPage from './pages/OrganizatorPage';
import ProfilePage from './pages/ProfilePage';
import CreateQuizPage from './pages/CreateQuizPage';
import EditQuizPage from './pages/EditQuizPage';

function App() {
  return (
    <Router>
      <AuthProvider> 
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz/:id" element={<QuizDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/organizer/:id" element={<OrganizatorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-quiz" element={<CreateQuizPage />} />
            <Route path="/edit-quiz/:id" element={<EditQuizPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
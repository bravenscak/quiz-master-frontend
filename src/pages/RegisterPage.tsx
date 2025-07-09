import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { AuthService } from '../services/authService'; 
import { RegisterRequest } from '../types/auth';        
import { useAuth } from '../contexts/AuthContext';      

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  roleId: number;
  organizationName?: string;
  description?: string;
}

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    roleId: 3,
    organizationName: '',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      roleId,
      organizationName: roleId === 3 ? '' : prev.organizationName,
      description: roleId === 3 ? '' : prev.description
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Lozinke se ne podudaraju');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Lozinka mora imati najmanje 6 znakova');
      return false;
    }

    if (formData.roleId === 2 && !formData.organizationName) {
      setError('Naziv organizacije je obavezan za organizatore');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        roleId: formData.roleId,
        organizationName: formData.organizationName || undefined,
        description: formData.description || undefined
      };

      const response = await AuthService.register(registerData);
      
      console.log('Uspješna registracija:', response.user);
      
      if (formData.roleId === 2 && !response.user.isApproved) {
        AuthService.logout();
        alert('Registracija uspješna! Vaš račun čeka odobrenje administratora.');
        navigate('/login');
      } else {
        await login(formData.username, formData.password);
        alert('Registracija uspješna! Dobrodošli!');
        navigate('/');
      }
      
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji. Pokušajte ponovno.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 flex justify-center items-center min-h-[calc(100vh-120px)]">
      <div className="bg-white p-12 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-quiz-primary text-center mb-8 text-3xl font-bold">
          Registracija
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-4 text-quiz-primary-dark font-bold">
              Registriraj se kao:
            </label>
            
            <div className="flex gap-8">
              <label className="flex items-center cursor-pointer text-base">
                <input
                  type="radio"
                  name="role"
                  checked={formData.roleId === 3}
                  onChange={() => handleRoleChange(3)}
                  className="mr-2 w-4 h-4"
                />
                Natjecatelj
              </label>
              
              <label className="flex items-center cursor-pointer text-base">
                <input
                  type="radio"
                  name="role"
                  checked={formData.roleId === 2}
                  onChange={() => handleRoleChange(2)}
                  className="mr-2 w-4 h-4"
                />
                Organizator
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-quiz-primary-dark font-bold">
                Ime
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-md text-base 
                  transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              />
            </div>
            
            <div>
              <label className="block mb-2 text-quiz-primary-dark font-bold">
                Prezime
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-md text-base 
                  transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-quiz-primary-dark font-bold">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="
                w-full p-3 border-2 border-gray-200 rounded-md text-base 
                transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
            />
          </div>

          <div>
            <label className="block mb-2 text-quiz-primary-dark font-bold">
              Korisničko ime
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className="
                w-full p-3 border-2 border-gray-200 rounded-md text-base 
                transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-quiz-primary-dark font-bold">
                Lozinka
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-md text-base 
                  transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              />
            </div>
            
            <div>
              <label className="block mb-2 text-quiz-primary-dark font-bold">
                Potvrdi lozinku
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-md text-base 
                  transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                "
              />
            </div>
          </div>

          {formData.roleId === 2 && (
            <div className="space-y-6 p-6 bg-gray-50 rounded-lg border">
              <div>
                <label className="block mb-2 text-quiz-primary-dark font-bold">
                  Naziv organizacije *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  required={formData.roleId === 2}
                  disabled={isLoading}
                  className="
                    w-full p-3 border-2 border-gray-200 rounded-md text-base 
                    transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                  "
                />
              </div>

              <div>
                <label className="block mb-2 text-quiz-primary-dark font-bold">
                  Opis organizacije
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                  className="
                    w-full p-3 border-2 border-gray-200 rounded-md text-base 
                    transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                    resize-y disabled:bg-gray-100 disabled:cursor-not-allowed
                  "
                />
              </div>

              <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm">
                ℹ️ Računi organizatora trebaju odobrenje administratora prije korištenja.
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              text={isLoading ? 'Registriranje...' : 'Registriraj se'}
              onClick={() => {}}
              variant="primary"
            />
          </div>
        </form>

        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-quiz-gray mb-2">
            Već imaš račun?
          </p>
          <Link
            to="/login"
            className="
              text-quiz-primary 
              no-underline 
              font-bold 
              text-lg
              hover:underline
              transition-all
              duration-200
            "
          >
            Prijavi se
          </Link>
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
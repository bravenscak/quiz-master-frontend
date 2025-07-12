import React, { useState, useEffect } from 'react';
import Button from './Button';
import { UserService, UpdateUserRequest, ChangePasswordRequest } from '../services/userService';
import { UserResponse } from '../types/auth';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserResponse;
  onSuccess: (updatedUser: UserResponse) => void;
}

function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [profileData, setProfileData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    email: '',
    organizationName: '',
    description: ''
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organizationName: user.organizationName || '',
        description: user.description || ''
      });
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setError('');
      setActiveTab('profile');
    }
  }, [isOpen, user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setError('Ime i prezime su obavezni');
      return;
    }

    if (!profileData.email.trim()) {
      setError('Email je obavezan');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedUser = await UserService.updateUser(profileData);
      alert('Profil je uspješno ažuriran!');
      onSuccess(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordData.currentPassword) {
      setError('Trenutna lozinka je obavezna');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Nova lozinka mora imati najmanje 6 znakova');
      return;
    }

    if (passwordData.newPassword !== confirmPassword) {
      setError('Lozinke se ne podudaraju');
      return;
    }

    setIsSubmitting(true);

    try {
      await UserService.changePassword(passwordData);
      alert('Lozinka je uspješno promijenjena!');
      setPasswordData({ currentPassword: '', newPassword: '' });
      setConfirmPassword('');
      setActiveTab('profile');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Uredi profil</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-quiz-primary text-quiz-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Podaci profila
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'password'
                ? 'border-b-2 border-quiz-primary text-quiz-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Promijeni lozinku
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ime *
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prezime *
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={isSubmitting}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                />
              </div>

              {user.roleName === 'ORGANIZER' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organizacija
                    </label>
                    <input
                      type="text"
                      value={profileData.organizationName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, organizationName: e.target.value }))}
                      disabled={isSubmitting}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis
                    </label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      disabled={isSubmitting}
                      rows={3}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  text="Odustani"
                  onClick={onClose}
                  variant="secondary"
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  text={isSubmitting ? 'Spremam...' : 'Spremi promjene'}
                  onClick={() => {}}
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trenutna lozinka *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova lozinka *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">Najmanje 6 znakova</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potvrdi novu lozinku *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  text="Odustani"
                  onClick={() => setActiveTab('profile')}
                  variant="secondary"
                  disabled={isSubmitting}
                  className="flex-1"
                />
                <Button
                  text={isSubmitting ? 'Mijenjam...' : 'Promijeni lozinku'}
                  onClick={() => {}}
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;
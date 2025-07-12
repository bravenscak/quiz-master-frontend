import React, { useState } from 'react';
import Button from './Button';
import { TeamService, CreateTeamRequest } from '../services/teamService';

interface TeamRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: number;
  quizName: string;
  maxParticipantsPerTeam: number;
  onSuccess: () => void; 
}

function TeamRegistrationModal({
  isOpen,
  onClose,
  quizId,
  quizName,
  maxParticipantsPerTeam,
  onSuccess
}: TeamRegistrationModalProps) {
  const [teamName, setTeamName] = useState('');
  const [participantCount, setParticipantCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setParticipantCount(1);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!teamName.trim()) {
      setError('Ime tima je obavezno');
      return;
    }

    if (teamName.length < 2) {
      setError('Ime tima mora imati najmanje 2 znaka');
      return;
    }

    if (participantCount < 1 || participantCount > maxParticipantsPerTeam) {
      setError(`Broj igrača mora biti između 1 i ${maxParticipantsPerTeam}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const teamData: CreateTeamRequest = {
        name: teamName.trim(),
        participantCount,
        quizId
      };

      await TeamService.registerTeam(teamData);
      
      alert(`Tim "${teamName}" je uspješno registriran na kviz "${quizName}"!`);
      onSuccess(); 
      onClose(); 
    } catch (err: any) {
      setError(err.message || 'Greška pri registraciji tima');
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              Registracija tima
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Kviz: <span className="font-medium">{quizName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ime tima *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Unesite ime vašeg tima"
                disabled={isSubmitting}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-lg 
                  focus:border-quiz-primary focus:outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broj igrača u timu *
              </label>
              <select
                value={participantCount}
                onChange={(e) => setParticipantCount(parseInt(e.target.value))}
                disabled={isSubmitting}
                className="
                  w-full p-3 border-2 border-gray-200 rounded-lg 
                  focus:border-quiz-primary focus:outline-none
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {Array.from({ length: maxParticipantsPerTeam }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'igrač' : 'igrača'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Maksimalno {maxParticipantsPerTeam} igrača po timu
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              text="Odustani"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              text={isSubmitting ? 'Registriram...' : 'Registriraj tim'}
              onClick={() => {}} 
              variant="primary"
              disabled={isSubmitting}
              className="flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeamRegistrationModal;
import React, { useState, useEffect } from 'react';
import { QuizTeam, TeamService } from '../services/teamService';
import Button from './Button';

interface SetResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teams: QuizTeam[];
    quizName: string;
    onSuccess: () => void;
}

interface TeamResult {
    teamId: number;
    teamName: string;
    finalPosition: number;
}

function SetResultsModal({ isOpen, onClose, teams, quizName, onSuccess }: SetResultsModalProps) {
    const [results, setResults] = useState<TeamResult[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const sortedTeams = [...teams].sort((a, b) => {
                if (a.finalPosition && b.finalPosition) {
                    return a.finalPosition - b.finalPosition;
                }
                if (a.finalPosition && !b.finalPosition) return -1;
                if (!a.finalPosition && b.finalPosition) return 1;
                return a.name.localeCompare(b.name);
            });

            const initialResults = sortedTeams.map((team, index) => ({
                teamId: team.id,
                teamName: team.name,
                finalPosition: team.finalPosition || index + 1
            }));

            setResults(initialResults);
            setError('');
        }
    }, [isOpen, teams]);

    const handlePositionChange = (teamId: number, position: number) => {
        setResults(prev => prev.map(result => 
            result.teamId === teamId 
                ? { ...result, finalPosition: position }
                : result
        ));
    };

    const handleSubmit = async () => {
        setError('');
        
        const positions = results.map(r => r.finalPosition);
        const uniquePositions = new Set(positions);
        
        if (positions.length !== uniquePositions.size) {
            setError('Pozicije se ne smiju ponavljati');
            return;
        }

        const minPos = Math.min(...positions);
        const maxPos = Math.max(...positions);
        
        if (minPos < 1 || maxPos > teams.length) {
            setError(`Pozicije moraju biti između 1 i ${teams.length}`);
            return;
        }

        setIsSubmitting(true);

        try {
            await Promise.all(
                results.map(result => 
                    TeamService.setTeamResult(result.teamId, {
                        finalPosition: result.finalPosition
                    })
                )
            );

            alert(`Rezultati za kviz "${quizName}" su uspješno postavljeni!`);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Greška pri postavljanju rezultata');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Unos rezultata</h2>
                        <p className="text-gray-600">Kviz: {quizName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4 mb-6">
                    <div className="text-sm text-gray-600 mb-4">
                        Unesite konačnu poziciju za svaki tim (1 = pobjednik):
                    </div>

                    {results.map((result, index) => (
                        <div key={result.teamId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                    {result.teamName}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Tim #{result.teamId}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Pozicija:
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max={teams.length}
                                    value={result.finalPosition}
                                    onChange={(e) => handlePositionChange(
                                        result.teamId, 
                                        parseInt(e.target.value) || 1
                                    )}
                                    className="w-20 p-2 border-2 border-gray-200 rounded focus:border-quiz-primary focus:outline-none text-center"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-xs text-gray-500 mb-4">
                    💡 Savjet: Možete koristiti iste pozicije za timove koji dijele mjesto (npr. više timova na 3. mjestu)
                </div>

                <div className="flex gap-4">
                    <Button
                        text="Odustani"
                        onClick={onClose}
                        variant="secondary"
                        disabled={isSubmitting}
                        className="flex-1"
                    />
                    <Button
                        text={isSubmitting ? 'Postavljam rezultate...' : 'Postavi rezultate'}
                        onClick={handleSubmit}
                        variant="primary"
                        disabled={isSubmitting}
                        className="flex-1"
                    />
                </div>
            </div>
        </div>
    );
}

export default SetResultsModal;
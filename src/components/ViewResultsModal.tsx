import React from 'react';
import { QuizTeam } from '../services/teamService';
import Button from './Button';

interface ViewResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teams: QuizTeam[];
    quizName: string;
}

function ViewResultsModal({ isOpen, onClose, teams, quizName }: ViewResultsModalProps) {
    if (!isOpen) return null;

    const sortedTeams = [...teams].sort((a, b) => {
        if (a.finalPosition && b.finalPosition) {
            return a.finalPosition - b.finalPosition;
        }
        if (a.finalPosition && !b.finalPosition) return -1;
        if (!a.finalPosition && b.finalPosition) return 1;
        return a.name.localeCompare(b.name);
    });

    const groupedResults = sortedTeams.reduce((acc, team) => {
        const position = team.finalPosition || 'Nema poziciju';
        if (!acc[position]) {
            acc[position] = [];
        }
        acc[position].push(team);
        return acc;
    }, {} as Record<string | number, QuizTeam[]>);

    const getPositionDisplay = (position: string | number): string => {
        if (position === 'Nema poziciju') return position as string;
        
        const pos = Number(position);
        if (pos === 1) return '🥇 1. mjesto';
        if (pos === 2) return '🥈 2. mjesto';
        if (pos === 3) return '🥉 3. mjesto';
        return `${pos}. mjesto`;
    };

    const getPositionColor = (position: string | number): string => {
        if (position === 'Nema poziciju') return 'bg-gray-50 border-gray-200';
        
        const pos = Number(position);
        if (pos === 1) return 'bg-yellow-50 border-yellow-200';
        if (pos === 2) return 'bg-gray-50 border-gray-300';
        if (pos === 3) return 'bg-orange-50 border-orange-200';
        return 'bg-blue-50 border-blue-200';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Rezultati kviza</h2>
                        <p className="text-gray-600">{quizName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                {sortedTeams.every(team => !team.finalPosition) ? (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">
                            🏆
                        </div>
                        <p className="text-gray-600 text-lg">
                            Rezultati još nisu objavljeni
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            Organizator će objaviti rezultate nakon završetka kviza
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(groupedResults)
                            .sort(([a], [b]) => {
                                if (a === 'Nema poziciju') return 1;
                                if (b === 'Nema poziciju') return -1;
                                return parseInt(a) - parseInt(b);
                            })
                            .map(([position, teamsInPosition]) => (
                                <div key={position} className={`border-2 rounded-lg p-4 ${getPositionColor(position)}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            {getPositionDisplay(position)}
                                        </h3>
                                        {teamsInPosition.length > 1 && (
                                            <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                                {teamsInPosition.length} timova
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        {teamsInPosition.map((team) => (
                                            <div key={team.id} className="bg-white p-3 rounded border flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium text-gray-800">
                                                        {team.name}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Kapetan: {team.captainName} • {team.participantCount} igrača
                                                    </div>
                                                </div>
                                                
                                                {position !== 'Nema poziciju' && (
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-700">
                                                            #{position}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Ukupno timova: {teams.length}</span>
                        <span>
                            Rezultati objavljeni: {sortedTeams.filter(t => t.finalPosition).length}/{teams.length}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <Button
                        text="Zatvori"
                        onClick={onClose}
                        variant="secondary"
                    />
                </div>
            </div>
        </div>
    );
}

export default ViewResultsModal;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { TeamService, Team } from "../services/teamService";
import EditTeamModal from "../components/EditTeamModal";
import EditProfileModal from "../components/EditProfileModal";
import { UserResponse } from "../types/auth";

function ProfilePage() {
    const { user, isAuthenticated, updateUser } = useAuth();
    const navigate = useNavigate();

    const [myTeams, setMyTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editTeamModal, setEditTeamModal] = useState<{
        isOpen: boolean;
        team: Team | null;
        maxParticipants: number;
    }>({
        isOpen: false,
        team: null,
        maxParticipants: 1,
    });

    const [editProfileModal, setEditProfileModal] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login");
        }
    }, [isAuthenticated, navigate]);

    const fetchMyTeams = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError("");

        try {
            const teams = await TeamService.getMyTeams();
            setMyTeams(teams);
        } catch (err: any) {
            setError(err.message || "Greška pri dohvaćanju timova");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyTeams();
        }
    }, [isAuthenticated]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("hr-HR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleEditTeam = (team: Team) => {
        setEditTeamModal({
            isOpen: true,
            team: team,
            maxParticipants: team.maxParticipantsPerTeam,
        });
    };

    const handleEditSuccess = () => {
        fetchMyTeams();
        setEditTeamModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleProfileEditSuccess = (updatedUser: UserResponse) => {
        updateUser(updatedUser);
        setEditProfileModal(false);
    };

    const now = new Date();
    const upcomingTeams = myTeams.filter(
        (team) => new Date(team.quizDateTime) > now
    );
    const pastTeams = myTeams.filter(
        (team) => new Date(team.quizDateTime) <= now
    );

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                    ⏳
                </div>
                <h3 className="text-xl font-semibold text-gray-600">
                    Učitavanje...
                </h3>
            </div>
        );
    }

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    Moj profil
                </h1>
                <p className="text-gray-600">
                    Upravljaj svojim profilom i pregled registracija
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">
                            Podaci o profilu
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Korisničko ime
                                </label>
                                <p className="text-lg text-gray-900">
                                    {user?.username}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Ime
                                    </label>
                                    <p className="text-lg text-gray-900">
                                        {user?.firstName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Prezime
                                    </label>
                                    <p className="text-lg text-gray-900">
                                        {user?.lastName}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <p className="text-lg text-gray-900">
                                    {user?.email}
                                </p>
                            </div>

                            {user?.organizationName && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Organizacija
                                    </label>
                                    <p className="text-lg text-gray-900">
                                        {user.organizationName}
                                    </p>
                                </div>
                            )}

                            {user?.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Opis
                                    </label>
                                    <p className="text-gray-700">
                                        {user.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button
                                text="📝 Uredi profil"
                                onClick={() => setEditProfileModal(true)}
                                variant="primary"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-4">Statistike</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Ukupno registracija
                                </p>
                                <p className="text-2xl font-bold text-quiz-primary">
                                    {myTeams.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Nadolazeći kvizovi
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                    {upcomingTeams.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Završeni kvizovi
                                </p>
                                <p className="text-xl font-bold text-gray-600">
                                    {pastTeams.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Nadolazeći kvizovi ({upcomingTeams.length})
                    </h2>

                    {loading && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4 animate-pulse">
                                ⏳
                            </div>
                            <p className="text-gray-600">Učitavanje...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8 text-red-600">
                            {error}
                        </div>
                    )}

                    {!loading && upcomingTeams.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">
                                📅
                            </div>
                            <p className="text-gray-600">
                                Nema nadolazećih kvizova
                            </p>
                        </div>
                    )}

                    {upcomingTeams.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingTeams.map((team) => (
                                <div
                                    key={team.id}
                                    className="bg-white p-4 rounded-lg shadow border"
                                >
                                    <h3 className="font-bold text-lg text-quiz-primary mb-2">
                                        {team.quizName}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <strong>Tim:</strong> {team.name}
                                        </p>
                                        <p>
                                            <strong>Igrača:</strong>{" "}
                                            {team.participantCount}
                                        </p>
                                        <p>
                                            <strong>Datum:</strong>{" "}
                                            {formatDate(team.quizDateTime)}
                                        </p>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            text="👁️ Detalji"
                                            onClick={() =>
                                                navigate(`/quiz/${team.quizId}`)
                                            }
                                            variant="secondary"
                                            className="flex-1 text-sm"
                                        />
                                        <Button
                                            text="✏️ Uredi"
                                            onClick={() => handleEditTeam(team)}
                                            variant="white"
                                            className="flex-1 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Završeni kvizovi ({pastTeams.length})
                    </h2>

                    {pastTeams.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-4xl mb-4">
                                🏆
                            </div>
                            <p className="text-gray-600">
                                Nema završenih kvizova
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pastTeams.map((team) => (
                                <div
                                    key={team.id}
                                    className="bg-white p-4 rounded-lg shadow border"
                                >
                                    <h3 className="font-bold text-lg text-gray-700 mb-2">
                                        {team.quizName}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>
                                            <strong>Tim:</strong> {team.name}
                                        </p>
                                        <p>
                                            <strong>Igrača:</strong>{" "}
                                            {team.participantCount}
                                        </p>
                                        <p>
                                            <strong>Datum:</strong>{" "}
                                            {formatDate(team.quizDateTime)}
                                        </p>
                                        {team.finalPosition && (
                                            <p>
                                                <strong>Pozicija:</strong>{" "}
                                                {team.finalPosition}. mjesto
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <Button
                                            text="👁️ Rezultati"
                                            onClick={() =>
                                                navigate(`/quiz/${team.quizId}`)
                                            }
                                            variant="secondary"
                                            className="w-full text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <EditTeamModal
                isOpen={editTeamModal.isOpen}
                onClose={() =>
                    setEditTeamModal((prev) => ({ ...prev, isOpen: false }))
                }
                team={editTeamModal.team}
                maxParticipantsPerTeam={editTeamModal.maxParticipants}
                onSuccess={handleEditSuccess}
            />
            {user && (
                <EditProfileModal
                    isOpen={editProfileModal}
                    onClose={() => setEditProfileModal(false)}
                    user={user}
                    onSuccess={handleProfileEditSuccess}
                />
            )}
        </main>
    );
}

export default ProfilePage;

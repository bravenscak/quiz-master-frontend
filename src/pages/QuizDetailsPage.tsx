import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import TeamRegistrationModal from "../components/TeamRegistrationModal";
import SetResultsModal from "../components/SetResultsModal";
import ViewResultsModal from "../components/ViewResultsModal";
import { QuizService } from "../services/quizService";
import { TeamService, QuizTeam } from "../services/teamService";
import { QuizDetails } from "../types/quiz";
import { useAuth } from "../contexts/AuthContext";
import EditTeamModal from "../components/EditTeamModal";
import MapWrapper from "../components/maps/MapWrapper";
import QuizLocationMap from "../components/maps/QuizLocationMap";

function QuizDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [quiz, setQuiz] = useState<QuizDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [userTeam, setUserTeam] = useState<QuizTeam | null>(null);
    const [checkingRegistration, setCheckingRegistration] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showRegistrationOptions, setShowRegistrationOptions] =
        useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [registeredTeams, setRegisteredTeams] = useState<QuizTeam[]>([]);

    const [setResultsModal, setSetResultsModal] = useState(false);
    const [viewResultsModal, setViewResultsModal] = useState(false);

    const [editTeamModal, setEditTeamModal] = useState<{
        isOpen: boolean;
        team: QuizTeam | null;
    }>({
        isOpen: false,
        team: null,
    });

    const isQuizFinished = quiz && new Date(quiz.dateTime) < new Date();
    const isQuizOwner = user && quiz && user.id === quiz.organizerId;
    const hasResults = registeredTeams.some(team => team.finalPosition !== null && team.finalPosition !== undefined);

    const getActionButtonConfig = () => {
        if (!quiz) return null;

        if (!isAuthenticated) {
            return {
                text: "🔑 Prijavi se za registraciju",
                onClick: () => navigate("/login"),
                variant: "primary" as const,
                disabled: false,
            };
        }

        const userRole = user?.roleName;
        const isOwner = user?.id === quiz.organizerId;

        if (userRole === "COMPETITOR") {
            if (userTeam) {
                return {
                    text: `✅ Registriran kao "${userTeam.name}"`,
                    onClick: () => {
                        setShowRegistrationOptions(!showRegistrationOptions);
                    },
                    variant: "secondary" as const,
                    disabled: false,
                };
            }

            const isQuizFull = quiz.registeredTeamsCount >= quiz.maxTeams;

            if (isQuizFull) {
                return {
                    text: "❌ Kviz je popunjen",
                    onClick: () => { },
                    variant: "secondary" as const,
                    disabled: true,
                };
            }

            return {
                text: checkingRegistration
                    ? "⏳ Provjeravam..."
                    : "📝 Registriraj tim",
                onClick: () => {
                    setIsModalOpen(true);
                },
                variant: "primary" as const,
                disabled: checkingRegistration,
            };
        }

        if (userRole === "ORGANIZER" && isOwner) {
            return {
                text: "⚙️ Upravljaj kvizom",
                onClick: () => {
                    navigate(`/edit-quiz/${quiz.id}`);
                },
                variant: "secondary" as const,
                disabled: false,
            };
        }

        if (userRole === "ORGANIZER" && !isOwner) {
            return {
                text: "🚫 Samo vlasnik može upravljati",
                onClick: () => { },
                variant: "secondary" as const,
                disabled: true,
            };
        }

        if (userRole === "ADMIN") {
            return {
                text: "👑 Upravljaj kvizom (Admin)",
                onClick: () => {
                    navigate(`/edit-quiz/${quiz.id}`);
                },
                variant: "secondary" as const,
                disabled: false,
            };
        }

        return null;
    };

    const handleDeleteTeam = async () => {
        if (!userTeam) return;

        const confirmed = window.confirm(
            `Jeste li sigurni da želite poništiti prijavu tima "${userTeam.name}"?\n\nOva akcija se ne može poništiti.`
        );

        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await TeamService.deleteTeam(userTeam.id);
            alert(`Tim "${userTeam.name}" je uspješno uklonjen s kviza.`);

            await handleRegistrationSuccess();
            setShowRegistrationOptions(false);
        } catch (err: any) {
            alert(`Greška pri brisanju tima: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditTeam = () => {
        if (userTeam && quiz) {
            setEditTeamModal({
                isOpen: true,
                team: userTeam,
            });
        }
    };

    const handleEditTeamSuccess = async () => {
        if (quiz) {
            await fetchQuiz(quiz.id);
        }
        setEditTeamModal({ isOpen: false, team: null });
    };

    const handleRegistrationSuccess = async () => {
        if (quiz) {
            await fetchQuiz(quiz.id);
        }
    };

    const handleResultsSuccess = async () => {
        if (quiz) {
            await fetchQuiz(quiz.id);
        }
    };

    const checkUserRegistration = async (quizId: number) => {
        if (!user?.email) return;

        setCheckingRegistration(true);
        try {
            const team = await TeamService.getUserTeamForQuiz(
                quizId,
                user.email
            );
            setUserTeam(team);
        } catch (err) {
            console.error("Greška pri provjeri registracije:", err);
        } finally {
            setCheckingRegistration(false);
        }
    };

    const fetchQuiz = async (quizId: number) => {
        setLoading(true);
        setError("");

        try {
            const data = await QuizService.getQuizById(quizId);
            setQuiz(data);

            const teams = await TeamService.getTeamsByQuizId(quizId);
            setRegisteredTeams(teams);

            if (user?.roleName === "COMPETITOR") {
                await checkUserRegistration(quizId);
            }
        } catch (err: any) {
            setError(err.message || "Greška pri dohvaćanju kviza");
            setQuiz(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            const quizId = parseInt(id);
            if (!isNaN(quizId)) {
                fetchQuiz(quizId);
            } else {
                setError("Neispravan ID kviza");
                setLoading(false);
            }
        }
    }, [id]);

    const handleGoBack = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <main className="p-8">
                <div className="mb-6">
                    <Button
                        text="← Nazad"
                        onClick={handleGoBack}
                        variant="secondary"
                    />
                </div>

                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje kviza...
                    </h3>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-8">
                <div className="mb-6">
                    <Button
                        text="← Nazad"
                        onClick={handleGoBack}
                        variant="secondary"
                    />
                </div>

                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Greška pri učitavanju
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => id && fetchQuiz(parseInt(id))}
                        className="text-quiz-primary hover:underline"
                    >
                        Pokušaj ponovno
                    </button>
                </div>
            </main>
        );
    }

    if (!quiz) {
        return (
            <main className="p-8">
                <div className="mb-6">
                    <Button
                        text="← Nazad"
                        onClick={handleGoBack}
                        variant="secondary"
                    />
                </div>

                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">❓</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Kviz nije pronađen
                    </h3>
                    <p className="text-gray-500">
                        Kviz s ID #{id} ne postoji ili je uklonjen.
                    </p>
                </div>
            </main>
        );
    }

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        };
        return date.toLocaleDateString("hr-HR", options);
    };

    const handleOrganizerClick = () => {
        if (quiz?.organizerId) {
            navigate(`/organizer/${quiz.organizerId}`);
        }
    };

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    text="← Nazad"
                    onClick={handleGoBack}
                    variant="secondary"
                />
            </div>

            <div className="mb-8">
                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    {quiz.name}
                </h1>
                <p className="text-gray-600 text-lg">
                    Organizator:
                    <button
                        onClick={handleOrganizerClick}
                        className="font-medium text-quiz-primary hover:underline ml-1 bg-transparent border-none cursor-pointer"
                    >
                        {quiz.organizerName}
                    </button>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="text-quiz-primary mr-3">📅</div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Datum i vrijeme
                            </h3>
                        </div>
                        <p className="text-lg text-gray-700">
                            {formatDateTime(quiz.dateTime)}
                        </p>
                        {isQuizFinished && (
                            <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    ✅ Kviz završen
                                </span>
                            </div>
                        )}
                        {quiz.durationMinutes && (
                            <p className="text-gray-600 mt-2">
                                Trajanje: {quiz.durationMinutes} minuta
                            </p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="text-quiz-primary mr-3">📍</div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Lokacija
                            </h3>
                        </div>
                        <p className="text-lg font-medium text-gray-700 mb-1">
                            {quiz.locationName}
                        </p>
                        <p className="text-gray-600">{quiz.address}</p>
                    </div>

                    {quiz.latitude && quiz.longitude && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="text-quiz-primary mr-3">🗺️</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Lokacija na karti
                                </h3>
                            </div>
                            <MapWrapper>
                                <QuizLocationMap
                                    latitude={quiz.latitude}
                                    longitude={quiz.longitude}
                                    locationName={quiz.locationName}
                                    address={quiz.address}
                                />
                            </MapWrapper>
                        </div>
                    )}

                    {quiz.description && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="text-quiz-primary mr-3">📝</div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    Opis
                                </h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                {quiz.description}
                            </p>
                        </div>
                    )}

                    {registeredTeams.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="text-quiz-primary mr-3">👥</div>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Registrirani timovi ({registeredTeams.length})
                                    </h3>
                                </div>

                                <div className="flex gap-2">
                                    {hasResults && (
                                        <Button
                                            text="🏆 Rezultati"
                                            onClick={() => setViewResultsModal(true)}
                                            variant="secondary"
                                            className="text-sm"
                                        />
                                    )}

                                    {isQuizOwner && isQuizFinished && (
                                        <Button
                                            text="📊 Unesi rezultate"
                                            onClick={() => setSetResultsModal(true)}
                                            variant="primary"
                                            className="text-sm"
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="space-y-3">
                                {registeredTeams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {team.name}
                                                {team.finalPosition && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        #{team.finalPosition}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Kapetan: {team.captainName}
                                            </p>
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {team.participantCount} igrača
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="text-quiz-primary mr-3">🏷️</div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Kategorija
                            </h3>
                        </div>
                        <span className="inline-block bg-quiz-primary bg-opacity-10 text-quiz-primary px-3 py-1 rounded-full text-sm font-medium">
                            {quiz.categoryName}
                        </span>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center mb-4">
                            <div className="text-quiz-primary mr-3">👥</div>
                            <h3 className="text-lg font-bold text-gray-800">
                                Registracija
                            </h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-600">
                                    Registrirani timovi
                                </p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {quiz.registeredTeamsCount} /{" "}
                                    {quiz.maxTeams}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-quiz-primary h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                (quiz.registeredTeamsCount /
                                                    quiz.maxTeams) *
                                                100,
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">
                                    Veličina tima
                                </p>
                                <p className="text-lg font-medium text-gray-800">
                                    Do {quiz.maxParticipantsPerTeam} igrača
                                </p>
                            </div>

                            {quiz.entryFee && (
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Kotizacija
                                    </p>
                                    <p className="text-lg font-medium text-gray-800">
                                        {quiz.entryFee}€ po timu
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        {(() => {
                            const buttonConfig = getActionButtonConfig();

                            if (!buttonConfig) {
                                return (
                                    <p className="text-center text-gray-500">
                                        Nema dostupnih akcija
                                    </p>
                                );
                            }

                            return (
                                <div>
                                    <Button
                                        text={buttonConfig.text}
                                        onClick={buttonConfig.onClick}
                                        variant={buttonConfig.variant}
                                        disabled={buttonConfig.disabled}
                                        className="w-full"
                                    />

                                    {userTeam && showRegistrationOptions && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                            <h4 className="font-medium text-gray-800 mb-3">
                                                Upravljanje registracijom
                                            </h4>

                                            <div className="space-y-3">
                                                <div className="text-sm text-gray-600">
                                                    <p>
                                                        <strong>Tim:</strong>{" "}
                                                        {userTeam.name}
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Broj igrača:
                                                        </strong>{" "}
                                                        {
                                                            userTeam.participantCount
                                                        }
                                                    </p>
                                                    <p>
                                                        <strong>
                                                            Kapetan:
                                                        </strong>{" "}
                                                        {userTeam.captainName}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        text={
                                                            isDeleting
                                                                ? "Brišem..."
                                                                : "🗑️ Poništi prijavu"
                                                        }
                                                        onClick={
                                                            handleDeleteTeam
                                                        }
                                                        variant="secondary"
                                                        disabled={isDeleting}
                                                        className="flex-1 text-sm"
                                                    />
                                                    <Button
                                                        text="📝 Uredi tim"
                                                        onClick={handleEditTeam}
                                                        variant="white"
                                                        className="flex-1 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {quiz && (
                <TeamRegistrationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    quizId={quiz.id}
                    quizName={quiz.name}
                    maxParticipantsPerTeam={quiz.maxParticipantsPerTeam}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
            {quiz && (
                <EditTeamModal
                    isOpen={editTeamModal.isOpen}
                    onClose={() =>
                        setEditTeamModal({ isOpen: false, team: null })
                    }
                    team={editTeamModal.team}
                    maxParticipantsPerTeam={quiz.maxParticipantsPerTeam}
                    onSuccess={handleEditTeamSuccess}
                />
            )}

            <SetResultsModal
                isOpen={setResultsModal}
                onClose={() => setSetResultsModal(false)}
                onSuccess={handleResultsSuccess}
                teams={registeredTeams}
                quizName={quiz.name}
            />

            <ViewResultsModal
                isOpen={viewResultsModal}
                onClose={() => setViewResultsModal(false)}
                teams={registeredTeams}
                quizName={quiz.name}
            />
        </main>
    );
}

export default QuizDetailsPage;
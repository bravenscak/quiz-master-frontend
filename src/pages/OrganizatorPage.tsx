import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import QuizCard from "../components/QuizCard";
import { UserService } from "../services/userService";
import { UserResponse } from "../types/auth";
import { QuizCardData } from "../types/quiz";
import { SubscriptionService } from "../services/subscriptionService";
import { useAuth } from "../contexts/AuthContext";

function OrganizatorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [organizer, setOrganizer] = useState<UserResponse | null>(null);
    const [upcomingQuizzes, setUpcomingQuizzes] = useState<QuizCardData[]>([]);
    const [pastQuizzes, setPastQuizzes] = useState<QuizCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, isAuthenticated } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);

    const isOwnProfile = user?.id.toString() === id;

    const fetchOrganizerData = async (organizerId: number) => {
        setLoading(true);
        setError("");

        try {
            const [organizerData, quizzes] = await Promise.all([
                UserService.getUserById(organizerId),
                UserService.getOrganizerQuizzes(organizerId),
            ]);

            setOrganizer(organizerData);

            const now = new Date();
            const upcoming = quizzes.filter(
                (quiz) => new Date(quiz.dateTime) > now
            );
            const past = quizzes.filter(
                (quiz) => new Date(quiz.dateTime) <= now
            );

            setUpcomingQuizzes(upcoming);
            setPastQuizzes(past);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            const organizerId = parseInt(id);
            if (!isNaN(organizerId)) {
                fetchOrganizerData(organizerId);
            } else {
                setError("Neispravan ID organizatora");
                setLoading(false);
            }
        }
    }, [id]);

    const checkSubscriptionStatus = async (organizerId: number) => {
        if (!isAuthenticated || !user) return;

        try {
            const subscribed = await SubscriptionService.getSubscriptionStatus(organizerId);
            setIsSubscribed(subscribed);
        } catch (err) {
            console.error("Greška pri provjeri subscription:", err);
        }
    };

    useEffect(() => {
        if (organizer && isAuthenticated && user?.id !== organizer.id) {
            checkSubscriptionStatus(organizer.id);
        }
    }, [organizer, isAuthenticated, user]);

    const handleSubscriptionToggle = async () => {
        if (!organizer || !user) return;

        setSubscriptionLoading(true);
        try {
            const newStatus = await SubscriptionService.toggleSubscription(organizer.id);
            setIsSubscribed(newStatus);

            const message = newStatus
                ? `Sada pratiš ${
                      organizer.organizationName || organizer.username
                  }!`
                : `Prestao si pratiti ${
                      organizer.organizationName || organizer.username
                  }`;
            alert(message);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    const handleQuizClick = (quizId: number) => {
        navigate(`/quiz/${quizId}`);
    };

    if (loading) {
        return (
            <main className="p-8">
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje...
                    </h3>
                </div>
            </main>
        );
    }

    if (error || !organizer) {
        return (
            <main className="p-8">
                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Greška
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button
                        text="← Nazad"
                        onClick={() => navigate("/")}
                        variant="secondary"
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <Button
                    text="← Nazad"
                    onClick={() => navigate("/")}
                    variant="secondary"
                />
                
                {isOwnProfile && (
                    <Button
                        text="+ Stvori novi kviz"
                        onClick={() => navigate("/create-quiz")}
                        variant="primary"
                        className="px-6 py-3"
                    />
                )}
            </div>
            
            <div className="mb-8 text-center">
                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    {organizer.organizationName || `@${organizer.username}`}
                </h1>
                <p className="text-gray-600 text-lg">
                    {organizer.firstName} {organizer.lastName}
                </p>
                {organizer.description && (
                    <p className="text-gray-500 max-w-2xl mx-auto mt-2">
                        {organizer.description}
                    </p>
                )}
            </div>

            {isAuthenticated && organizer && user?.id !== organizer.id && (
                <div className="text-center mb-8">
                    <Button
                        text={
                            subscriptionLoading
                                ? "⏳ Učitavam..."
                                : isSubscribed
                                ? "🔔 Prestani pratiti"
                                : "🔔 Prati organizatora"
                        }
                        onClick={handleSubscriptionToggle}
                        variant={isSubscribed ? "secondary" : "primary"}
                        disabled={subscriptionLoading}
                        className="px-8 py-3"
                    />

                    {isSubscribed && (
                        <p className="text-sm text-gray-500 mt-2">
                            Dobit ćeš obavijest o novim kvizovima
                        </p>
                    )}
                </div>
            )}
            
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Nadolazeći kvizovi ({upcomingQuizzes.length})
                    </h2>
                    
                    {isOwnProfile && upcomingQuizzes.length === 0 && (
                        <p className="text-gray-500 text-sm">
                            Nemate nadolazećih kvizova
                        </p>
                    )}
                </div>
                
                {upcomingQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingQuizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onClick={handleQuizClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-5xl mb-4">📅</div>
                        <p className="text-gray-500">
                            {isOwnProfile 
                                ? "Nemate nadolazećih kvizova. Stvorite novi kviz!" 
                                : "Nema nadolazećih kvizova"
                            }
                        </p>
                        {isOwnProfile && (
                            <Button
                                text="+ Stvori prvi kviz"
                                onClick={() => navigate("/create-quiz")}
                                variant="primary"
                                className="mt-4 px-6 py-3"
                            />
                        )}
                    </div>
                )}
            </section>
            
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Prošli kvizovi ({pastQuizzes.length})
                </h2>
                {pastQuizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastQuizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onClick={handleQuizClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-5xl mb-4">🏆</div>
                        <p className="text-gray-500">
                            Nema prošlih kvizova
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default OrganizatorPage;
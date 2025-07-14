import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AdminService } from "../services/adminService";
import { CategoryService, Category } from "../services/categoryService";
import Button from "../components/Button";
import QuizCard from "../components/QuizCard";

interface AdminQuizData {
    id: number;
    name: string;
    organizerName: string;
    organizerId: number;
    categoryName: string;
    categoryId: number;
    locationName: string;
    address: string;
    dateTime: string;
    registeredTeamsCount: number;
    maxTeams: number;
    entryFee?: number;
    isCompleted: boolean;
}

function AllQuizzesPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [quizzes, setQuizzes] = useState<AdminQuizData[]>([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState<AdminQuizData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);  
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedOrganizer, setSelectedOrganizer] = useState<string>('');
    
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [organizers, setOrganizers] = useState<{id: number, name: string}[]>([]);

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.roleName !== 'ADMIN')) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate, loading]);

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            const [quizzesData, categoriesData] = await Promise.all([
                AdminService.getAllQuizzes(),
                CategoryService.getCategories()
            ]);

            const transformedQuizzes: AdminQuizData[] = quizzesData.map((quiz: any) => ({
                id: quiz.id,
                name: quiz.name,
                organizerName: quiz.organizerName || quiz.organizerUsername || 'N/A',
                organizerId: quiz.organizerId,
                categoryName: quiz.categoryName || 'N/A',
                categoryId: quiz.categoryId,
                locationName: quiz.locationName,
                address: quiz.address,
                dateTime: quiz.dateTime,
                registeredTeamsCount: quiz.registeredTeamsCount || 0,
                maxTeams: quiz.maxTeams,
                entryFee: quiz.entryFee,
                isCompleted: new Date(quiz.dateTime) <= new Date()
            }));

            setQuizzes(transformedQuizzes);
            setFilteredQuizzes(transformedQuizzes);
            setCategories(categoriesData);

            const uniqueOrganizers = Array.from(
                new Map(transformedQuizzes.map(q => [q.organizerId, { id: q.organizerId, name: q.organizerName }])).values()
            ).sort((a, b) => a.name.localeCompare(b.name));
            setOrganizers(uniqueOrganizers);

        } catch (err: any) {
            setError(err.message || 'Greška pri dohvaćanju kvizova');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.roleName === 'ADMIN') {
            fetchData();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        let filtered = quizzes;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(q => 
                q.name.toLowerCase().includes(term) ||
                q.organizerName.toLowerCase().includes(term) ||
                q.locationName.toLowerCase().includes(term) ||
                q.categoryName.toLowerCase().includes(term)
            );
        }

        if (selectedCategoryId) {
            filtered = filtered.filter(q => q.categoryId === selectedCategoryId);
        }

        if (selectedStatus) {
            if (selectedStatus === "upcoming") {
                filtered = filtered.filter((q) => !q.isCompleted);
            } else if (selectedStatus === "completed") {
                filtered = filtered.filter((q) => q.isCompleted);
            } else if (selectedStatus === "full") {
                filtered = filtered.filter(
                    (q) => q.registeredTeamsCount >= q.maxTeams
                );
            } else if (selectedStatus === "available") {
                filtered = filtered.filter(
                    (q) => q.registeredTeamsCount < q.maxTeams && !q.isCompleted
                );
            }
        }

        if (selectedOrganizer) {
            filtered = filtered.filter(
                (q) => q.organizerId.toString() === selectedOrganizer
            );
        }

        setFilteredQuizzes(filtered);
    }, [
        quizzes,
        searchTerm,
        selectedCategoryId,
        selectedStatus,
        selectedOrganizer,
    ]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategoryId(null);
        setSelectedStatus("");
        setSelectedOrganizer("");
    };

    const handleQuizClick = (quizId: number) => {
        navigate(`/quiz/${quizId}`);
    };

    const handleEditQuiz = (quizId: number) => {
        navigate(`/edit-quiz/${quizId}`);
    };

    const getStats = () => {
        const total = quizzes.length;
        const upcoming = quizzes.filter((q) => !q.isCompleted).length;
        const completed = quizzes.filter((q) => q.isCompleted).length;
        const full = quizzes.filter(
            (q) => q.registeredTeamsCount >= q.maxTeams
        ).length;

        return { total, upcoming, completed, full };
    };

    if (loading) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje kvizova...
                    </h3>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="mb-6">
                    <Button
                        text="← Nazad na Admin Panel"
                        onClick={() => navigate("/admin")}
                        variant="secondary"
                    />
                </div>

                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Greška
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button
                        text="Pokušaj ponovno"
                        onClick={fetchData}
                        variant="primary"
                    />
                </div>
            </main>
        );
    }

    const stats = getStats();

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        text="← Nazad na Admin Panel"
                        onClick={() => navigate("/admin")}
                        variant="secondary"
                    />
                </div>

                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    🏆 Svi kvizovi
                </h1>
                <p className="text-gray-600">
                    Admin pregled i upravljanje svim kvizovima u sustavu
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">🏆</div>
                        <div>
                            <p className="text-sm text-gray-600">Ukupno</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {stats.total}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">⏰</div>
                        <div>
                            <p className="text-sm text-gray-600">Nadolazeći</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.upcoming}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">✅</div>
                        <div>
                            <p className="text-sm text-gray-600">Završeni</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.completed}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">🔥</div>
                        <div>
                            <p className="text-sm text-gray-600">Popunjeni</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.full}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pretraži
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Naziv, organizator, lokacija..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategorija
                        </label>
                        <select
                            value={selectedCategoryId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCategoryId(value ? parseInt(value) : null);
                            }}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        >
                            <option value="">Sve kategorije</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        >
                            <option value="">Svi statusi</option>
                            <option value="upcoming">Nadolazeći</option>
                            <option value="completed">Završeni</option>
                            <option value="available">Dostupna mjesta</option>
                            <option value="full">Popunjeni</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Organizator
                        </label>
                        <select
                            value={selectedOrganizer}
                            onChange={(e) => setSelectedOrganizer(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        >
                            <option value="">Svi organizatori</option>
                            {organizers.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Prikazano {filteredQuizzes.length} od {quizzes.length} kvizova
                        {searchTerm && <span> • Pretraga: "{searchTerm}"</span>}
                        {selectedCategoryId && <span> • Kategorija: {categories.find(c => c.id === selectedCategoryId)?.name}</span>}
                        {selectedStatus && <span> • Status: {selectedStatus}</span>}
                        {selectedOrganizer && <span> • Organizator: {organizers.find(o => o.id.toString() === selectedOrganizer)?.name}</span>}
                    </div>
                    
                    {(searchTerm || selectedCategoryId || selectedStatus || selectedOrganizer) && (
                        <Button
                            text="Očisti filtere"
                            onClick={clearFilters}
                            variant="secondary"
                            className="px-4 py-2"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Nema rezultata
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Nema kvizova koji odgovaraju vašim filterima.
                        </p>
                        <Button
                            text="Očisti filtere"
                            onClick={clearFilters}
                            variant="secondary"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredQuizzes.map((quiz) => (
                            <div key={quiz.id} className="relative">
                                <QuizCard
                                    quiz={{
                                        id: quiz.id,
                                        name: quiz.name,
                                        organizerName: quiz.organizerName,
                                        organizerId: quiz.organizerId,
                                        categoryName: quiz.categoryName,
                                        categoryId: quiz.categoryId,
                                        locationName: quiz.locationName,
                                        address: quiz.address,
                                        dateTime: quiz.dateTime,
                                        registeredTeamsCount:
                                        quiz.registeredTeamsCount,
                                        maxTeams: quiz.maxTeams,
                                        entryFee: quiz.entryFee,
                                    }}
                                    onClick={() => handleQuizClick(quiz.id)}
                                    hideBadge={true}
                                />

                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button
                                        text="👁️"
                                        onClick={() => handleQuizClick(quiz.id)}
                                        variant="white"
                                        className="p-2 text-sm shadow-lg"
                                    />
                                    <Button
                                        text="✏️"
                                        onClick={() => handleEditQuiz(quiz.id)}
                                        variant="secondary"
                                        className="p-2 text-sm shadow-lg"
                                    />
                                </div>

                                <div className="absolute bottom-2 right-2">
                                    {quiz.isCompleted ? (
                                        <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-green-200 rounded-full"></span>
                                            Završen
                                        </span>
                                    ) : quiz.registeredTeamsCount >= quiz.maxTeams ? (
                                        <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-red-200 rounded-full"></span>
                                            Popunjen
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm">
                                            <span className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse"></span>
                                            Dostupan
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

export default AllQuizzesPage;

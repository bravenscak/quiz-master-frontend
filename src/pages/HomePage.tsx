import React, { useState, useEffect } from "react";
import QuizCard from "../components/QuizCard";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import { QuizCardData, QuizSearchParams } from "../types/quiz";
import { QuizService } from "../services/quizService";
import { CategoryService, Category } from "../services/categoryService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/Button";

interface Organizer {
    id: number;
    name: string;
}

function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedOrganizerId, setSelectedOrganizerId] = useState<number | null>(null);
    const [dateFrom, setDateFrom] = useState<string>("");
    const [dateTo, setDateTo] = useState<string>("");

    const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
    const [allQuizzes, setAllQuizzes] = useState<QuizCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");

    const [organizers, setOrganizers] = useState<Organizer[]>([]);

    const handleQuizClick = (quizId: number) => {
        navigate(`/quiz/${quizId}`);
    };

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError("");

        try {
            const data = await CategoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            setCategoriesError(
                err.message || "Greška pri dohvaćanju kategorija"
            );
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchQuizzes = async () => {
        setLoading(true);
        setError("");

        try {
            const params: QuizSearchParams = {
                sortBy: "DateTime",
                sortDirection: "Ascending",
            };

            const data = await QuizService.getQuizzes(params);
            setAllQuizzes(data);

            const uniqueOrganizers = Array.from(
                new Map(data.map(q => [q.organizerId, { id: q.organizerId, name: q.organizerName }])).values()
            ).sort((a, b) => a.name.localeCompare(b.name));
            setOrganizers(uniqueOrganizers);

        } catch (err: any) {
            setError(err.message || "Greška pri dohvaćanju kvizova");
            setAllQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = [...allQuizzes];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(q => 
                q.name.toLowerCase().includes(term) ||
                q.organizerName.toLowerCase().includes(term) ||
                q.locationName.toLowerCase().includes(term)
            );
        }

        if (selectedCategoryId) {
            filtered = filtered.filter(q => q.categoryId === selectedCategoryId);
        }

        if (selectedOrganizerId) {
            filtered = filtered.filter(q => q.organizerId === selectedOrganizerId);
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(q => new Date(q.dateTime) >= fromDate);
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(q => new Date(q.dateTime) <= toDate);
        }

        setQuizzes(filtered);
    }, [allQuizzes, searchTerm, selectedCategoryId, selectedOrganizerId, dateFrom, dateTo]);

    useEffect(() => {
        fetchCategories();
        fetchQuizzes();
    }, []);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategoryId(null);
        setSelectedOrganizerId(null);
        setDateFrom("");
        setDateTo("");
    };

    const hasActiveFilters = searchTerm || selectedCategoryId || selectedOrganizerId || dateFrom || dateTo;
    const today = new Date().toISOString().split('T')[0];

    return (
        <main className="p-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-quiz-primary text-3xl font-bold mb-2">
                            Dostupni kvizovi
                        </h2>
                        <p className="text-gray-600">
                            Pronađi kviz koji te zanima
                        </p>
                    </div>

                    {user?.roleName === "ORGANIZER" && (
                        <Button
                            text="+ Stvori novi kviz"
                            onClick={() => navigate("/create-quiz")}
                            variant="primary"
                            className="px-6 py-3 whitespace-nowrap ml-6"
                        />
                    )}
                </div>
            </div>

            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex flex-wrap gap-4 items-end mb-4">
                    <div className="flex-1 min-w-[200px]">
                        <SearchBar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            placeholder="Pretraži po nazivu, organizatoru..."
                        />
                    </div>

                    <div className="min-w-[150px]">
                        <CategoryFilter
                            selectedCategoryId={selectedCategoryId}
                            onCategoryChange={setSelectedCategoryId}
                            categories={categories}
                            loading={categoriesLoading}
                        />
                    </div>

                    <div className="relative min-w-[150px]">
                        <select
                            value={selectedOrganizerId || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedOrganizerId(value ? parseInt(value) : null);
                            }}
                            className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-8 text-base transition-colors duration-200 focus:border-quiz-primary focus:outline-none cursor-pointer w-full"
                        >
                            <option value="">Svi organizatori</option>
                            {organizers.map(organizer => (
                                <option key={organizer.id} value={organizer.id}>
                                    {organizer.name}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    <div className="min-w-[120px]">
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            min={today}
                            placeholder="Od datuma"
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none text-sm"
                        />
                    </div>

                    <div className="min-w-[120px]">
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            min={dateFrom || today}
                            placeholder="Do datuma"
                            className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none text-sm"
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-quiz-primary text-sm underline hover:no-underline transition-all duration-200 whitespace-nowrap"
                        >
                            Očisti filtere
                        </button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    {loading ? (
                        "Učitavanje kvizova..."
                    ) : error ? (
                        <span className="text-red-600">Greška: {error}</span>
                    ) : (
                        <>
                            Prikazano {quizzes.length} od {allQuizzes.length} kvizova
                            {searchTerm && <span> • Pretraga: "{searchTerm}"</span>}
                            {selectedCategoryId && <span> • Kategorija: {categories.find(c => c.id === selectedCategoryId)?.name}</span>}
                            {selectedOrganizerId && <span> • Organizator: {organizers.find(o => o.id === selectedOrganizerId)?.name}</span>}
                            {(dateFrom || dateTo) && (
                                <span> • Datum: {dateFrom || '...'} - {dateTo || '...'}</span>
                            )}
                        </>
                    )}

                    {categoriesError && (
                        <div className="mt-2">
                            <span className="text-orange-600">
                                Upozorenje: {categoriesError}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {loading && (
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje kvizova...
                    </h3>
                </div>
            )}

            {error && !loading && (
                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Greška pri učitavanju
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchQuizzes}
                        className="text-quiz-primary hover:underline"
                    >
                        Pokušaj ponovno
                    </button>
                </div>
            )}

            {!loading &&
                !error &&
                (quizzes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <QuizCard
                                key={quiz.id}
                                quiz={quiz}
                                onClick={handleQuizClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {hasActiveFilters ? "Nema rezultata" : "Nema kvizova"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {hasActiveFilters 
                                ? "Nema kvizova koji odgovaraju vašim filterima."
                                : "Trenutno nema objavljenih kvizova."
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-quiz-primary hover:underline"
                            >
                                Obriši sve filtere
                            </button>
                        )}
                    </div>
                ))}
        </main>
    );
}

export default HomePage;
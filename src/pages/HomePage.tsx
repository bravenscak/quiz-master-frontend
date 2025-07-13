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

function HomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    );

    const [quizzes, setQuizzes] = useState<QuizCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");

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
                searchTerm: searchTerm || undefined,
                sortBy: "DateTime",
                sortDirection: "Ascending",
            };

            if (selectedCategoryId) {
                params.categoryId = selectedCategoryId;
            }

            const data = await QuizService.getQuizzes(params);
            setQuizzes(data);
        } catch (err: any) {
            setError(err.message || "Greška pri dohvaćanju kvizova");
            setQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchQuizzes();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategoryId]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategoryId(null);
    };

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
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <SearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Pretraži po nazivu, organizatoru ili lokaciji..."
                    />

                    <CategoryFilter
                        selectedCategoryId={selectedCategoryId}
                        onCategoryChange={setSelectedCategoryId}
                        categories={categories}
                        loading={categoriesLoading}
                    />

                    {(searchTerm || selectedCategoryId) && (
                        <button
                            onClick={clearFilters}
                            className="
                text-quiz-primary 
                text-sm 
                underline 
                hover:no-underline
                transition-all
                duration-200
                whitespace-nowrap
              "
                        >
                            Očisti filtere
                        </button>
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    {loading ? (
                        "Učitavanje kvizova..."
                    ) : error ? (
                        <span className="text-red-600">Greška: {error}</span>
                    ) : (
                        `Prikazuje se ${quizzes.length} kvizova`
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
                            Nema rezultata
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Pokušaj s drugačijim pretraživanjem ili promijeni
                            filtere.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="text-quiz-primary hover:underline"
                        >
                            Obriši sve filtere
                        </button>
                    </div>
                ))}
        </main>
    );
}

export default HomePage;

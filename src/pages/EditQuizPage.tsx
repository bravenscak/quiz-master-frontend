import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import { CategoryService, Category } from "../services/categoryService";
import { QuizService } from "../services/quizService";
import { useAuth } from "../contexts/AuthContext";
import { UpdateQuizRequest } from "../types/quiz";

interface EditQuizFormData {
    name: string;
    locationName: string;
    address: string;
    entryFee?: number;
    dateTime: string;
    maxParticipantsPerTeam: number;
    maxTeams: number;
    durationMinutes?: number;
    description?: string;
    categoryId: number;
}

function EditQuizPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<EditQuizFormData>();

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");

    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<any>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (
            user &&
            user.roleName !== "ORGANIZER" &&
            user.roleName !== "ADMIN"
        ) {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    const fetchQuiz = async (quizId: number) => {
        setLoading(true);
        try {
            const quizData = await QuizService.getQuizById(quizId);
            setQuiz(quizData);

            const quizDate = new Date(quizData.dateTime);
            const formattedDateTime = quizDate.toISOString().slice(0, 16);

            setValue("name", quizData.name);
            setValue("locationName", quizData.locationName);
            setValue("address", quizData.address);
            setValue("entryFee", quizData.entryFee || undefined);
            setValue("dateTime", formattedDateTime);
            setValue("maxParticipantsPerTeam", quizData.maxParticipantsPerTeam);
            setValue("maxTeams", quizData.maxTeams);
            setValue("durationMinutes", quizData.durationMinutes || undefined);
            setValue("description", quizData.description || "");
        } catch (err: any) {
            setSubmitError(err.message || "Greška pri dohvaćanju kviza");
            navigate("/");
        } finally {
            setLoading(false);
        }
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
        } finally {
            setCategoriesLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();

        if (id) {
            const quizId = parseInt(id);
            if (!isNaN(quizId)) {
                fetchQuiz(quizId);
            } else {
                navigate("/");
            }
        }
    }, [id]);

    useEffect(() => {
        if (quiz && categories.length > 0) {
            const category = categories.find(
                (cat) => cat.name === quiz.categoryName
            );
            if (category) {
                setValue("categoryId", category.id);
            }
        }
    }, [quiz, categories, setValue]);

    const onSubmit = async (data: EditQuizFormData) => {
        setSubmitError("");

        if (!quiz) return;

        try {
            const updateRequest: UpdateQuizRequest = {
                name: data.name,
                locationName: data.locationName,
                address: data.address,
                entryFee: data.entryFee || undefined,
                dateTime: formatDateTimeForBackend(data.dateTime),
                maxParticipantsPerTeam: data.maxParticipantsPerTeam,
                maxTeams: data.maxTeams,
                durationMinutes: data.durationMinutes || undefined,
                description: data.description || undefined,
                categoryId: data.categoryId,
            };

            const updatedQuiz = await QuizService.updateQuiz(
                quiz.id,
                updateRequest
            );

            alert(`Kviz "${updatedQuiz.name}" je uspješno ažuriran!`);
            navigate(`/quiz/${quiz.id}`);
        } catch (err: any) {
            setSubmitError(err.message || "Greška pri ažuriranju kviza");
        }
    };

    const formatDateTimeForBackend = (dateTimeLocal: string): string => {
        const date = new Date(dateTimeLocal);
        return date.toISOString();
    };

    const handleDeleteQuiz = async () => {
        if (!quiz) return;

        const confirmed = window.confirm(
            `Jeste li sigurni da želite obrisati kviz "${quiz.name}"?\n\nOva akcija će također obrisati sve registrirane timove i ne može se poništiti.`
        );

        if (!confirmed) return;

        setIsDeleting(true);
        try {
            await QuizService.deleteQuiz(quiz.id);
            alert("Kviz je uspješno obrisan!");
            navigate("/");
        } catch (err: any) {
            alert(`Greška pri brisanju kviza: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <main className="p-8 max-w-4xl mx-auto">
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

    if (!quiz) {
        return (
            <main className="p-8 max-w-4xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Kviz nije pronađen
                    </h3>
                    <Button
                        text="← Nazad"
                        onClick={() => navigate(-1)}
                        variant="secondary"
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        text="← Nazad"
                        onClick={() => navigate(-1)}
                        variant="secondary"
                        className="px-4 py-2"
                    />
                    <div>
                        <h1 className="text-quiz-primary text-3xl font-bold">
                            Uredi kviz
                        </h1>
                        <p className="text-gray-600">
                            Ažuriraj podatke za "{quiz.name}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {submitError && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-md">
                            {submitError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Osnovni podaci
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Naziv kviza *
                            </label>
                            <input
                                type="text"
                                {...register("name", {
                                    required: "Naziv kviza je obavezan",
                                    maxLength: {
                                        value: 200,
                                        message:
                                            "Naziv ne smije biti duži od 200 znakova",
                                    },
                                })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                placeholder="npr. Zabavni pub kviz - Zagreb"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Kategorija *
                            </label>
                            <select
                                {...register("categoryId", {
                                    required: "Kategorija je obavezna",
                                    valueAsNumber: true,
                                })}
                                disabled={categoriesLoading}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                            >
                                <option value="">
                                    {categoriesLoading
                                        ? "Učitavanje..."
                                        : "Odaberite kategoriju"}
                                </option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.categoryId.message}
                                </p>
                            )}
                            {categoriesError && (
                                <p className="text-orange-500 text-sm mt-1">
                                    {categoriesError}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Lokacija
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Naziv lokacije *
                                </label>
                                <input
                                    type="text"
                                    {...register("locationName", {
                                        required: "Naziv lokacije je obavezan",
                                        maxLength: {
                                            value: 100,
                                            message:
                                                "Naziv lokacije ne smije biti duži od 100 znakova",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    placeholder="npr. Caffe Bar Central"
                                />
                                {errors.locationName && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.locationName.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresa *
                                </label>
                                <input
                                    type="text"
                                    {...register("address", {
                                        required: "Adresa je obavezna",
                                        maxLength: {
                                            value: 200,
                                            message:
                                                "Adresa ne smije biti duža od 200 znakova",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    placeholder="npr. Ilica 1, Zagreb"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Datum i vrijeme
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Datum i vrijeme kviza *
                            </label>
                            <input
                                type="datetime-local"
                                {...register("dateTime", {
                                    required: "Datum i vrijeme su obavezni",
                                    validate: (value) => {
                                        const selectedDate = new Date(value);
                                        const now = new Date();
                                        if (selectedDate <= now) {
                                            return "Datum i vrijeme moraju biti u budućnosti";
                                        }
                                        return true;
                                    },
                                })}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                            />
                            {errors.dateTime && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.dateTime.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Pravila kviza
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max sudionika po timu *
                                </label>
                                <input
                                    type="number"
                                    {...register("maxParticipantsPerTeam", {
                                        required: "Broj sudionika je obavezan",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Minimum je 1 sudionik",
                                        },
                                        max: {
                                            value: 20,
                                            message: "Maksimum je 20 sudionika",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    min="1"
                                    max="20"
                                />
                                {errors.maxParticipantsPerTeam && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.maxParticipantsPerTeam.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max broj timova *
                                </label>
                                <input
                                    type="number"
                                    {...register("maxTeams", {
                                        required: "Broj timova je obavezan",
                                        valueAsNumber: true,
                                        min: {
                                            value: 1,
                                            message: "Minimum je 1 tim",
                                        },
                                        max: {
                                            value: 100,
                                            message: "Maksimum je 100 timova",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    min="1"
                                    max="100"
                                />
                                {errors.maxTeams && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.maxTeams.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trajanje (minute)
                                </label>
                                <input
                                    type="number"
                                    {...register("durationMinutes", {
                                        valueAsNumber: true,
                                        min: {
                                            value: 30,
                                            message: "Minimum je 30 minuta",
                                        },
                                        max: {
                                            value: 480,
                                            message:
                                                "Maksimum je 480 minuta (8 sati)",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    min="30"
                                    max="480"
                                    placeholder="120"
                                />
                                {errors.durationMinutes && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.durationMinutes.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Dodatne informacije
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kotizacija (€)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register("entryFee", {
                                        valueAsNumber: true,
                                        min: {
                                            value: 0,
                                            message:
                                                "Kotizacija ne može biti negativna",
                                        },
                                        max: {
                                            value: 10000,
                                            message:
                                                "Maksimalna kotizacija je 10.000€",
                                        },
                                    })}
                                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    min="0"
                                    max="10000"
                                    placeholder="0.00"
                                />
                                {errors.entryFee && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.entryFee.message}
                                    </p>
                                )}
                            </div>

                            <div className="md:col-span-1">
                                <div className="h-full flex flex-col">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Opis kviza
                                    </label>
                                    <textarea
                                        {...register("description", {
                                            maxLength: {
                                                value: 1000,
                                                message:
                                                    "Opis ne smije biti duži od 1000 znakova",
                                            },
                                        })}
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none flex-grow min-h-[120px] resize-none"
                                        placeholder="Opišite svoj kviz - tema, nagrada, posebnosti..."
                                        rows={5}
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.description.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mt-8">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-700 text-sm mb-4">
                                Brisanje kviza je nepovratna akcija. Bit će
                                obrisani svi registrirani timovi.
                            </p>
                            <Button
                                text={
                                    isDeleting
                                        ? "🗑️ Brišem..."
                                        : "🗑️ Obriši kviz"
                                }
                                onClick={handleDeleteQuiz}
                                variant="danger"
                                disabled={isDeleting || isSubmitting}
                                className="px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t">
                        <Button
                            text="Odustani"
                            onClick={() => navigate(-1)}
                            variant="secondary"
                            disabled={isSubmitting}
                            className="flex-1"
                        />
                        <Button
                            text={
                                isSubmitting
                                    ? "Ažuriram kviz..."
                                    : "Ažuriraj kviz"
                            }
                            onClick={() => {}}
                            variant="primary"
                            disabled={isSubmitting}
                            className="flex-1"
                        />
                    </div>
                </form>
            </div>
        </main>
    );
}

export default EditQuizPage;
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Button from "../components/Button";
import { CategoryService, Category } from "../services/categoryService";
import { QuizService } from "../services/quizService";
import { useAuth } from "../contexts/AuthContext";
import { CreateQuizRequest } from "../types/quiz";
import MapWrapper from "../components/maps/MapWrapper";
import LocationPicker from "../components/maps/LocationPicker";
import NewPlacesLocationPicker from "../components/maps/LocationPicker";

interface CreateQuizFormData {
    name: string;
    locationName: string;
    address: string;
    entryFee?: number;
    dateTime: Date;
    maxParticipantsPerTeam: number;
    maxTeams: number;
    durationMinutes?: number;
    description?: string;
    categoryId: number;
}

function CreateQuizPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const getDefaultDateTime = (): Date => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        date.setHours(19, 0, 0, 0);
        return date;
    };

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setValue,
        watch,
    } = useForm<CreateQuizFormData>({
        defaultValues: {
            maxParticipantsPerTeam: 4,
            maxTeams: 10,
            durationMinutes: 120,
            dateTime: getDefaultDateTime(),
        },
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState("");

    const [selectedLocation, setSelectedLocation] = useState<{
        latitude?: number;
        longitude?: number;
        address?: string;
    }>({});

    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        if (user && user.roleName !== "ORGANIZER") {
            navigate("/");
            return;
        }
    }, [user, navigate]);

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
    }, []);

    const onSubmit = async (data: CreateQuizFormData) => {
        setSubmitError("");

        try {
            const quizData: CreateQuizRequest = {
                name: data.name,
                locationName: data.locationName,
                address: data.address,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                entryFee: data.entryFee,
                dateTime: data.dateTime.toISOString(),
                maxParticipantsPerTeam: data.maxParticipantsPerTeam,
                maxTeams: data.maxTeams,
                durationMinutes: data.durationMinutes,
                description: data.description,
                categoryId: data.categoryId,
            };

            const createdQuiz = await QuizService.createQuiz(quizData);
            navigate(`/quiz/${createdQuiz.id}`);
        } catch (err: any) {
            setSubmitError(err.message);
        }
    };

    if (user && user.roleName !== "ORGANIZER") {
        return null;
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
                            Stvori novi kviz
                        </h1>
                        <p className="text-gray-600">
                            Unesite podatke za vaš pub kviz
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
                                    value={selectedLocation.address || ""}
                                    onChange={(e) =>
                                        setValue("address", e.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <MapWrapper>
                            <LocationPicker
                                onLocationSelect={(location) => {
                                    setSelectedLocation(location);
                                    setValue("address", location.address);
                                }}
                                initialAddress={watch("address")}
                                initialLatitude={selectedLocation.latitude}
                                initialLongitude={selectedLocation.longitude}
                            />
                        </MapWrapper>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                            Datum i vrijeme
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Datum i vrijeme kviza *
                            </label>
                            <Controller
                                name="dateTime"
                                control={control}
                                rules={{
                                    required: "Datum i vrijeme su obavezni",
                                    validate: (value: Date) => {
                                        const now = new Date();
                                        if (value <= now) {
                                            return "Datum i vrijeme moraju biti u budućnosti";
                                        }
                                        return true;
                                    },
                                }}
                                render={({ field }) => (
                                    <DatePicker
                                        selected={field.value}
                                        onChange={field.onChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={30}
                                        dateFormat="dd.MM.yyyy HH:mm"
                                        minDate={new Date()}
                                        timeCaption="Vrijeme"
                                        placeholderText="Odaberite datum i vrijeme"
                                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                                    />
                                )}
                            />
                            {errors.dateTime && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.dateTime.message}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                                Odaberite kada će se kviz održati
                            </p>
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
                                <p className="text-sm text-gray-500 mt-1">
                                    Opcionalno - koliko dugo traje kviz
                                </p>
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
                                <p className="text-sm text-gray-500 mt-1">
                                    Opcionalno - ostavite prazno za besplatno
                                </p>
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
                                    <p className="text-sm text-gray-500 mt-1">
                                        Opcionalno - do 1000 znakova
                                    </p>
                                </div>
                            </div>
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
                                isSubmitting ? "Stvaram kviz..." : "Stvori kviz"
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

export default CreateQuizPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { AuthService } from "../services/authService";
import { LoginRequest } from "../types/auth";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<LoginRequest>({
        usernameOrEmail: "",
        password: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await login(formData.usernameOrEmail, formData.password); 
            navigate("/");
        } catch (err: any) {
            setError(err.message || "Greška pri prijavi");
        } finally {
            setIsLoading(false);
        }
    };

    const { login } = useAuth();

    return (
        <main className="p-8 flex justify-center items-center min-h-[calc(100vh-120px)]">
            <div className="bg-white p-12 rounded-xl shadow-xl w-full max-w-md">
                <h1 className="text-quiz-primary text-center mb-8 text-3xl font-bold">
                    Prijava
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-quiz-primary-dark font-bold">
                            Username ili Email
                        </label>
                        <input
                            type="text"
                            name="usernameOrEmail"
                            value={formData.usernameOrEmail}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="
                w-full p-3 border-2 border-gray-200 rounded-md text-base 
                transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-quiz-primary-dark font-bold">
                            Lozinka
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                            className="
                w-full p-3 border-2 border-gray-200 rounded-md text-base 
                transition-colors duration-200 focus:border-quiz-primary focus:outline-none
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            text={
                                isLoading ? "Prijavljivanje..." : "Prijavi se"
                            }
                            onClick={() => {}}
                            variant="primary"
                        />
                    </div>
                </form>

                <div className="text-center mt-8 pt-8 border-t border-gray-200">
                    <p className="text-quiz-gray mb-2">Nemaš račun?</p>
                    <Link
                        to="/register"
                        className="text-quiz-primary no-underline font-bold text-lg hover:underline transition-all duration-200"
                    >
                        Registriraj se
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;

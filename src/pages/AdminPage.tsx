import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminService, AdminStatsDto } from '../services/adminService';
import Button from '../components/Button';

function AdminPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [stats, setStats] = useState<AdminStatsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.roleName !== 'ADMIN')) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate, loading]);

    const fetchStats = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await AdminService.getAdminStats();
            setStats(data);
        } catch (err: any) {
            setError(err.message || 'Greška pri dohvaćanju statistika');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.roleName === 'ADMIN') {
            fetchStats();
        }
    }, [isAuthenticated, user]);

    if (loading) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje admin panela...
                    </h3>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">
                        Greška
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button
                        text="Pokušaj ponovno"
                        onClick={fetchStats}
                        variant="primary"
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    👑 Admin Panel
                </h1>
                <p className="text-gray-600">
                    Upravljanje sustavom za pub kvizove
                </p>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Korisnici
                                </h3>
                                <p className="text-3xl font-bold text-quiz-primary">
                                    {stats.totalUsers}
                                </p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Natjecatelji:</span>
                                <span>{stats.competitorCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Organizatori:</span>
                                <span>{stats.organizerCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Admini:</span>
                                <span>{stats.adminCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Pending organizatori
                                </h3>
                                <p className="text-3xl font-bold text-orange-600">
                                    {stats.pendingOrganizerCount}
                                </p>
                            </div>
                            <div className="text-4xl">⏳</div>
                        </div>
                        {stats.pendingOrganizerCount > 0 && (
                            <div className="mt-4">
                                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Potrebna akcija!
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Kvizovi
                                </h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {stats.totalQuizzes}
                                </p>
                            </div>
                            <div className="text-4xl">🏆</div>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Nadolazeći:</span>
                                <span>{stats.upcomingQuizzes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Završeni:</span>
                                <span>{stats.completedQuizzes}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">⏳</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Pending organizatori
                            </h3>
                            {stats && stats.pendingOrganizerCount > 0 && (
                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                                    {stats.pendingOrganizerCount} čeka
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Odobri ili odbij zahtjeve za organizatorski račun
                    </p>
                    <Button
                        text="Upravljaj zahtjevima"
                        onClick={() => navigate('/admin/pending-organizers')}
                        variant="primary"
                        className="w-full"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">👥</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Korisnici
                            </h3>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Pregled i upravljanje svim korisnicima u sustavu
                    </p>
                    <Button
                        text="Upravljaj korisnicima"
                        onClick={() => navigate('/admin/users')}
                        variant="secondary"
                        className="w-full"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">🏆</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Kvizovi
                            </h3>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Pregled i upravljanje svim kvizovima u sustavu
                    </p>
                    <Button
                        text="Upravljaj kvizovima"
                        onClick={() => navigate('/admin/quizzes')}
                        variant="secondary"
                        className="w-full"
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">🏷️</div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">
                                Kategorije
                            </h3>
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Dodaj, uredi ili obriši kategorije kvizova
                    </p>
                    <Button
                        text="Upravljaj kategorijama"
                        onClick={() => navigate('/admin/categories')}
                        variant="secondary"
                        className="w-full"
                    />
                </div>
            </div>

            {stats && stats.pendingOrganizerCount > 0 && (
                <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-orange-800">
                                🚨 Potrebna akcija
                            </h3>
                            <p className="text-orange-700">
                                {stats.pendingOrganizerCount} organizatora čeka odobravanje
                            </p>
                        </div>
                        <Button
                            text="Idi na zahtjeve"
                            onClick={() => navigate('/admin/pending-organizers')}
                            variant="primary"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

export default AdminPage;
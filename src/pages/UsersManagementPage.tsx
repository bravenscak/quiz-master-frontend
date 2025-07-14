import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminService, UserDto } from '../services/adminService';
import Button from '../components/Button';

function UsersManagementPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [users, setUsers] = useState<UserDto[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.roleName !== 'ADMIN')) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate, loading]);

    const fetchUsers = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await AdminService.getAllUsers();
            setUsers(data);
            setFilteredUsers(data);
        } catch (err: any) {
            setError(err.message || 'Greška pri dohvaćanju korisnika');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.roleName === 'ADMIN') {
            fetchUsers();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        let filtered = users;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(u => 
                u.firstName.toLowerCase().includes(term) ||
                u.lastName.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                u.username.toLowerCase().includes(term) ||
                (u.organizationName && u.organizationName.toLowerCase().includes(term))
            );
        }

        if (selectedRole) {
            filtered = filtered.filter(u => u.roleName === selectedRole);
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, selectedRole]);

    const handleDeleteUser = async (userId: number, firstName: string, lastName: string, roleName: string) => {
        if (userId === user?.id) {
            alert('Ne možete obrisati sami sebe!');
            return;
        }

        const confirmed = window.confirm(
            `Jeste li sigurni da želite obrisati korisnika "${firstName} ${lastName}" (${roleName})?\n\nBrisat će se SVI podaci korisnika:\n• Kvizovi koje je kreirao\n• Timovi u koje se registrirao\n• Svi povezani podaci\n\nOVA AKCIJA SE NE MOŽE PONIŠTITI!`
        );

        if (!confirmed) return;

        setDeletingIds(prev => new Set(prev).add(userId));

        try {
            await AdminService.deleteUser(userId);
            alert(`Korisnik "${firstName} ${lastName}" je uspješno obrisan!`);
            
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (err: any) {
            alert(`Greška pri brisanju korisnika: ${err.message}`);
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    const getUserCountByRole = (role: string) => {
        return users.filter(u => u.roleName === role).length;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
    };

    if (loading) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje korisnika...
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
                        onClick={() => navigate('/admin')}
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
                        onClick={fetchUsers}
                        variant="primary"
                    />
                </div>
            </main>
        );
    }

    return (
        <main className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        text="← Nazad na Admin Panel"
                        onClick={() => navigate('/admin')}
                        variant="secondary"
                    />
                </div>

                <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                    👥 Upravljanje korisnicima
                </h1>
                <p className="text-gray-600">
                    Pregled i upravljanje svim korisnicima u sustavu
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">👥</div>
                        <div>
                            <p className="text-sm text-gray-600">Ukupno</p>
                            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">🏆</div>
                        <div>
                            <p className="text-sm text-gray-600">Natjecatelji</p>
                            <p className="text-2xl font-bold text-blue-600">{getUserCountByRole('COMPETITOR')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">🎯</div>
                        <div>
                            <p className="text-sm text-gray-600">Organizatori</p>
                            <p className="text-2xl font-bold text-green-600">{getUserCountByRole('ORGANIZER')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">👑</div>
                        <div>
                            <p className="text-sm text-gray-600">Admini</p>
                            <p className="text-2xl font-bold text-purple-600">{getUserCountByRole('ADMIN')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pretraži korisnike
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Ime, prezime, email, username, organizacija..."
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        />
                    </div>

                    <div className="md:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtriraj po roli
                        </label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
                        >
                            <option value="">Sve role</option>
                            <option value="COMPETITOR">Natjecatelji</option>
                            <option value="ORGANIZER">Organizatori</option>
                            <option value="ADMIN">Admini</option>
                        </select>
                    </div>

                    {(searchTerm || selectedRole) && (
                        <div className="md:w-32 flex items-end">
                            <Button
                                text="Očisti"
                                onClick={clearFilters}
                                variant="secondary"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    Prikazano {filteredUsers.length} od {users.length} korisnika
                    {searchTerm && (
                        <span> • Pretraga: "{searchTerm}"</span>
                    )}
                    {selectedRole && (
                        <span> • Rola: {selectedRole}</span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Nema rezultata
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Nema korisnika koji odgovaraju vašim filterima.
                        </p>
                        <Button
                            text="Očisti filtere"
                            onClick={clearFilters}
                            variant="secondary"
                        />
                    </div>
                ) : (
                    filteredUsers.map((userItem) => {
                        const isDeleting = deletingIds.has(userItem.id);
                        const isCurrentUser = userItem.id === user?.id;

                        return (
                            <div
                                key={userItem.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                userItem.roleName === 'ADMIN' ? 'bg-purple-100' :
                                                userItem.roleName === 'ORGANIZER' ? 'bg-green-100' : 'bg-blue-100'
                                            }`}>
                                                <span className={`text-xl ${
                                                    userItem.roleName === 'ADMIN' ? 'text-purple-600' :
                                                    userItem.roleName === 'ORGANIZER' ? 'text-green-600' : 'text-blue-600'
                                                }`}>
                                                    {userItem.roleName === 'ADMIN' ? '👑' : 
                                                     userItem.roleName === 'ORGANIZER' ? '🎯' : '🏆'}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {userItem.firstName} {userItem.lastName}
                                                    {isCurrentUser && (
                                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                            To ste vi
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    @{userItem.username} • {userItem.roleName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <p className="text-gray-600">{userItem.email}</p>
                                            </div>
                                            
                                            {userItem.organizationName && (
                                                <div>
                                                    <span className="font-medium text-gray-700">Organizacija:</span>
                                                    <p className="text-gray-600">{userItem.organizationName}</p>
                                                </div>
                                            )}
                                        </div>

                                        {userItem.description && (
                                            <div className="mt-4">
                                                <span className="font-medium text-gray-700">Opis:</span>
                                                <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded border">
                                                    {userItem.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:w-32">
                                        <Button
                                            text={isDeleting ? "Brišem..." : "🗑️ Obriši"}
                                            onClick={() => handleDeleteUser(
                                                userItem.id, 
                                                userItem.firstName, 
                                                userItem.lastName, 
                                                userItem.roleName
                                            )}
                                            variant="danger"
                                            disabled={isDeleting || isCurrentUser}
                                            className="w-full"
                                        />
                                        {isCurrentUser && (
                                            <p className="text-xs text-gray-500 mt-1 text-center">
                                                Ne možete obrisati sebe
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default UsersManagementPage;
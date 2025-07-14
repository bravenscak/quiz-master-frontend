import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminService, PendingOrganizerDto } from '../services/adminService';
import Button from '../components/Button';

function PendingOrganizersPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizerDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.roleName !== 'ADMIN')) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate, loading]);

    const fetchPendingOrganizers = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await AdminService.getPendingOrganizers();
            setPendingOrganizers(data);
        } catch (err: any) {
            setError(err.message || 'Greška pri dohvaćanju pending organizatora');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.roleName === 'ADMIN') {
            fetchPendingOrganizers();
        }
    }, [isAuthenticated, user]);

    const handleApprove = async (organizerId: number, organizerName: string) => {
        const confirmed = window.confirm(
            `Jeste li sigurni da želite odobriti organizatora "${organizerName}"?\n\nOrganizator će moći kreirati kvizove.`
        );

        if (!confirmed) return;

        setProcessingIds(prev => new Set(prev).add(organizerId));

        try {
            await AdminService.approveOrganizer(organizerId);
            
            setPendingOrganizers(prev => 
                prev.filter(org => org.id !== organizerId)
            );

            alert(`Organizator "${organizerName}" je uspješno odobren!`);
        } catch (err: any) {
            alert(`Greška pri odobravanju: ${err.message}`);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(organizerId);
                return newSet;
            });
        }
    };

    const handleReject = async (organizerId: number, organizerName: string) => {
        const confirmed = window.confirm(
            `Jeste li sigurni da želite odbiti organizatora "${organizerName}"?\n\nKorisnik će biti obrisan iz sustava!`
        );

        if (!confirmed) return;

        const doubleConfirmed = window.confirm(
            `PAŽNJA: Ova akcija će potpuno obrisati korisnika!\n\nPotvrdi brisanje korisnika "${organizerName}".`
        );

        if (!doubleConfirmed) return;

        setProcessingIds(prev => new Set(prev).add(organizerId));

        try {
            await AdminService.rejectOrganizer(organizerId);
            
            setPendingOrganizers(prev => 
                prev.filter(org => org.id !== organizerId)
            );

            alert(`Organizator "${organizerName}" je odbijen i uklonjen.`);
        } catch (err: any) {
            alert(`Greška pri odbijanju: ${err.message}`);
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(organizerId);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <main className="p-8 max-w-6xl mx-auto">
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4 animate-pulse">
                        ⏳
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600">
                        Učitavanje pending organizatora...
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
                        onClick={fetchPendingOrganizers}
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
                    ⏳ Pending organizatori
                </h1>
                <p className="text-gray-600">
                    Odobri ili odbij zahtjeve za organizatorski račun
                </p>
            </div>

            {pendingOrganizers.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nema pending organizatora
                    </h3>
                    <p className="text-gray-500">
                        Svi zahtjevi za organizatorski račun su obrađeni.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-orange-800">
                                    📋 {pendingOrganizers.length} zahtjeva čeka obradu
                                </h3>
                                <p className="text-orange-700">
                                    Molimo obradite zahtjeve u razumnom roku.
                                </p>
                            </div>
                            <div className="text-orange-600 text-4xl">⏳</div>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {pendingOrganizers.map((organizer) => {
                            const isProcessing = processingIds.has(organizer.id);
                            
                            return (
                                <div
                                    key={organizer.id}
                                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {organizer.firstName} {organizer.lastName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {organizer.username}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Email:</span>
                                                    <p className="text-gray-600">{organizer.email}</p>
                                                </div>
                                                
                                                {organizer.organizationName && (
                                                    <div>
                                                        <span className="font-medium text-gray-700">Organizacija:</span>
                                                        <p className="text-gray-600">{organizer.organizationName}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {organizer.description && (
                                                <div className="mt-4">
                                                    <span className="font-medium text-gray-700">Opis:</span>
                                                    <p className="text-gray-600 mt-1 p-3 bg-gray-50 rounded border">
                                                        {organizer.description}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 lg:w-64">
                                            <Button
                                                text={isProcessing ? "⏳ Obrađujem..." : "✅ Odobri"}
                                                onClick={() => handleApprove(organizer.id, `${organizer.firstName} ${organizer.lastName}`)}
                                                variant="primary"
                                                disabled={isProcessing}
                                                className="flex-1"
                                            />
                                            <Button
                                                text={isProcessing ? "⏳ Obrađujem..." : "❌ Odbij"}
                                                onClick={() => handleReject(organizer.id, `${organizer.firstName} ${organizer.lastName}`)}
                                                variant="danger"
                                                disabled={isProcessing}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>
    );
}

export default PendingOrganizersPage;
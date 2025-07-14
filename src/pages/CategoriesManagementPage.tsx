import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminService, CreateCategoryDto, UpdateCategoryDto } from '../services/adminService';
import { CategoryService, Category } from '../services/categoryService';
import Button from '../components/Button';

function CategoriesManagementPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createData, setCreateData] = useState<CreateCategoryDto>({
        name: ''
    });
    const [creating, setCreating] = useState(false);

    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [editData, setEditData] = useState<UpdateCategoryDto>({
        name: ''
    });
    const [updating, setUpdating] = useState(false);

    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    
    const [operationError, setOperationError] = useState<string>('');
    const [operationSuccess, setOperationSuccess] = useState<string>('');

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.roleName !== 'ADMIN')) {
            navigate('/');
            return;
        }
    }, [isAuthenticated, user, navigate, loading]);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await CategoryService.getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.message || 'Greška pri dohvaćanju kategorija');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.roleName === 'ADMIN') {
            fetchCategories();
        }
    }, [isAuthenticated, user]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setOperationError('');
        setOperationSuccess('');
        
        if (!createData.name.trim()) {
            setOperationError('Naziv kategorije je obavezan');
            return;
        }

        setCreating(true);
        try {
            await AdminService.createCategory(createData);
            setOperationSuccess('Kategorija je uspješno kreirana!');
            
            setCreateData({ name: ''});
            setShowCreateForm(false);
            
            await fetchCategories();
            
            setTimeout(() => setOperationSuccess(''), 2000);
        } catch (err: any) {
            setOperationError(`Greška pri kreiranju kategorije: ${err.message}`);
        } finally {
            setCreating(false);
        }
    };

    const handleEditStart = (category: Category) => {
        setEditingCategory(category);
        setEditData({
            name: category.name,
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setOperationError('');
        setOperationSuccess('');
        
        if (!editingCategory || !editData.name.trim()) {
            setOperationError('Naziv kategorije je obavezan');
            return;
        }

        setUpdating(true);
        try {
            await AdminService.updateCategory(editingCategory.id, editData);
            setOperationSuccess('Kategorija je uspješno ažurirana!');
            
            setEditingCategory(null);
            
            await fetchCategories();
            
            setTimeout(() => setOperationSuccess(''), 2000);
        } catch (err: any) {
            setOperationError(`Greška pri ažuriranju kategorije: ${err.message}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (categoryId: number, categoryName: string) => {
        const confirmed = window.confirm(
            `Jeste li sigurni da želite obrisati kategoriju "${categoryName}"?\n\nOva akcija se ne može poništiti.`
        );

        if (!confirmed) return;

        setOperationError('');
        setOperationSuccess('');
        setDeletingIds(prev => new Set(prev).add(categoryId));

        try {
            await AdminService.deleteCategory(categoryId);
            setOperationSuccess(`Kategorija "${categoryName}" je uspješno obrisana!`);
            
            await fetchCategories();
            
            setTimeout(() => setOperationSuccess(''), 3000);
        } catch (err: any) {
            setOperationError(`Greška pri brisanju kategorije: ${err.message}`);
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(categoryId);
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
                        Učitavanje kategorija...
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
                        onClick={fetchCategories}
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

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-quiz-primary text-4xl font-bold mb-2">
                            🏷️ Upravljanje kategorijama
                        </h1>
                        <p className="text-gray-600">
                            Dodaj, uredi ili obriši kategorije kvizova
                        </p>
                    </div>

                    <Button
                        text="+ Nova kategorija"
                        onClick={() => setShowCreateForm(true)}
                        variant="primary"
                    />
                </div>
            </div>

            {operationSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-green-600 text-xl mr-3">✅</div>
                        <div className="text-green-800 font-medium">
                            {operationSuccess}
                        </div>
                        <button
                            onClick={() => setOperationSuccess('')}
                            className="ml-auto text-green-600 hover:text-green-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {operationError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="text-red-600 text-xl mr-3">❌</div>
                        <div className="text-red-800 font-medium">
                            {operationError}
                        </div>
                        <button
                            onClick={() => setOperationError('')}
                            className="ml-auto text-red-600 hover:text-red-800"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {showCreateForm && (
                <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        ➕ Dodaj novu kategoriju
                    </h3>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Naziv kategorije *
                            </label>
                            <input
                                type="text"
                                value={createData.name}
                                onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="npr. Sport, Glazba, Filmovi..."
                                disabled={creating}
                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                text={creating ? "Kreiram..." : "Kreiraj kategoriju"}
                                onClick={() => {}}
                                variant="primary"
                                disabled={creating}
                                className="flex-1"
                            />
                            <Button
                                text="Odustani"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setCreateData({ name: ''});
                                }}
                                variant="secondary"
                                disabled={creating}
                                className="flex-1"
                            />
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {categories.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 text-6xl mb-4">🏷️</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            Nema kategorija
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Dodajte prvu kategoriju za kvizove.
                        </p>
                        <Button
                            text="+ Dodaj kategoriju"
                            onClick={() => setShowCreateForm(true)}
                            variant="primary"
                        />
                    </div>
                ) : (
                    categories.map((category) => {
                        const isDeleting = deletingIds.has(category.id);
                        const isEditing = editingCategory?.id === category.id;

                        return (
                            <div
                                key={category.id}
                                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {isEditing ? (
                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            ✏️ Uredi kategoriju
                                        </h3>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Naziv kategorije *
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                                disabled={updating}
                                                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none disabled:opacity-50"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                text={updating ? "Spremam..." : "Spremi promjene"}
                                                onClick={() => {}}
                                                variant="primary"
                                                disabled={updating}
                                                className="flex-1"
                                            />
                                            <Button
                                                text="Odustani"
                                                onClick={() => setEditingCategory(null)}
                                                variant="secondary"
                                                disabled={updating}
                                                className="flex-1"
                                            />
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 bg-quiz-primary bg-opacity-10 rounded-full flex items-center justify-center">
                                                    <span className="text-quiz-primary text-lg">🏷️</span>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-800">
                                                    {category.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                text="✏️ Uredi"
                                                onClick={() => handleEditStart(category)}
                                                variant="secondary"
                                                disabled={isDeleting}
                                                className="px-4 py-2"
                                            />
                                            <Button
                                                text={isDeleting ? "Brišem..." : "🗑️ Obriši"}
                                                onClick={() => handleDelete(category.id, category.name)}
                                                variant="danger"
                                                disabled={isDeleting}
                                                className="px-4 py-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default CategoriesManagementPage;
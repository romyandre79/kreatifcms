import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, LayoutGrid, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ dataGrids }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [gridToDelete, setGridToDelete] = useState(null);

    const confirmDelete = (id) => {
        setGridToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (gridToDelete) {
            router.delete(route('datagrids.destroy', gridToDelete), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Advanced DataGrids
                    </h2>
                    <Link
                        href={route('datagrids.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Grid
                    </Link>
                </div>
            }
        >
            <Head title="DataGrids" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {dataGrids.length === 0 ? (
                                <div className="text-center py-12">
                                    <LayoutGrid className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No DataGrids configured</h3>
                                    <p className="mt-1 text-sm text-gray-500">Create your first advanced datagrid to manage your content.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {dataGrids.map((grid) => (
                                        <div key={grid.id} className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{grid.name}</h3>
                                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        {grid.content_type?.name}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <Link 
                                                        href={route('datagrids.show', grid.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="View Grid"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Link>
                                                    <Link 
                                                        href={route('datagrids.edit', grid.id)}
                                                        className="p-2 text-gray-400 hover:text-amber-600 transition-colors"
                                                        title="Edit Config"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => confirmDelete(grid.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete Grid"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                <p>Slug: <code className="bg-gray-50 px-1 rounded">{grid.slug}</code></p>
                                                <p>Columns: {grid.settings?.columns?.length || 0}</p>
                                                <p>Buttons: {grid.buttons?.length || 0}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete DataGrid"
                message="Are you sure you want to delete this DataGrid configuration? The underlying data will not be deleted."
            />
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Plus, Database, Settings, Trash2, Table, ListPlus, Code } from 'lucide-react';
import ApiDocsModal from '@/Components/ApiDocsModal';
import { useState } from 'react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ contentTypes }) {
    const { auth } = usePage().props;
    const [selectedContentType, setSelectedContentType] = useState(null);
    const [isApiModalOpen, setIsApiModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contentTypeToDelete, setContentTypeToDelete] = useState(null);
    const [processing, setProcessing] = useState(false);

    const openApiDocs = (type) => {
        setSelectedContentType(type);
        setIsApiModalOpen(true);
    };

    const confirmDelete = (type) => {
        setContentTypeToDelete(type);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (contentTypeToDelete) {
            setProcessing(true);
            router.delete(route('content-types.destroy', contentTypeToDelete.id), {
                onFinish: () => {
                    setProcessing(false);
                    setShowDeleteModal(false);
                    setContentTypeToDelete(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Content Types Builder</h2>}
        >
            <Head title="Content Types" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Content Types</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage the dynamic data structures for your project.</p>
                    </div>
                    <Link
                        href={route('content-types.create')}
                        className="inline-flex items-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {contentTypes.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-12 h-full">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Database className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No content types created</h3>
                            <p className="mt-2 text-sm text-gray-500 mb-6 text-center max-w-md">Get started by creating your first dynamic content type which will automatically generate an API and a data table.</p>
                            <Link
                                href={route('content-types.create')}
                                className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Content Type
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                            {contentTypes.map((type) => (
                                <div key={type.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all group flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                <Database className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 leading-tight">{type.name}</h4>
                                                <p className="text-xs font-semibold text-indigo-600">{type.fields.length} predefined fields</p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 flex-1 mb-6 line-clamp-2">{type.description || 'No description provided.'}</p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <Link 
                                            href={route('content-entries.index', type.slug)} 
                                            className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                                        >
                                            <Table className="w-4 h-4" />
                                            View Data
                                        </Link>
                                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                             <button 
                                                onClick={() => openApiDocs(type)}
                                                className="p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors" 
                                                title="API Documentation"
                                            >
                                                <Code className="w-4 h-4" />
                                            </button>
                                            <Link 
                                                href={route('content-types.edit', type.id)} 
                                                className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
                                                title="Edit Schema"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => confirmDelete(type)}
                                                className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
                                                title="Delete Content Type"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ApiDocsModal 
                isOpen={isApiModalOpen} 
                onClose={() => setIsApiModalOpen(false)} 
                contentType={selectedContentType} 
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Content Type"
                message={`Are you sure you want to delete the "${contentTypeToDelete?.name}" content type? This will PERMANENTLY delete all data in this collection.`}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ auth, templates }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const { delete: destroy, processing } = useForm();

    const confirmDelete = (template) => {
        setTemplateToDelete(template);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (templateToDelete) {
            destroy(route('email-templates.destroy', templateToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setTemplateToDelete(null);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Email Templates</h2>}
        >
            <Head title="Email Templates" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-600">Manage and create reusable email templates for your CMS notifications.</p>
                                <Link
                                    href={route('email-templates.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 transition ease-in-out duration-150"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Template
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {templates.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                    No email templates found. Create your first one!
                                                </td>
                                            </tr>
                                        ) : (
                                            templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{template.slug}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.subject}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={route('email-templates.edit', template.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => confirmDelete(template)}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Delete Template"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Email Template"
                message={`Are you sure you want to delete the email template "${templateToDelete?.name}"? This action cannot be undone.`}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

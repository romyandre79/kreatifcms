import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Search, Copy, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ roles }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);
    const [search, setSearch] = useState('');

    const { delete: destroy, processing } = useForm();

    const confirmDelete = (role) => {
        setRoleToDelete(role);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (roleToDelete) {
            destroy(route('roles.destroy', roleToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setRoleToDelete(null);
                },
            });
        }
    };

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(search.toLowerCase()) || 
        (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Role Management</h2>}
        >
            <Head title="Roles" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                        <p className="text-gray-500 text-sm mt-1">Define permissions and access levels for system users.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="Search roles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Link 
                            href={route('roles.store')} 
                            method="post"
                            as="button"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add Role
                        </Link>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-100 table-fixed">
                        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest w-1/4">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell w-1/2">Description</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest w-1/6">Users</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest w-[120px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRoles.map((role) => (
                                <tr key={role.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5 font-bold text-gray-900 text-sm">{role.name}</td>
                                    <td className="px-6 py-5 text-gray-600 text-sm hidden md:table-cell truncate pr-12">{role.description || 'No description provided'}</td>
                                    <td className="px-6 py-5 text-gray-900 text-sm font-semibold text-center">
                                        <div className="inline-flex items-center justify-center bg-gray-100 rounded-full px-3 py-1 text-xs">
                                            {role.users_count}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button title="Duplicate" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <Link 
                                                href={route('roles.edit', role.id)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            {role.slug !== 'super-admin' && (
                                                <button 
                                                    onClick={() => confirmDelete(role)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRoles.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No roles found matching "{search}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Role"
                message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This will affect all users assigned to this role.`}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

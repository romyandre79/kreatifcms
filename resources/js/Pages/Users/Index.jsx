import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { User, Plus, Edit, Trash2, X, AlertTriangle, Search } from 'lucide-react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ users, roles }) {
    const { auth } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [editUser, setEditUser] = useState(null);
    const [search, setSearch] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
    });

    const openNew = () => {
        reset();
        clearErrors();
        setEditUser(null);
        setShowForm(true);
    };

    const openEdit = (user) => {
        setData({
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            password: '',
        });
        clearErrors();
        setEditUser(user.id);
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('users.update', editUser), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        } else {
            post(route('users.store'), {
                onSuccess: () => {
                    setShowForm(false);
                    reset();
                },
            });
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (userToDelete) {
            destroy(route('users.destroy', userToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">User Administration</h2>}
        >
            <Head title="Users" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage system access and assign roles to team members.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="Search users..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={openNew}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-100 table-fixed">
                            <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest w-1/3">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest w-1/4">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell w-1/4">Email</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest w-[120px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 group-hover:scale-105 transition-all">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500 md:hidden">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md ${
                                                user.role?.slug === 'super-admin' ? 'bg-indigo-100 text-indigo-800' :
                                                user.role?.slug === 'editor' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                'bg-gray-100 text-gray-700 border border-gray-200'
                                            }`}>
                                                {user.role?.name || 'No Role'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {auth.user.id !== user.id && (
                                                    <button onClick={() => confirmDelete(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {auth.user.id === user.id && (
                                                    <div className="p-1.5 text-gray-300 cursor-not-allowed" title="You cannot delete your own account">
                                                        <Trash2 className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No users found matching "{search}"
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* User Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => !processing && setShowForm(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">{editUser ? 'Edit User' : 'Add User'}</h3>
                                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    {Object.keys(errors).length > 0 && (
                                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                            <div className="flex items-center mb-1 font-bold">
                                                <AlertTriangle className="w-4 h-4 mr-2" />
                                                Validation Errors:
                                            </div>
                                            <ul className="list-disc list-inside">
                                                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                className="block w-full border-gray-200 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="block w-full border-gray-200 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                className="block w-full border-gray-200 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                                value={data.role_id}
                                                onChange={e => setData('role_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Password {editUser && <span className="text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>}
                                            </label>
                                            <input
                                                type="password"
                                                className="block w-full border-gray-200 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                                                value={data.password}
                                                onChange={e => setData('password', e.target.value)}
                                                placeholder={editUser ? '••••••••' : 'Min 8 characters'}
                                                required={!editUser}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto transition-all"
                                    >
                                        {processing ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone and all data associated with this user will be permanently removed.`}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

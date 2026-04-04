import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Edit, Trash2, Globe, Code, CheckCircle, XCircle } from 'lucide-react';

export default function Index({ apis }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this API endpoint?')) {
            destroy(route('admin.general-api.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">General API Endpoints</h2>}
        >
            <Head title="General API" />

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="p-6 text-gray-900">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-500 text-sm">
                            Manage your custom API endpoints. Use <strong>Bridge</strong> for safe external requests or <strong>Custom</strong> for PHP logic.
                        </p>
                        <Link
                            href={route('admin.general-api.create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <Plus size={18} />
                            Create New Endpoint
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Endpoint</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {apis.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                                            No API endpoints created yet.
                                        </td>
                                    </tr>
                                ) : (
                                    apis.map((api) => (
                                        <tr key={api.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4">
                                                {api.is_active ? (
                                                    <CheckCircle size={20} className="text-green-500" />
                                                ) : (
                                                    <XCircle size={20} className="text-gray-300" />
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-medium text-gray-900">{api.name}</td>
                                            <td className="px-4 py-4">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-indigo-600">
                                                    /api/v1/custom/{api.slug}
                                                </code>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    api.type === 'bridge' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {api.type === 'bridge' ? <Globe size={12} /> : <Code size={12} />}
                                                    {api.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-xs font-bold text-gray-500">{api.method || 'GET'}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('admin.general-api.edit', api.id)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(api.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    >
                                                        <Trash2 size={18} />
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
        </AuthenticatedLayout>
    );
}

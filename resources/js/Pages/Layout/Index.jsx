import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Layout as LayoutIcon,
    Plus,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    Shield,
    Users,
    Globe
} from 'lucide-react';

export default function Index({ layouts = [] }) {
    const deleteLayout = (id) => {
        if (confirm('Are you sure you want to delete this layout?')) {
            router.delete(route('layouts.destroy', id), {
                preserveScroll: true
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-2xl text-gray-800 leading-tight flex items-center gap-2">
                        <LayoutIcon className="w-6 h-6 text-indigo-600" />
                        Layout Management
                    </h2>
                    <Link
                        href={route('layouts.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Plus className="w-5 h-5" />
                        Create Layout
                    </Link>
                </div>
            }
        >
            <Head title="Layout Management" />

            <div className="mx-auto sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {layouts.map((layout) => (
                        <div key={layout.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <LayoutIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-1">
                                        {layout.is_default && (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">
                                                <CheckCircle className="w-3 h-3" />
                                                Default
                                            </span>
                                        )}
                                        {layout.access_type === 'general' ? (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-100 uppercase">
                                                <Globe className="w-3 h-3" />
                                                General
                                            </span>
                                        ) : layout.access_type === 'authenticated' ? (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-orange-100 uppercase">
                                                <Users className="w-3 h-3" />
                                                Auth
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-100 uppercase">
                                                <Shield className="w-3 h-3" />
                                                {layout.roles?.length || 0} Roles
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-1">{layout.name}</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Last updated {new Date(layout.updated_at).toLocaleDateString()}
                                </p>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('layouts.edit', layout.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-100"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </Link>
                                    {!layout.is_default && (
                                        <button
                                            onClick={() => deleteLayout(layout.id)}
                                            className="p-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-colors border border-red-100"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {layouts.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                            <LayoutIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Layouts Found</h3>
                            <p className="text-gray-400 mt-2">Start by creating your first site layout.</p>
                            <Link
                                href={route('layouts.create')}
                                className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-5 h-5" />
                                Initial Layout
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

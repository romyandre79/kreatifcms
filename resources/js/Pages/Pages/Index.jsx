import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Plus, Edit2, Trash2, X, Link as LinkIcon, Home, Star } from 'lucide-react';

export default function Index({ pages, homePageSlug }) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: ''
    });

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('pages.store'), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            }
        });
    };

    const setAsHome = (pageId) => {
        post(route('pages.set-home', pageId));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Pages</h2>}>
            <Head title="Pages" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">All Pages</h1>
                            <p className="text-sm text-gray-500">Manage your dynamic pages here.</p>
                        </div>
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Page
                        </button>
                    </div>

                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Page Details</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden md:table-cell">Last Modified</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {pages.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium">No pages created yet.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    pages.map(page => (
                                        <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-semibold text-gray-900">{page.title}</div>
                                                            {page.slug === homePageSlug && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                                                    <Home className="w-2.5 h-2.5 fill-current" />
                                                                    Home
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                                                            <LinkIcon className="w-3 h-3" />
                                                            /{page.slug}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    page.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {page.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                                {new Date(page.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {page.is_published && page.slug !== homePageSlug && (
                                                        <button 
                                                            onClick={() => setAsHome(page.id)}
                                                            title="Set as Home Page"
                                                            className="text-gray-400 hover:text-amber-500 transition-colors"
                                                        >
                                                            <Home className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <a 
                                                        href={`/${page.slug}`} 
                                                        target="_blank" 
                                                        title="View Live Page"
                                                        className="text-gray-400 hover:text-gray-900 transition-colors"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </a>
                                                    <Link 
                                                        href={route('pages.edit', page.id)} 
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="Edit in Page Builder"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <Link 
                                                        href={route('pages.destroy', page.id)} 
                                                        method="delete" 
                                                        as="button" 
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete Page"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Link>
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleCreate}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg font-bold text-gray-900">Create New Page</h3>
                                        <button type="button" onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-500 bg-gray-50 rounded-lg p-1">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Page Title</label>
                                            <input 
                                                type="text" 
                                                value={data.title}
                                                onChange={e => setData('title', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
                                                placeholder="e.g. Terms of Service"
                                                required 
                                            />
                                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">URL Slug</label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                                                    /
                                                </span>
                                                <input 
                                                    type="text" 
                                                    value={data.slug}
                                                    onChange={e => setData('slug', e.target.value)}
                                                    className="flex-1 w-full px-4 py-2 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-colors"
                                                    placeholder="e.g. terms-of-service"
                                                    required 
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Leave as "welcome" to set this page as the main landing page.</p>
                                            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-indigo-600 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    >
                                        Create Page
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

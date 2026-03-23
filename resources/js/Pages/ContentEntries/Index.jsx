import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, Clock } from 'lucide-react';
import HistoryModal from '@/Components/HistoryModal';
import { useState } from 'react';

export default function Index({ contentType, entries, slug }) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            router.delete(route('content-entries.destroy', { slug, id }));
        }
    };

    const openHistory = (id) => {
        setSelectedId(id);
        setHistoryOpen(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {contentType.name} Entries
                    </h2>
                    <Link
                        href={route('content-entries.create', slug)}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New {contentType.name}
                    </Link>
                </div>
            }
        >
            <Head title={`${contentType.name} Entries`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {entries.length === 0 ? (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No entries found</h3>
                                <p className="mt-1 text-sm text-gray-500">Start by adding your first {contentType.name}.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                            {contentType.fields.slice(0, 3).map(field => (
                                                <th key={field.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {field.name}
                                                </th>
                                            ))}
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider italic">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {entries.map((entry) => (
                                            <tr key={entry.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.id}</td>
                                                {contentType.fields.slice(0, 3).map(field => {
                                                    const fieldName = field.attribute_name;
                                                    const value = entry[fieldName];
                                                    
                                                    const formatValue = (val, type) => {
                                                        if (val === null || val === undefined) return '-';
                                                        
                                                        // Format Date
                                                        if (typeof val === 'string') {
                                                            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                                                                const [y, m, d] = val.split('-');
                                                                return `${d}-${m}-${y}`;
                                                            }
                                                            if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
                                                                const date = new Date(val);
                                                                const d = String(date.getDate()).padStart(2, '0');
                                                                const m = String(date.getMonth() + 1).padStart(2, '0');
                                                                const y = date.getFullYear();
                                                                return `${d}-${m}-${y}`;
                                                            }
                                                        }

                                                        // Format Number
                                                        if (type === 'integer' || typeof val === 'number') {
                                                            return new Intl.NumberFormat('id-ID').format(val);
                                                        }

                                                        return val.toString();
                                                    };

                                                    return (
                                                        <td key={field.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {field.type === 'image' && value ? (
                                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                                                                    <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                formatValue(value, field.type)
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('content-entries.edit', { slug, id: entry.id })} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                        <Edit className="w-4 h-4 inline" />
                                                    </Link>
                                                    <button 
                                                        onClick={() => openHistory(entry.id)}
                                                        className="text-amber-600 hover:text-amber-900 mr-4"
                                                        title="View History"
                                                    >
                                                        <Clock className="w-4 h-4 inline" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="w-4 h-4 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <HistoryModal 
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
                contentTypeSlug={slug}
                rowId={selectedId}
            />
        </AuthenticatedLayout>
    );
}

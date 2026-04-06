import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, ArrowLeft, Image as ImageIcon, Paperclip, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import Summernote from '@/Components/Summernote';
import { usePage } from '@inertiajs/react';

export function Edit({ contentType, entry, slug, availableRelationships }) {
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [activePickerField, setActivePickerField] = useState(null);

    const initialState = {};
    contentType.fields.forEach(field => {
        const name = field.attribute_name;
        initialState[name] = entry[name] || (field.type === 'boolean' ? false : '');
    });

    const { data, setData, put, processing, errors } = useForm(initialState);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('content-entries.update', { slug, id: entry.id }));
    };

    const handleMediaSelect = (url) => {
        if (activePickerField) {
            setData(activePickerField, url);
        }
        setMediaPickerOpen(false);
        setActivePickerField(null);
    };

    const renderField = (field) => {
        const name = field.attribute_name;
        const { plugins } = usePage().props;
        const isSummernoteEnabled = plugins?.some(p => p.alias === 'editorsummernote');

        switch (field.type) {
            case 'boolean':
                return (
                    <div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={name}
                                checked={data[name]}
                                onChange={e => setData(name, e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={name} className="text-sm text-gray-700">{field.name}</label>
                        </div>
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            case 'longtext':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                        {isSummernoteEnabled ? (
                            <Summernote
                                value={data[name]}
                                onChange={value => setData(name, value)}
                                placeholder={`Enter ${field.name}...`}
                            />
                        ) : (
                            <textarea
                                value={data[name]}
                                onChange={e => setData(name, e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                rows={4}
                            />
                        )}
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            case 'image':
            case 'file':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{field.name}</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={data[name]}
                                    onChange={e => setData(name, e.target.value)}
                                    placeholder="Select or enter URL..."
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {field.type === 'image' ? <ImageIcon className="w-4 h-4" /> : <Paperclip className="w-4 h-4" />}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setActivePickerField(name);
                                    setMediaPickerOpen(true);
                                }}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                            >
                                Browse
                            </button>
                            {data[name] && (
                                <button
                                    type="button"
                                    onClick={() => setData(name, '')}
                                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {field.type === 'image' && data[name] && (
                            <div className="mt-2 w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                <img src={data[name]} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            case 'date':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{field.name}</label>
                        <input
                            type="date"
                            value={data[name]}
                            onChange={e => setData(name, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            case 'relation':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{field.name}</label>
                        <select
                            value={data[name]}
                            onChange={e => setData(name, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                            <option value="">Select {field.name}...</option>
                            {availableRelationships[name]?.map(item => (
                                <option key={item.id} value={item.id}>{item.label}</option>
                            ))}
                        </select>
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            case 'integer':
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{field.name}</label>
                        <input
                            type="number"
                            value={data[name]}
                            onChange={e => setData(name, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
            default:
                return (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{field.name}</label>
                        <input
                            type="text"
                            value={data[name]}
                            onChange={e => setData(name, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <Link href={route('content-entries.index', slug)} className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit {contentType.name} Entry #{entry.id}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit ${contentType.name}`} />

            <div className="mx-auto m:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 space-y-6 max-w-2xl mx-auto">
                    {contentType.fields.map(field => (
                        <div key={field.id}>
                            {renderField(field)}
                            {errors[field.name.toLowerCase().replace(/\s+/g, '_')] && (
                                <p className="mt-1 text-sm text-red-600">{errors[field.name.toLowerCase().replace(/\s+/g, '_')]}</p>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Update Entry
                        </button>
                    </div>
                </form>
            </div>

            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </AuthenticatedLayout>
    );
}

export default Edit;

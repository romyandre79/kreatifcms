import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, AlertCircle, CheckCircle2, Globe, BarChart3, Type, Settings2 } from 'lucide-react';

export default function Settings({ settings, success }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        google_analytics_id: settings.google_analytics_id || '',
        meta_description: settings.meta_description || '',
        site_name: settings.site_name || '',
        title_separator: settings.title_separator || ' | ',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('seo.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">SEO Settings</h2>
                </div>
            }
        >
            <Head title="SEO Settings" />

            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-100">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Global Identification */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings2 className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Site Identification</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                                        <input
                                            type="text"
                                            value={data.site_name}
                                            onChange={e => setData('site_name', e.target.value)}
                                            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 shadow-sm"
                                            placeholder="My Awesome Site"
                                        />
                                        {errors.site_name && <p className="mt-1 text-xs text-red-600">{errors.site_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title Separator</label>
                                        <input
                                            type="text"
                                            value={data.title_separator}
                                            onChange={e => setData('title_separator', e.target.value)}
                                            className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 shadow-sm"
                                            placeholder=" | "
                                        />
                                        {errors.title_separator && <p className="mt-1 text-xs text-red-600">{errors.title_separator}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Meta Tags */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Type className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Default Meta Tags</h3>
                                </div>
                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Global Meta Description</label>
                                    <textarea
                                        value={data.meta_description}
                                        onChange={e => setData('meta_description', e.target.value)}
                                        rows="4"
                                        className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 shadow-sm"
                                        placeholder="Used when a page doesn't have its own description..."
                                    />
                                    {errors.meta_description && <p className="mt-1 text-xs text-red-600">{errors.meta_description}</p>}
                                    <p className="mt-2 text-xs text-gray-500">Recommended length: 150-160 characters.</p>
                                </div>
                            </section>

                            {/* Analytics */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Analytics & Tracking</h3>
                                </div>
                                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID (G-XXXXXXX)</label>
                                    <input
                                        type="text"
                                        value={data.google_analytics_id}
                                        onChange={e => setData('google_analytics_id', e.target.value)}
                                        className="w-full border-gray-200 rounded-lg focus:ring-indigo-500 shadow-sm"
                                        placeholder="G-XXXXXXXXXX"
                                    />
                                    {errors.google_analytics_id && <p className="mt-1 text-xs text-red-600">{errors.google_analytics_id}</p>}
                                </div>
                            </section>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    {recentlySuccessful && (
                                        <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium animate-in fade-in duration-500">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Settings saved successfully!
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold shadow-md transition-all disabled:opacity-75"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save All Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Globe, Code, AlertTriangle, Play, HelpCircle } from 'lucide-react';

export default function Edit({ api }) {
    const isEditing = !!api.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: api.name || '',
        slug: api.slug || '',
        type: api.type || 'bridge',
        method: api.method || 'GET',
        target_url: api.target_url || '',
        target_method: api.target_method || 'GET',
        headers: api.headers || {},
        payload_mapping: api.payload_mapping || {},
        php_code: api.php_code || "<?php\n\n// Example: Fetch data and return it\n// $response = Http::get('https://api.example.com/data');\n// return $response->json();\n\nreturn ['status' => 'success', 'data' => $params];",
        is_active: api.hasOwnProperty('is_active') ? api.is_active : true,
    });

    const [activeTab, setActiveTab] = useState(data.type);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.general-api.update', api.id));
        } else {
            post(route('admin.general-api.store'));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('admin.general-api.index')} className="text-gray-400 hover:text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {isEditing ? `Edit Endpoint: ${api.name}` : 'Create New API Endpoint'}
                    </h2>
                </div>
            }
        >
            <Head title={isEditing ? 'Edit API' : 'Create API'} />

            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white shadow sm:rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Bank Indonesia Exchange Rate"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                            <div className="mt-1 flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    /api/v1/custom/
                                </span>
                                <input
                                    type="text"
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="bi-exchange-rate"
                                />
                            </div>
                            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Incoming HTTP Method</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                value={data.method}
                                onChange={(e) => setData('method', e.target.value)}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                                <option value="ANY">ANY</option>
                            </select>
                        </div>

                        <div className="flex items-center h-full pt-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <span className="text-sm font-medium text-gray-700">Endpoint is Active</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                type="button"
                                onClick={() => { setActiveTab('bridge'); setData('type', 'bridge'); }}
                                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                                    data.type === 'bridge'
                                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50/30'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Globe size={18} />
                                    <span>API Bridge (Safe)</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setActiveTab('custom'); setData('type', 'custom'); }}
                                className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${
                                    data.type === 'custom'
                                        ? 'border-purple-500 text-purple-600 bg-purple-50/30'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Code size={18} />
                                    <span>Custom PHP Script (Advanced)</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {data.type === 'bridge' ? (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <Globe className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-blue-700">
                                                Bridge mode is high-security. It fetches data from a target URL using official channels. No raw PHP code is executed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target API URL</label>
                                    <input
                                        type="url"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={data.target_url}
                                        onChange={(e) => setData('target_url', e.target.value)}
                                        placeholder="https://api.exchangerate.host/latest"
                                    />
                                    {errors.target_url && <p className="mt-1 text-sm text-red-600">{errors.target_url}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target HTTP Method</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={data.target_method}
                                        onChange={(e) => setData('target_method', e.target.value)}
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <HelpCircle size={16} className="text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">Configuration Note</span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        You can also configure custom <strong>Headers</strong> and <strong>Payload Mapping</strong> using the settings below (coming soon in advanced editor).
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-bold text-amber-800">Security Warning</h3>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Custom PHP mode allows executing raw server-side code. Ensure you trust the logic written here. Avoid using sensitive functions like `shell_exec`.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">PHP Script</label>
                                        <span className="text-xs text-gray-400 font-mono">Available variables: $request, $params, $headers, Http façade</span>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            className="block w-full h-80 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm font-mono p-4 bg-gray-900 text-gray-100"
                                            value={data.php_code}
                                            onChange={(e) => setData('php_code', e.target.value)}
                                            spellCheck="false"
                                        />
                                    </div>
                                    {errors.php_code && <p className="mt-1 text-sm text-red-600">{errors.php_code}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link
                        href={route('admin.general-api.index')}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {processing ? 'Saving...' : 'Save API Endpoint'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}

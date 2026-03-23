import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { Box, CheckCircle, XCircle, Settings, Puzzle, Download, Info, Upload, Trash2 } from 'lucide-react';

export default function Index({ plugins }) {
    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [importing, setImporting] = useState(false);
    const [settingsData, setSettingsData] = useState({});
    const [savingSettings, setSavingSettings] = useState(false);

    const togglePlugin = (plugin) => {
        const action = plugin.enabled ? 'disable' : 'enable';
        router.post(route(`plugins.${action}`, plugin.name), {}, {
            onSuccess: () => {
                window.location.reload();
            }
        });
    };

    const handleOpenSettings = (plugin) => {
        setSettingsData(plugin.values || {});
        setSelectedPlugin(plugin);
    };

    const handleSettingChange = (name, value) => {
        setSettingsData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveSettings = () => {
        setSavingSettings(true);
        router.post(route('plugins.settings.update', selectedPlugin.name), {
            settings: settingsData
        }, {
            onFinish: () => {
                setSavingSettings(false);
                setSelectedPlugin(null);
            }
        });
    };

    const deletePlugin = (plugin) => {
        if (confirm(`Are you sure you want to permanently delete the plugin "${plugin.name}"? This action cannot be undone.`)) {
            router.delete(route('plugins.destroy', plugin.name));
        }
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        router.post(route('plugins.import'), formData, {
            onFinish: () => {
                setImporting(false);
                if (e.target) e.target.value = '';
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Plugin Manager</h2>}
        >
            <Head title="Plugin Manager" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Plugins</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage modular extensions and integrations.</p>
                    </div>
                    <div>
                        <input 
                            type="file" 
                            accept=".zip" 
                            className="hidden" 
                            id="plugin-import"
                            onChange={handleImport}
                        />
                        <button 
                            onClick={() => document.getElementById('plugin-import').click()}
                            disabled={importing}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            <Upload className="w-4 h-4" />
                            {importing ? 'Importing...' : 'Upload Plugin'}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {plugins.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center p-12 h-full">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <Puzzle className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No plugins installed</h3>
                            <p className="mt-2 text-sm text-gray-500 max-w-sm text-center">
                                Modules created using <code>php artisan module:make</code> will appear here automatically.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                            {plugins.map((plugin) => (
                                <div key={plugin.name} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:border-indigo-200 transition-all group">
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className={`p-2 rounded-lg mr-3 ${plugin.enabled ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Box className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{plugin.name}</h3>
                                                    <span className="text-xs text-gray-500 font-mono">v{plugin.version}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {plugin.enabled ? (
                                                    <span className="flex items-center text-green-600 text-xs font-semibold">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-gray-400 text-xs font-semibold">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {plugin.description}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
                                        <button
                                            onClick={() => togglePlugin(plugin)}
                                            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                                plugin.enabled
                                                    ? 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                                                    : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                                            }`}
                                        >
                                            {plugin.enabled ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <a href={route('plugins.export', plugin.name)} className="text-gray-400 hover:text-indigo-600 transition-colors" title="Export Plugin to ZIP">
                                                <Download className="w-5 h-5" />
                                            </a>
                                            <button 
                                                onClick={() => handleOpenSettings(plugin)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                title="Plugin Settings"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => deletePlugin(plugin)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Plugin"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal show={selectedPlugin !== null} onClose={() => setSelectedPlugin(null)} maxWidth="xl">
                {selectedPlugin && (
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                    <Box className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 leading-tight">
                                        {selectedPlugin.name} Settings
                                    </h2>
                                    <p className="text-sm text-gray-500">Version {selectedPlugin.version}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {selectedPlugin.settings && selectedPlugin.settings.length > 0 ? (
                                <div className="space-y-6">
                                    {selectedPlugin.settings.map((setting) => (
                                        <div key={setting.name} className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-gray-700">
                                                {setting.label}
                                            </label>
                                            <div className="relative">
                                                {setting.type === 'select' ? (
                                                    <select
                                                        value={settingsData[setting.name] || setting.default || ''}
                                                        onChange={(e) => handleSettingChange(setting.name, e.target.value)}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                    >
                                                        {setting.options?.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={setting.type === 'password' ? 'password' : (setting.type === 'number' ? 'number' : 'text')}
                                                        value={settingsData[setting.name] || ''}
                                                        onChange={(e) => handleSettingChange(setting.name, e.target.value)}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                                        placeholder={setting.default}
                                                    />
                                                )}
                                            </div>
                                            {setting.description && (
                                                <p className="text-xs text-gray-500">{setting.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-800">
                                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-semibold mb-1">No Configuration Available</p>
                                        <p className="opacity-90">This plugin does not currently register any configurable settings or dynamic UI fields.</p>
                                    </div>
                                </div>
                            )}

                            <div className="border border-gray-100 rounded-xl overflow-hidden mt-6">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                    <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Plugin Details</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 mb-1">Module Alias</span>
                                        <span className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-0.5 rounded">{selectedPlugin.alias}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 mb-1">Local Path</span>
                                        <span className="text-sm font-mono text-gray-800 break-all">{selectedPlugin.path}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold text-gray-400 mb-1">Description</span>
                                        <p className="text-sm text-gray-700 leading-relaxed">{selectedPlugin.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedPlugin(null)}
                                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            {selectedPlugin.settings && selectedPlugin.settings.length > 0 && (
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={savingSettings}
                                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {savingSettings ? 'Saving...' : 'Save Settings'}
                                </button>
                            )}
                            {( !selectedPlugin.settings || selectedPlugin.settings.length === 0 ) && (
                                <button
                                    onClick={() => setSelectedPlugin(null)}
                                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black transition-colors"
                                >
                                    Done
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

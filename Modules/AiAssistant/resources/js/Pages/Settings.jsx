import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Cpu, Activity, Database, Plus, Trash2, Edit2, CheckCircle2,
    AlertCircle, ExternalLink, Key, Globe, Layers, BarChart3, Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Settings({ models, stats, config }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    const safeConfig = config || { providers: [] };
    const safeModels = Array.isArray(models) ? models : [];

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        provider: 'openai',
        model_name: '',
        api_key: '',
        base_url: '',
        is_active: true,
        is_default: false
    });

    const handleFetchModels = async () => {
        if (isFetching) return;
        setIsFetching(true);
        try {
            const res = await axios.post(route('ai.models.fetch'), {
                provider: data.provider,
                api_key: data.api_key,
                base_url: data.base_url
            });
            setAvailableModels(res.data);
            if (res.data.length > 0 && !data.model_name) setData('model_name', res.data[0].id);
        } catch (err) {
            alert("Failed to fetch models. Please check your credentials.");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSetDefault = (id) => {
        post(route('ai.models.default', id));
    };

    const handleStoreModel = (e) => {
        e.preventDefault();
        post(route('ai.models.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                setAvailableModels([]);
                reset();
            }
        });
    };

    const handleUpdateModel = (e) => {
        e.preventDefault();
        put(route('ai.models.update', editingModel.id), {
            onSuccess: () => {
                setEditingModel(null);
                setAvailableModels([]);
                reset();
            }
        });
    };

    const confirmDelete = (id) => {
        if (confirm('Are you sure you want to delete this AI model? All usage history for this model will be lost.')) {
            destroy(route('ai.models.delete', id));
        }
    };

    const openEdit = (model) => {
        setEditingModel(model);
        setAvailableModels([]);
        setData({
            name: model.name,
            provider: model.provider,
            model_name: model.model_name,
            api_key: model.api_key || '',
            base_url: model.base_url || '',
            is_active: model.is_active,
            is_default: !!model.is_default
        });
    };

    // Sub-render in Modal for Model Name field
    const renderModelNameInput = () => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Model Name / ID</span>
                {(data.api_key || data.provider === 'ollama') && (
                    <button
                        type="button"
                        onClick={handleFetchModels}
                        disabled={isFetching}
                        className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 disabled:opacity-50"
                    >
                        {isFetching ? <Activity className="w-3 h-3 animate-spin" /> : <Activity className="w-3 h-3" />}
                        {availableModels.length > 0 ? 'Refetch' : 'Fetch Models'}
                    </button>
                )}
            </label>

            {availableModels.length > 0 ? (
                <select
                    value={data.model_name}
                    onChange={e => setData('model_name', e.target.value)}
                    className="w-full px-4 py-3 bg-indigo-50/50 border-indigo-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-bold text-gray-900"
                >
                    <option value="">Select a model...</option>
                    {availableModels.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            ) : (
                <input
                    type="text" required
                    value={data.model_name} onChange={e => setData('model_name', e.target.value)}
                    placeholder="e.g., gpt-4o or gemini-pro"
                    className="w-full px-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-mono text-gray-900"
                />
            )}
        </div>
    );

    // Prepare chart data from stats
    const chartData = stats ? Object.values(stats) : [];

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">AI Assistant Settings</h2>}
        >
            <Head title="AI Assistant Settings" />

            <div className="py-4 bg-gray-50 min-h-screen">
                <div className="mx-auto px-6 space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                    <Cpu className="w-8 h-8" />
                                </div>
                                AI Configuration
                            </h2>
                            <p className="text-gray-500 mt-2 font-medium max-w-xl">
                                Manage your AI providers, API keys, and model overrides in one centralized place.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { reset(); setShowAddModal(true); }}
                                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-100 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                Add AI Account
                            </button>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-indigo-100 transition-colors">
                            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Global Requests</p>
                                <p className="text-2xl font-black text-gray-900">{chartData.reduce((acc, curr) => acc + (curr.requests || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-green-100 transition-colors">
                            <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Storage & Tokens</p>
                                <p className="text-2xl font-black text-gray-900">{chartData.reduce((acc, curr) => acc + (curr.total_tokens || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:border-purple-100 transition-colors">
                            <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                                <Layers className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Configured Units</p>
                                <p className="text-2xl font-black text-gray-900">{safeModels.filter(m => m.is_active).length} / {safeModels.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Management Area */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

                        {/* Models Table */}
                        <div className="xl:col-span-2 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Account Management</h3>
                                    <p className="text-sm text-gray-400 font-medium">Click on the globe to set a system-wide fallback.</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-colors cursor-help">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
                                        <tr>
                                            <th className="px-8 py-5">Provider & Model</th>
                                            <th className="px-8 py-5">Status</th>
                                            <th className="px-8 py-5">Usage</th>
                                            <th className="px-8 py-5 text-right">Settings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {safeModels.map(model => (
                                            <tr key={model.id} className="hover:bg-indigo-50/20 transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${model.provider === 'openai' ? 'bg-green-50 text-green-600' :
                                                            model.provider === 'gemini' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                                                            }`}>
                                                            {model.is_default && (
                                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center text-white">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                </div>
                                                            )}
                                                            <Cpu className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-black text-gray-900 tracking-tight">{model.name}</p>
                                                                {model.is_default && (
                                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-black rounded-lg uppercase tracking-widest">Default</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                {model.provider} • <span className="font-mono text-[10px] lowercase tracking-normal">{model.model_name}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {model.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-green-100">
                                                            Connected
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black rounded-xl uppercase tracking-widest border border-gray-100">
                                                            Disabled
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-black text-gray-700 leading-none">
                                                            {(stats[model.id]?.total_tokens || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tokens Authored</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        {!model.is_default && (
                                                            <button
                                                                onClick={() => handleSetDefault(model.id)}
                                                                title="Set as Default System Model"
                                                                className="p-3 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-2xl transition-all"
                                                            >
                                                                <Globe className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openEdit(model)}
                                                            className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(model.id)}
                                                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {safeModels.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-24 text-center">
                                                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                            <Cpu className="w-10 h-10" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-gray-900">No Models Configured</p>
                                                            <p className="text-sm text-gray-400 mt-1">Start by adding your first AI provider account to power up your system.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-8">
                            {/* Summary Card */}
                            {chartData.length > 0 && (
                                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                                            Distribution
                                        </h3>
                                    </div>
                                    <div className="h-[300px] w-full mt-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="model_name" hide />
                                                <YAxis hide />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                                    itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="total_tokens" radius={[12, 12, 12, 12]} barSize={40}>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-8 space-y-3">
                                        {chartData.map((entry, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                    <p className="text-xs font-black text-gray-700 uppercase tracking-tight truncate max-w-[120px]">{entry.model_name}</p>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 tracking-widest">{chartData.reduce((a, c) => a + (c.total_tokens || 0), 0) > 0 ? ((entry.total_tokens / chartData.reduce((a, c) => a + (c.total_tokens || 0), 0)) * 100).toFixed(0) : 0}%</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAddModal || editingModel) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingModel ? 'Edit AI Account' : 'New AI Connection'}
                                </h3>
                                <p className="text-sm text-gray-400 font-medium">Configure provider authentication and settings.</p>
                            </div>
                            <button onClick={() => { setShowAddModal(false); setEditingModel(null); }} className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={editingModel ? handleUpdateModel : handleStoreModel} className="p-8 space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Friendly Label</label>
                                    <input
                                        type="text" required
                                        value={data.name} onChange={e => setData('name', e.target.value)}
                                        placeholder="e.g., Marketing Gemini Pro"
                                        className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                                    />
                                    {errors.name && <p className="text-sm text-red-500 font-black mt-1">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Provider Type</label>
                                    <select
                                        value={data.provider}
                                        onChange={e => setData('provider', e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900 appearance-none"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        {(safeConfig.providers || []).map(p => (
                                            <option key={p.value} value={p.value} className="text-gray-900 bg-white py-2">
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-between">
                                        <span>Provider Authentication</span>
                                        {data.provider === 'openai' && <a href="https://platform.openai.com/api-keys" target="_blank" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-black underline decoration-2 underline-offset-4">Get OpenAI Key</a>}
                                        {data.provider === 'gemini' && <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-black underline decoration-2 underline-offset-4">Get Gemini Key</a>}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                            <Key className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="password"
                                            value={data.api_key} onChange={e => setData('api_key', e.target.value)}
                                            placeholder={data.provider === 'ollama' ? 'Leave empty for local' : 'sk-....'}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono text-sm text-gray-900"
                                        />
                                    </div>
                                </div>

                                {data.provider === 'ollama' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Service Endpoint</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={data.base_url} onChange={e => setData('base_url', e.target.value)}
                                                placeholder="http://localhost:11434"
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-mono text-sm font-bold text-gray-900"
                                            />
                                        </div>
                                    </div>
                                )}

                                {renderModelNameInput()}
                            </div>

                            <div className="flex flex-col gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-50">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox" id="is_active"
                                        checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                        className="w-6 h-6 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                                    />
                                    <label htmlFor="is_active" className="text-sm font-black text-gray-700">Enable this connection</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox" id="is_default"
                                        checked={data.is_default} onChange={e => setData('is_default', e.target.checked)}
                                        className="w-6 h-6 rounded-lg border-gray-300 text-yellow-500 focus:ring-yellow-500/20"
                                    />
                                    <label htmlFor="is_default" className="text-sm font-black text-gray-700">Set as System Default</label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button" onClick={() => { setShowAddModal(false); setEditingModel(null); }}
                                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={processing}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? 'Processing...' : editingModel ? 'Update Account' : 'Save Connection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

function X(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}

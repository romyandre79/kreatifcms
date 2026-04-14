import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Globe, Languages, FileText, Plus, Trash2, Edit2, 
    Save, CheckCircle2, AlertCircle, Search, Filter 
} from 'lucide-react';
import { Tab } from '@headlessui/react';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

export default function Index({ languages, translations, documentations }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const filteredTranslations = translations.filter(t => 
        t.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Language & Localization Manager</h2>}
        >
            <Head title="Language Manager" />

            <div className="py-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                                    <Globe className="w-8 h-8" />
                                </div>
                                Localization
                            </h2>
                            <p className="text-gray-500 mt-2 font-medium max-w-xl">
                                Manage your global audience by configuring languages, UI translations, and contextual help documentation.
                            </p>
                        </div>
                    </div>

                    <div className="w-full">
                        <Tab.Group onChange={setActiveTab}>
                            <Tab.List className="flex space-x-2 rounded-[2rem] bg-white p-2 shadow-sm border border-gray-100 mb-8">
                                <Tab className={({ selected }) => classNames(
                                    'w-full rounded-[1.8rem] py-4 text-sm font-black uppercase tracking-widest leading-5 transition-all outline-none',
                                    selected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                )}>
                                    <div className="flex items-center justify-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        <span>Languages</span>
                                    </div>
                                </Tab>
                                <Tab className={({ selected }) => classNames(
                                    'w-full rounded-[1.8rem] py-4 text-sm font-black uppercase tracking-widest leading-5 transition-all outline-none',
                                    selected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                )}>
                                    <div className="flex items-center justify-center gap-2">
                                        <Languages className="w-4 h-4" />
                                        <span>Translations</span>
                                    </div>
                                </Tab>
                                <Tab className={({ selected }) => classNames(
                                    'w-full rounded-[1.8rem] py-4 text-sm font-black uppercase tracking-widest leading-5 transition-all outline-none',
                                    selected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                )}>
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Documentation</span>
                                    </div>
                                </Tab>
                            </Tab.List>

                            <Tab.Panels>
                                {/* Languages Tab */}
                                <Tab.Panel className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <LanguagesSection languages={languages} />
                                </Tab.Panel>

                                {/* Translations Tab */}
                                <Tab.Panel className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <TranslationsSection 
                                        translations={filteredTranslations} 
                                        languages={languages}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                    />
                                </Tab.Panel>

                                {/* Documentation Tab */}
                                <Tab.Panel className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <DocumentationSection documentations={documentations} />
                                </Tab.Panel>
                            </Tab.Panels>
                        </Tab.Group>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function LanguagesSection({ languages }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        id: null,
        code: '',
        name: '',
        flag: '',
        is_active: true,
        is_default: false
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('languages.store'), {
            onSuccess: () => {
                reset();
                setIsEditing(false);
            }
        });
    };

    const handleEdit = (lang) => {
        setData({
            id: lang.id,
            code: lang.code,
            name: lang.name,
            flag: lang.flag,
            is_active: lang.is_active,
            is_default: lang.is_default
        });
        setIsEditing(true);
    };

    const confirmDelete = (id) => {
        if (confirm('Are you sure you want to delete this language and all its translations?')) {
            router.delete(route('languages.destroy', id));
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Language</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Code</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {languages.map((lang) => (
                                <tr key={lang.id} className="group hover:bg-indigo-50/30 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{lang.flag}</span>
                                            <div>
                                                <p className="font-black text-gray-900">{lang.name}</p>
                                                {lang.is_default && <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Default</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-mono font-bold text-gray-500 uppercase">{lang.code}</td>
                                    <td className="px-8 py-6 text-center">
                                        {lang.is_active ? (
                                            <span className="inline-flex px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-green-100">Active</span>
                                        ) : (
                                            <span className="inline-flex px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-gray-100">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(lang)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            {!lang.is_default && (
                                                <button onClick={() => confirmDelete(lang.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-8">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">
                        {isEditing ? 'Edit Language' : 'New Language'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Full Name</label>
                            <input
                                type="text" required
                                value={data.name} onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. English"
                                className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Code (ISO)</label>
                                <input
                                    type="text" required
                                    value={data.code} onChange={e => setData('code', e.target.value)}
                                    placeholder="en"
                                    className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Flag (Emoji)</label>
                                <input
                                    type="text"
                                    value={data.flag} onChange={e => setData('flag', e.target.value)}
                                    placeholder="🇺🇸"
                                    className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-xl"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-50">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox" id="lang_active"
                                    checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                    className="w-6 h-6 rounded-lg border-gray-300 text-indigo-600 focus:ring-indigo-500/20"
                                />
                                <label htmlFor="lang_active" className="text-sm font-black text-gray-700">Set Active</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox" id="lang_default"
                                    checked={data.is_default} onChange={e => setData('is_default', e.target.checked)}
                                    className="w-6 h-6 rounded-lg border-gray-300 text-yellow-500 focus:ring-yellow-500/20"
                                />
                                <label htmlFor="lang_default" className="text-sm font-black text-gray-700">Set Default</label>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            {isEditing && (
                                <button
                                    type="button" onClick={() => { reset(); setIsEditing(false); }}
                                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit" disabled={processing}
                                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
                            >
                                {isEditing ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function TranslationsSection({ translations, languages, searchTerm, setSearchTerm }) {
    const { data, setData, post, processing, reset } = useForm({
        language_code: languages[0]?.code || 'en',
        group: 'ui',
        key: '',
        value: ''
    });

    const [editingId, setEditingId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('languages.translations.store'), {
            onSuccess: () => {
                reset('key', 'value');
                setEditingId(null);
            }
        });
    };

    const handleEdit = (t) => {
        setData({
            language_code: t.language_code,
            group: t.group,
            key: t.key,
            value: t.value
        });
        setEditingId(t.id);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-8">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">
                        {editingId ? 'Edit Translation' : 'New Translation'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Target Language</label>
                            <select
                                value={data.language_code} onChange={e => setData('language_code', e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                            >
                                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Group (context)</label>
                            <input
                                type="text" required
                                value={data.group} onChange={e => setData('group', e.target.value)}
                                placeholder="e.g. menu"
                                className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Unique Key</label>
                            <input
                                type="text" required
                                value={data.key} onChange={e => setData('key', e.target.value)}
                                placeholder="e.g. dashboard"
                                className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Translated Value</label>
                            <textarea
                                required rows={4}
                                value={data.value} onChange={e => setData('value', e.target.value)}
                                placeholder="Dashboard"
                                className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-900 resize-none"
                            />
                        </div>
                        <button
                            type="submit" disabled={processing}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95 mt-4"
                        >
                            {editingId ? 'Update String' : 'Save String'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search by key, group, or value..."
                                className="w-full pl-16 pr-6 py-4 bg-gray-50/50 border-transparent rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-900"
                            />
                        </div>
                        <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:text-indigo-600 transition-all">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Group</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Key</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Lang</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Value</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {translations.map((t) => (
                                    <tr key={t.id} className="group hover:bg-indigo-50/30 transition-all">
                                        <td className="px-8 py-6">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase tracking-widest">{t.group}</span>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-gray-900">{t.key}</td>
                                        <td className="px-8 py-6 font-black text-gray-400 uppercase tracking-widest">{t.language_code}</td>
                                        <td className="px-8 py-6 text-gray-500 max-w-xs truncate">{t.value}</td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => handleEdit(t)} className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-2xl transition-all shadow-sm">
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {translations.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-24 text-center">
                                            <div className="max-w-xs mx-auto text-gray-400">
                                                <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                                <p className="text-lg font-black text-gray-900">No translations found</p>
                                                <p className="text-sm">Try adjusting your search term or create a new string.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocumentationSection({ documentations, languages }) {
    const [view, setView] = useState('list'); // 'list' or 'builder'
    const [editingDoc, setEditingDoc] = useState(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        id: null,
        key: '',
        title: {}, // { en: '', id: '' }
        sections: [], // [ { title: { en: '' }, content: { en: '' } } ]
        dynamic_data: []
    });

    const handleCreate = () => {
        reset();
        // Initialize empty localized titles
        const emptyTitle = {};
        languages.forEach(l => emptyTitle[l.code] = '');
        setData({
            key: '',
            title: emptyTitle,
            sections: [],
            dynamic_data: []
        });
        setView('builder');
    };

    const handleEdit = (doc) => {
        setData({
            id: doc.id,
            key: doc.key,
            title: doc.title || {},
            sections: doc.sections || [],
            dynamic_data: doc.dynamic_data || []
        });
        setEditingDoc(doc);
        setView('builder');
    };

    const addSection = () => {
        const emptyTitle = {};
        const emptyContent = {};
        languages.forEach(l => {
            emptyTitle[l.code] = '';
            emptyContent[l.code] = '';
        });
        
        setData('sections', [
            ...data.sections,
            { title: emptyTitle, content: emptyContent }
        ]);
    };

    const removeSection = (index) => {
        const newSections = [...data.sections];
        newSections.splice(index, 1);
        setData('sections', newSections);
    };

    const updateSection = (index, field, lang, value) => {
        const newSections = [...data.sections];
        if (!newSections[index][field]) newSections[index][field] = {};
        newSections[index][field][lang] = value;
        setData('sections', newSections);
    };

    const updateTitle = (lang, value) => {
        setData('title', { ...data.title, [lang]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('languages.documentation.store'), {
            onSuccess: () => {
                setView('list');
                reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this documentation?')) {
            router.delete(route('languages.documentation.destroy', id));
        }
    };

    if (view === 'builder') {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setView('list')}
                        className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        <Plus className="w-4 h-4 rotate-45" />
                        Back to list
                    </button>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleSubmit}
                            disabled={processing}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Save Documentation
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-500" />
                                Meta Details
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Unique Route Key</label>
                                    <input 
                                        type="text" 
                                        value={data.key}
                                        onChange={e => setData('key', e.target.value)}
                                        placeholder="e.g. pages.index"
                                        className="w-full px-5 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium italic">This key links documentation to a specific page or group.</p>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-gray-50">
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Main Titles</p>
                                    {languages.map(lang => (
                                        <div key={lang.code} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{lang.flag}</span>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang.name} Title</label>
                                            </div>
                                            <input 
                                                type="text"
                                                value={data.title?.[lang.code] || ''}
                                                onChange={e => updateTitle(lang.code, e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200">
                            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2 opacity-80">
                                <AlertCircle className="w-4 h-4" />
                                Pro Tip
                            </h4>
                            <p className="text-sm leading-relaxed opacity-90 font-medium">
                                You can use dynamic placeholders in your content like <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-200">{"{{user.name}}"}</code> to personalize the help experience for your users.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">Content Sections</h3>
                            <button 
                                onClick={addSection}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 hover:bg-indigo-50 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Section
                            </button>
                        </div>

                        <div className="space-y-6">
                            {data.sections.map((section, idx) => (
                                <div key={idx} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden group">
                                    <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs">
                                                {idx + 1}
                                            </div>
                                            <span className="font-black text-xs text-gray-500 uppercase tracking-widest">Documentation Block</span>
                                        </div>
                                        <button 
                                            onClick={() => removeSection(idx)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {languages.map(lang => (
                                            <div key={lang.code} className="space-y-4">
                                                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                                                    <span className="text-sm">{lang.flag}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lang.name} Content</span>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subtitle</label>
                                                        <input 
                                                            type="text"
                                                            value={section.title?.[lang.code] || ''}
                                                            onChange={e => updateSection(idx, 'title', lang.code, e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Main Content</label>
                                                        <textarea 
                                                            rows={6}
                                                            value={section.content?.[lang.code] || ''}
                                                            onChange={e => updateSection(idx, 'content', lang.code, e.target.value)}
                                                            className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {data.sections.length === 0 && (
                                <div className="bg-dashed border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400 font-bold">No sections added yet.</p>
                                    <button 
                                        onClick={addSection}
                                        className="mt-4 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                                    >
                                        Add your first section
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Registered Documentation</h3>
                    <p className="text-gray-500 text-sm font-medium">Contextual help linked to system routes.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    New Documentation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentations.map((doc) => (
                    <div key={doc.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-200 transition-all">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => handleEdit(doc)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900 text-xl tracking-tight line-clamp-1">
                                    {doc.title?.en || doc.key}
                                </h4>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-black text-gray-400 rounded uppercase tracking-widest">Key: {doc.key}</span>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black text-indigo-400 rounded uppercase tracking-widest">{doc.sections?.length || 0} Blocks</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {documentations.length === 0 && (
                    <div className="col-span-full bg-white p-12 rounded-[2.5rem] shadow-sm border border-gray-100 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                            <FileText className="w-10 h-10" />
                        </div>
                        <h4 className="text-xl font-black text-gray-900 mb-2">No Documentation Found</h4>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start creating contextual help documentation for your pages to improve user experience.</p>
                        <button 
                            onClick={handleCreate}
                            className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                        >
                            Create first entry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

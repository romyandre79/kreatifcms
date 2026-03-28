import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Search, 
    Plus, 
    Database, 
    Layers, 
    FileText, 
    ChevronRight,
    Settings,
    MoreVertical,
    Filter
} from 'lucide-react';

export default function DataManager({ contentTypes }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState(null);

    const collectionTypes = useMemo(() => 
        contentTypes.filter(t => t.type === 'collection' || !t.type),
    [contentTypes]);

    const singleTypes = useMemo(() => 
        contentTypes.filter(t => t.type === 'single'),
    [contentTypes]);

    const filteredCollectionTypes = collectionTypes.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredSingleTypes = singleTypes.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Database className="w-4 h-4" />
                    <span>Content Manager</span>
                    {selectedType && (
                        <>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">{selectedType.name}</span>
                        </>
                    )}
                </div>
            }
        >
            <Head title="Content Manager" />

            <div className="flex h-[calc(100vh-160px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Sub-Sidebar */}
                <aside className="w-64 border-r border-gray-200 flex flex-col bg-gray-50/50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search content types..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Collection Types */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Collection Types</h3>
                                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {collectionTypes.length}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {filteredCollectionTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                            selectedType?.id === type.id 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <Layers className={`w-4 h-4 ${selectedType?.id === type.id ? 'text-indigo-200' : 'text-gray-400'}`} />
                                        <span className="truncate flex-1 text-left">{type.name}</span>
                                        {selectedType?.id === type.id && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Single Types */}
                        <div>
                            <div className="flex items-center justify-between mb-2 px-2">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Single Types</h3>
                                <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                    {singleTypes.length}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {filteredSingleTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedType(type)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                                            selectedType?.id === type.id 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <FileText className={`w-4 h-4 ${selectedType?.id === type.id ? 'text-indigo-200' : 'text-gray-400'}`} />
                                        <span className="truncate flex-1 text-left">{type.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <Link 
                            href={route('content-types.index')}
                            className="flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Manage Content Types
                        </Link>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-white">
                    {selectedType ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{selectedType.name}</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedType.type === 'single' ? 'Edit information for this type' : 'View all entries for this collection'}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {selectedType.type !== 'single' ? (
                                        <Link 
                                            href={route('content-entries.create', selectedType.slug)}
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create New Entry
                                        </Link>
                                    ) : (
                                        <button 
                                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                            onClick={() => alert('Save implementation coming in next step')}
                                        >
                                            Save
                                        </button>
                                    )}
                                    <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Form Area */}
                            <div className="flex-1 flex min-h-0 bg-gray-50/30">
                                <div className="flex-1 overflow-y-auto p-8">
                                    <div className="max-w-3xl mx-auto space-y-6">
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">General</h2>
                                            <div className="space-y-6">
                                                {selectedType.fields.map((field) => (
                                                    <div key={field.id} className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                                        <label className="text-sm font-semibold text-gray-700 block">
                                                            {field.name}
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                        </label>
                                                        {field.type === 'longtext' ? (
                                                            <textarea 
                                                                className="w-full px-4 py-2.5 bg-gray-50/50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all min-h-[120px]"
                                                                placeholder={`Enter ${field.name.toLowerCase()}...`}
                                                            />
                                                        ) : (
                                                            <input 
                                                                type={field.type === 'integer' ? 'number' : 'text'}
                                                                className="w-full px-4 py-2.5 bg-gray-50/50 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                                                                placeholder={`Enter ${field.name.toLowerCase()}...`}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                                
                                                {selectedType.fields.length === 0 && (
                                                    <div className="bg-indigo-50 p-4 rounded-lg flex gap-3 text-indigo-700">
                                                        <Database className="w-5 h-5 shrink-0" />
                                                        <p className="text-sm font-medium">This content type has no fields yet. Head over to the Builder to add some!</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center justify-center gap-2 group">
                                            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium">Add a component to blocks</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Entry Sidebar */}
                                <div className="w-80 border-l border-gray-100 bg-white p-6 space-y-8 overflow-y-auto hidden xl:block">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Entry Details</h3>
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Status</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                                    <span className="text-sm font-medium text-gray-700 italic">Draft</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Created</span>
                                                <span className="text-sm font-medium text-gray-700 italic">Today, 2:45 PM</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Actions</h3>
                                        <div className="space-y-2">
                                            <button className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm">
                                                Save
                                            </button>
                                            <button className="w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all">
                                                Discard changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-gray-50/30">
                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-indigo-50/50">
                                <Database className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Select a Content Type</h2>
                            <p className="text-gray-500 max-w-md mt-2">
                                Choose a content type from the left menu to manage its data entries or configure its single type structure.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </AuthenticatedLayout>
    );
}

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Layout, Type, Image as ImageIcon, Grid, 
    Save, ArrowLeft, X
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';

const BLOCK_TYPES = [
    { id: 'hero', name: 'Hero Section', icon: Layout, desc: 'Large title with background and CTA' },
    { id: 'text', name: 'Rich Text', icon: Type, desc: 'Standard text, paragraphs, headings' },
    { id: 'image', name: 'Single Image', icon: ImageIcon, desc: 'A full-width or contained image' },
    { id: 'feature_grid', name: 'Feature Grid', icon: Grid, desc: 'Grid of cards with icons/images' }
];

export default function Builder({ block }) {
    // Data stores the block's internal payload (title, subtitle, etc.)
    const [data, setData] = useState(block.data || {});
    const [name, setName] = useState(block.name);
    
    const [saving, setSaving] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTargetField, setMediaPickerTargetField] = useState(null);

    const typeInfo = BLOCK_TYPES.find(t => t.id === block.type) || BLOCK_TYPES[0];

    // Ensure defaults if empty
    useState(() => {
        if (!block.data || Object.keys(block.data).length === 0) {
            let initialData = {};
            if (block.type === 'hero') {
                initialData = { title: 'Welcome', subtitle: 'Subtitle', bgImage: '', buttonText: 'Click Me', buttonLink: '#' };
            } else if (block.type === 'text') {
                initialData = { content: 'Content...', align: 'left' };
            } else if (block.type === 'image') {
                initialData = { url: '', caption: '' };
            } else if (block.type === 'feature_grid') {
                initialData = { title: 'Features', features: [] };
            }
            setData(initialData);
        }
    });

    const updateData = (field, value) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setSaving(true);
        router.put(route('blocks.update', block.id), {
            name,
            data
        }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    const openMediaPicker = (fieldName) => {
        setMediaPickerTargetField(fieldName);
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (url) => {
        if (mediaPickerTargetField) {
            updateData(mediaPickerTargetField, url);
        }
        setMediaPickerTargetField(null);
    };

    const renderBlockConfig = () => {
        switch (block.type) {
            case 'hero':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Heading</label>
                            <input type="text" value={data.title || ''} onChange={e => updateData('title', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subtitle</label>
                            <textarea value={data.subtitle || ''} onChange={e => updateData('subtitle', e.target.value)} rows="3" className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Background Image</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.bgImage || ''} readOnly placeholder="Select from media library..." className="flex-1 text-sm border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                                <button onClick={() => openMediaPicker('bgImage')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Select</button>
                            </div>
                            {data.bgImage && <div className="mt-3 text-xs text-red-500 cursor-pointer font-semibold hover:text-red-700" onClick={() => updateData('bgImage', '')}>Clear Image</div>}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Text</label>
                                <input type="text" value={data.buttonText || ''} onChange={e => updateData('buttonText', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Button Link</label>
                                <input type="text" value={data.buttonLink || ''} onChange={e => updateData('buttonLink', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                            </div>
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content (Markdown supported)</label>
                            <textarea value={data.content || ''} onChange={e => updateData('content', e.target.value)} rows="16" className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alignment</label>
                            <select value={data.align || 'left'} onChange={e => updateData('align', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image Source</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.url || ''} readOnly placeholder="Select from media library..." className="flex-1 text-sm border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                                <button onClick={() => openMediaPicker('url')} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Browse</button>
                            </div>
                        </div>
                        {data.url && (
                            <div className="aspect-video bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mt-4 p-2 shadow-inner">
                                <img src={data.url} className="w-full h-full object-contain rounded-lg" alt="Preview"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Caption / Alt Text</label>
                            <input type="text" value={data.caption || ''} onChange={e => updateData('caption', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                        </div>
                    </div>
                );
            case 'feature_grid': {
                const features = Array.isArray(data.features) ? data.features : [];
                return (
                    <div className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Title</label>
                            <input type="text" value={data.title || ''} onChange={e => updateData('title', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Features</label>
                                <button 
                                    onClick={() => {
                                        const newFeatures = [...features, { title: 'New Feature', desc: '', iconUrl: '' }];
                                        updateData('features', newFeatures);
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
                                >
                                    + Add Feature
                                </button>
                            </div>
                            <div className="space-y-4">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-white relative group shadow-sm hover:shadow-md transition-shadow">
                                        <button 
                                            onClick={() => {
                                                const newFeatures = features.filter((_, i) => i !== idx);
                                                updateData('features', newFeatures);
                                            }}
                                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                        <input 
                                            type="text" 
                                            value={feature.title || ''} 
                                            onChange={(e) => {
                                                const newFeatures = [...features];
                                                newFeatures[idx] = { ...newFeatures[idx], title: e.target.value };
                                                updateData('features', newFeatures);
                                            }}
                                            placeholder="Feature Title"
                                            className="w-full text-base border-0 border-b-2 border-transparent focus:border-indigo-500 focus:ring-0 px-0 py-1 mb-3 font-bold bg-transparent" 
                                        />
                                        <textarea 
                                            value={feature.desc || ''} 
                                            onChange={(e) => {
                                                const newFeatures = [...features];
                                                newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                                                updateData('features', newFeatures);
                                            }}
                                            rows="3"
                                            placeholder="Feature description..."
                                            className="w-full text-sm border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 mb-2 transition-colors" 
                                        />
                                    </div>
                                ))}
                                {features.length === 0 && (
                                    <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                        No features added to this grid.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <p className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg">No configuration available for this block.</p>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Block Builder: ${block.name}`} />
            
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[calc(100vh-12rem)]">
                    
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.get(route('blocks.index'))} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg transition-colors shadow-sm bg-white border border-gray-200">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                                    Edit Reusable Block
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] rounded-md uppercase tracking-wider font-extrabold flex items-center gap-1">
                                        {typeInfo.icon && <typeInfo.icon className="w-3 h-3" />}
                                        {typeInfo.name}
                                    </span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-64 max-w-sm hidden md:block">
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full text-sm font-semibold border-gray-200 rounded-lg focus:ring-indigo-500 bg-white" 
                                    placeholder="Block Name"
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold shadow-md flex items-center gap-2 transition-all disabled:opacity-75"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Block'}
                            </button>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 p-6 md:p-8 bg-gray-50/30 overflow-y-auto">
                        <div className="max-w-2xl mx-auto">
                            <div className="mb-8 block md:hidden">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Block Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    className="w-full text-sm font-semibold border-gray-300 rounded-lg focus:ring-indigo-500 bg-white shadow-sm" 
                                    placeholder="Block Name"
                                />
                            </div>
                            
                            {renderBlockConfig()}
                        </div>
                    </div>
                </div>
            </div>

            <MediaPickerModal 
                isOpen={mediaPickerOpen} 
                onClose={() => setMediaPickerOpen(false)} 
                onSelect={handleMediaSelect} 
            />
        </AuthenticatedLayout>
    );
}

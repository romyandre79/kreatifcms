import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Layout, Type, Image as ImageIcon, Grid, Layers,
    Plus, Save, ArrowLeft, Trash2, GripVertical, ChevronDown, ChevronRight, X
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';

const BLOCK_TYPES = [
    { id: 'hero', name: 'Hero Section', icon: Layout, desc: 'Large title with background and CTA' },
    { id: 'text', name: 'Rich Text', icon: Type, desc: 'Standard text, paragraphs, headings' },
    { id: 'image', name: 'Single Image', icon: ImageIcon, desc: 'A full-width or contained image' },
    { id: 'feature_grid', name: 'Feature Grid', icon: Grid, desc: 'Grid of cards with icons/images' },
    { id: 'reusable_block', name: 'Saved Block', icon: Layers, desc: 'Insert a pre-designed block from your library' }
];

export default function Builder({ page, reusableBlocks = [] }) {
    const [blocks, setBlocks] = useState(page.blocks || []);
    const [title, setTitle] = useState(page.title);
    const [slug, setSlug] = useState(page.slug);
    const [isPublished, setIsPublished] = useState(page.is_published);
    
    const [activeBlockId, setActiveBlockId] = useState(null);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    // Which field of which block requested the media picker?
    const [mediaPickerTarget, setMediaPickerTarget] = useState(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addBlock = (type) => {
        let newBlock = { id: generateId(), type, data: {} };
        
        // Initial defaults
        if (type === 'hero') {
            newBlock.data = { title: 'Welcome to Doran', subtitle: 'A powerful internal application portal.', bgImage: '', buttonText: 'Get Started', buttonLink: '#' };
        } else if (type === 'text') {
            newBlock.data = { content: 'Enter your text here...', align: 'left' };
        } else if (type === 'image') {
            newBlock.data = { url: '', caption: '' };
        } else if (type === 'feature_grid') {
            newBlock.data = { 
                title: 'Our Features', 
                features: [
                    { title: 'Feature 1', desc: 'Description for feature one', iconUrl: '' },
                    { title: 'Feature 2', desc: 'Description for feature two', iconUrl: '' }
                ] 
            };
        } else if (type === 'reusable_block') {
            newBlock.data = { block_id: '' };
        }

        setBlocks([...blocks, newBlock]);
        setActiveBlockId(newBlock.id);
        setShowBlockMenu(false);
    };

    const updateBlockData = (id, field, value) => {
        setBlocks(blocks.map(b => {
            if (b.id === id) {
                return { ...b, data: { ...b.data, [field]: value } };
            }
            return b;
        }));
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (activeBlockId === id) setActiveBlockId(null);
    };

    const moveBlock = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === blocks.length - 1) return;
        
        const newBlocks = [...blocks];
        const temp = newBlocks[index];
        newBlocks[index] = newBlocks[index + direction];
        newBlocks[index + direction] = temp;
        setBlocks(newBlocks);
    };

    const handleSave = () => {
        setSaving(true);
        router.put(route('pages.update', page.id), {
            title,
            slug,
            is_published: isPublished,
            blocks
        }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    const openMediaPicker = (blockId, fieldName) => {
        setMediaPickerTarget({ blockId, fieldName });
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (url) => {
        if (mediaPickerTarget) {
            updateBlockData(mediaPickerTarget.blockId, mediaPickerTarget.fieldName, url);
        }
        setMediaPickerTarget(null);
    };

    const renderBlockConfig = (block) => {
        const data = block.data || {};
        switch (block.type) {
            case 'hero':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heading</label>
                            <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subtitle</label>
                            <textarea value={data.subtitle || ''} onChange={e => updateBlockData(block.id, 'subtitle', e.target.value)} rows="3" className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Background Image</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.bgImage || ''} readOnly placeholder="Select from media library..." className="flex-1 text-sm border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                <button onClick={() => openMediaPicker(block.id, 'bgImage')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Select</button>
                            </div>
                            {data.bgImage && <div className="mt-2 text-xs text-red-500 cursor-pointer" onClick={() => updateBlockData(block.id, 'bgImage', '')}>Clear Image</div>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                                <input type="text" value={data.buttonText || ''} onChange={e => updateBlockData(block.id, 'buttonText', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Button Link</label>
                                <input type="text" value={data.buttonLink || ''} onChange={e => updateBlockData(block.id, 'buttonLink', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                            </div>
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content (Markdown supported)</label>
                            <textarea value={data.content || ''} onChange={e => updateBlockData(block.id, 'content', e.target.value)} rows="8" className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Alignment</label>
                            <select value={data.align || 'left'} onChange={e => updateBlockData(block.id, 'align', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50">
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image Source</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.url || ''} readOnly placeholder="Select from media library..." className="flex-1 text-sm border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                <button onClick={() => openMediaPicker(block.id, 'url')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Browse</button>
                            </div>
                        </div>
                        {data.url && (
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mt-2">
                                <img src={data.url} className="w-full h-full object-contain" alt="Preview"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Caption / Alt Text</label>
                            <input type="text" value={data.caption || ''} onChange={e => updateBlockData(block.id, 'caption', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                        </div>
                    </div>
                );
            case 'feature_grid': {
                const features = Array.isArray(data.features) ? data.features : [];
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Section Title</label>
                            <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Features</label>
                                <button 
                                    onClick={() => {
                                        const newFeatures = [...features, { title: 'New Feature', desc: '', iconUrl: '' }];
                                        updateBlockData(block.id, 'features', newFeatures);
                                    }}
                                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    + Add Feature
                                </button>
                            </div>
                            <div className="space-y-3">
                                {features.map((feature, idx) => (
                                    <div key={idx} className="p-3 border border-gray-200 rounded-lg bg-white relative group">
                                        <button 
                                            onClick={() => {
                                                const newFeatures = features.filter((_, i) => i !== idx);
                                                updateBlockData(block.id, 'features', newFeatures);
                                            }}
                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                        <input 
                                            type="text" 
                                            value={feature.title || ''} 
                                            onChange={(e) => {
                                                const newFeatures = [...features];
                                                newFeatures[idx] = { ...newFeatures[idx], title: e.target.value };
                                                updateBlockData(block.id, 'features', newFeatures);
                                            }}
                                            placeholder="Feature Title"
                                            className="w-full text-sm border-0 border-b border-gray-200 focus:ring-0 focus:border-indigo-500 px-0 py-1 mb-2 font-semibold" 
                                        />
                                        <textarea 
                                            value={feature.desc || ''} 
                                            onChange={(e) => {
                                                const newFeatures = [...features];
                                                newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                                                updateBlockData(block.id, 'features', newFeatures);
                                            }}
                                            rows="2"
                                            placeholder="Feature description..."
                                            className="w-full text-sm border-gray-200 rounded bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 mb-2" 
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            }
            case 'reusable_block':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Saved Block</label>
                            <select 
                                value={data.block_id || ''} 
                                onChange={e => updateBlockData(block.id, 'block_id', e.target.value)} 
                                className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                            >
                                <option value="">-- Choose a block --</option>
                                {reusableBlocks.map(rb => (
                                    <option key={rb.id} value={rb.id}>{rb.name} ({BLOCK_TYPES.find(t=>t.id===rb.type)?.name})</option>
                                ))}
                            </select>
                        </div>
                        {data.block_id && (
                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center justify-between">
                                <span className="text-xs text-indigo-700 font-semibold">Editing is locked.</span>
                                <a href={`/blocks/${data.block_id}/edit`} target="_blank" className="text-xs text-indigo-600 hover:text-indigo-800 underline">Edit Block</a>
                            </div>
                        )}
                    </div>
                );
            default:
                return <p className="text-gray-500 text-sm">No configuration available for this block.</p>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Builder: ${page.title}`} />
            
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
                {/* Structure Sidebar */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm relative">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                        <button onClick={() => router.get(route('pages.index'))} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight truncate">Page Builder</h2>
                            <p className="text-xs text-indigo-600 font-medium">/{slug}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                            <span>Structure</span>
                            <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{blocks.length}</span>
                        </div>
                        
                        <div className="space-y-2 relative min-h-[50px]">
                            {blocks.length === 0 && (
                                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                    No blocks added.<br/>Click + to add content.
                                </div>
                            )}
                            
                            {blocks.map((block, index) => {
                                const typeInfo = BLOCK_TYPES.find(t => t.id === block.type);
                                const Icon = typeInfo?.icon || Layout;
                                const isActive = activeBlockId === block.id;
                                
                                return (
                                    <div 
                                        key={block.id}
                                        className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${
                                            isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => setActiveBlockId(block.id)}
                                    >
                                        <div className="flex flex-col gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700" disabled={index === 0}>
                                                <ChevronDown className="w-3 h-3 rotate-180" />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700" disabled={index === blocks.length - 1}>
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        <div className={`p-1.5 rounded-md ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className={`text-sm font-medium flex-1 truncate ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                                            {typeInfo?.name || 'Block'}
                                        </span>
                                        
                                        {isActive && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="mt-4 relative">
                            <button 
                                onClick={() => setShowBlockMenu(!showBlockMenu)}
                                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center gap-2 font-medium text-sm transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Block
                            </button>
                            
                            {showBlockMenu && (
                                <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-2 transform origin-bottom animate-in zoom-in-95 duration-100">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2 mt-1">Available Blocks</div>
                                    <div className="space-y-1">
                                        {BLOCK_TYPES.map(type => (
                                            <button 
                                                key={type.id}
                                                onClick={() => addBlock(type.id)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left transition-colors group"
                                            >
                                                <div className="p-2 bg-indigo-50/50 text-indigo-600 rounded-lg group-hover:bg-indigo-100">
                                                    <type.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900">{type.name}</div>
                                                    <div className="text-[10px] text-gray-500">{type.desc}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Page Settings */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Page Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-xs border-gray-200 rounded-md focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                            <select value={isPublished} onChange={e => setIsPublished(e.target.value === 'true')} className="w-full text-xs font-semibold border-gray-200 rounded-md focus:ring-indigo-500 bg-white">
                                <option value="false">Draft (Hidden)</option>
                                <option value="true">Published (Live)</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-75"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Layout'}
                        </button>
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className={`w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300 ${activeBlockId ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                    {activeBlockId && (() => {
                        const activeBlock = blocks.find(b => b.id === activeBlockId);
                        if (!activeBlock) return null;
                        const typeInfo = BLOCK_TYPES.find(t => t.id === activeBlock.type);
                        
                        return (
                            <>
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
                                    <div className="flex items-center gap-2">
                                        {typeInfo?.icon && <typeInfo.icon className="w-4 h-4 text-indigo-600" />}
                                        <h3 className="font-bold text-gray-900 text-sm">{typeInfo?.name || 'Block'} Settings</h3>
                                    </div>
                                    <button onClick={() => setActiveBlockId(null)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5">
                                    {renderBlockConfig(activeBlock)}
                                </div>
                                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                                    <button 
                                        onClick={() => removeBlock(activeBlock.id)}
                                        className="w-full py-2 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove Block
                                    </button>
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Main Preview Workarea (Empty state visualization) */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative flex flex-col items-center">
                     <div className="w-full max-w-5xl absolute inset-0 max-h-screen opacity-10 pointer-events-none" 
                          style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                     
                     <div className="relative w-full max-w-4xl min-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
                        <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-white/60 mx-auto max-w-sm rounded-[4px] border border-gray-200 border-b-0 shadow-sm flex items-center justify-center">
                                    <span className="text-[10px] text-gray-400 font-mono">doran.internal/{slug}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-stretch overflow-hidden">
                            {blocks.length === 0 ? (
                                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                                    <Layout className="w-16 h-16 text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">Live Preview</h3>
                                    <p className="text-sm text-gray-400 mt-2 max-w-md">Add content blocks from the sidebar to visualize them here in real-time.</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto w-full">
                                    {/* Isolate styling with pointer-events-none if we don't want them clicking links in preview */}
                                    <div className="w-full h-full pointer-events-none origin-top">
                                        <DynamicPageRenderer blocks={blocks} reusableBlocks={reusableBlocks} />
                                    </div>
                                </div>
                            )}
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

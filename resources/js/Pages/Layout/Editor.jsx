import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
    Layout as LayoutIcon, Type, Image as ImageIcon, Grid, Layers,
    Plus, Save, ArrowLeft, Trash2, GripVertical, ChevronDown, ChevronRight, X,
    Monitor, LayoutTemplate, Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, Palette,
    Menu, Globe
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';
import MarkdownToolbar from '@/Components/MarkdownToolbar';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';



export default function LayoutEditor({ headerBlocks = [], footerBlocks = [], reusableBlocks = [], contentTypes = [] }) {
    const { plugins = [] } = usePage().props;
    const blockPlugins = plugins.filter(p => p.type === 'block');
    const BLOCK_TYPES = blockPlugins.map(p => {
        const IconComponent = p.meta?.icon ? LucideIcons[p.meta.icon] || LucideIcons.LayoutGrid : LucideIcons.LayoutGrid;
        return {
            id: p.meta?.id || p.alias,
            name: p.meta?.name || p.name,
            icon: IconComponent,
            desc: p.meta?.desc || p.description || ''
        };
    });

    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    // Ensure all blocks have an ID (for backward compatibility)
    const ensureIds = (blockArr) => {
        if (!Array.isArray(blockArr)) return [];
        return blockArr.map(b => b.id ? b : { ...b, id: generateId() });
    };

    const initialHeader = ensureIds(headerBlocks);
    const initialFooter = ensureIds(footerBlocks);

    const [activeTab, setActiveTab] = useState('header'); // 'header' or 'footer'
    const [blocks, setBlocks] = useState(activeTab === 'header' ? initialHeader : initialFooter);
    
    const [headerData, setHeaderData] = useState(initialHeader);
    const [footerData, setFooterData] = useState(initialFooter);

    const [activeBlockId, setActiveBlockId] = useState(null);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTarget, setMediaPickerTarget] = useState(null);

    const switchTab = (tab) => {
        // Save current blocks to the respective temporary state
        if (activeTab === 'header') setHeaderData(blocks);
        else setFooterData(blocks);

        setActiveTab(tab);
        setBlocks(tab === 'header' ? headerData : footerData);
        setActiveBlockId(null);
    };

    const addBlock = (type) => {
        let newBlock = { id: generateId(), type, data: {} };
        if (type === 'hero') {
            newBlock.data = { title: 'New Layout Block', subtitle: '', bgImage: '', buttonText: '', buttonLink: '#' };
        } else if (type === 'text') {
            newBlock.data = { content: '...', align: 'left' };
        } else if (type === 'image') {
            newBlock.data = { url: '', caption: '' };
        } else if (type === 'feature_grid') {
            newBlock.data = { title: '', features: [] };
        } else if (type === 'navbar') {
            newBlock.data = { 
                logo: '', 
                links: [{ id: generateId(), label: 'Home', url: '/' }], 
                buttons: [
                    { id: generateId(), label: 'Login', url: '/login', style: 'ghost' },
                    { id: generateId(), label: 'Get Started', url: '#', style: 'primary' }
                ],
                sticky: true, 
                glass: true 
            };
        } else if (type === 'content_list') {
            newBlock.data = {
                content_type: '',
                limit: 3,
                sort_by: 'created_at',
                sort_dir: 'desc',
                layout_style: 'grid',
                mapping: { title: '', description: '', image: '', link_prefix: '/content/' }
            };
        } else if (type === 'slideshow') {
            newBlock.data = {
                source: 'manual',
                items: [{ id: generateId(), image: '', title: '', link: '' }],
                config: { autoPlay: true, interval: 5000, showArrows: true, showDots: true }
            };
        } else if (type === 'reusable_block') {
            newBlock.data = { block_id: '' };
        }

        const updatedBlocks = [...blocks, newBlock];
        setBlocks(updatedBlocks);
        setActiveBlockId(newBlock.id);
        setShowBlockMenu(false);
    };

    const updateBlockData = (id, field, value) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleNestedDragEnd = (blockId, field, event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setBlocks((prevBlocks) => prevBlocks.map(block => {
                if (block.id === blockId) {
                    const items = [...(block.data[field] || [])];
                    const getItemId = (item, idx) => item.id || `item-${idx}`;
                    const oldIndex = items.findIndex((item, idx) => getItemId(item, idx) === active.id);
                    const newIndex = items.findIndex((item, idx) => getItemId(item, idx) === over.id);
                    if (oldIndex !== -1 && newIndex !== -1) {
                        return {
                            ...block,
                            data: {
                                ...block.data,
                                [field]: arrayMove(items, oldIndex, newIndex)
                            }
                        };
                    }
                }
                return block;
            }));
        }
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (activeBlockId === id) setActiveBlockId(null);
    };


    const handleSave = () => {
        setSaving(true);
        // Sync final states
        const finalHeader = activeTab === 'header' ? blocks : headerData;
        const finalFooter = activeTab === 'footer' ? blocks : footerData;

        router.post(route('layouts.update'), {
            header: finalHeader,
            footer: finalFooter
        }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
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
            case 'navbar': {
                const links = Array.isArray(data.links) ? data.links : [];
                const buttons = data.buttons !== undefined ? (Array.isArray(data.buttons) ? data.buttons : []) : [ { id: 'btn-1', label: 'Login', url: '/login', style: 'ghost' }, { id: 'btn-2', label: 'Get Started', url: '#', style: 'primary' } ];
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Navbar Logo</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
                                <button onClick={() => { setMediaPickerTarget({ blockId: block.id, fieldName: 'logo' }); setMediaPickerOpen(true); }} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">Browse</button>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Items</label>
                                <button
                                    onClick={() => {
                                        const newLinks = [...links, { id: generateId(), label: 'New Link', url: '#' }];
                                        updateBlockData(block.id, 'links', newLinks);
                                    }}
                                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                                >
                                    + ADD LINK
                                </button>
                            </div>
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'links', e)}>
                                    <SortableContext items={links.map((l, idx) => l.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {links.map((link, idx) => {
                                            const linkId = link.id || `item-${idx}`;
                                            return (
                                            <SortableNestedItem key={linkId} id={linkId}>
                                                <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 group relative flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newLinks = links.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={link.label || ''}
                                                        onChange={(e) => {
                                                            const newLinks = [...links];
                                                            newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        placeholder="Link Label"
                                                        className="w-full text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0 mb-1"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={link.url || ''}
                                                        onChange={(e) => {
                                                            const newLinks = [...links];
                                                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        placeholder="URL (e.g. /about or #)"
                                                        className="w-full text-[10px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0"
                                                    />
                                                </div>
                                            </SortableNestedItem>
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        {/* CTA Buttons Config */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">CTA Buttons</label>
                                <button
                                    onClick={() => {
                                        const newButtons = [...buttons, { id: generateId(), label: 'New Button', url: '#', style: 'primary' }];
                                        updateBlockData(block.id, 'buttons', newButtons);
                                    }}
                                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                                >
                                    + ADD BUTTON
                                </button>
                            </div>
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'buttons', e)}>
                                    <SortableContext items={buttons.map((b, idx) => b.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {buttons.map((btn, idx) => {
                                            const btnId = btn.id || `item-${idx}`;
                                            return (
                                            <SortableNestedItem key={btnId} id={btnId}>
                                                <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 group relative flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newButtons = buttons.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'buttons', newButtons);
                                                        }}
                                                        className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                    <div className="flex gap-2 mb-1">
                                                        <input
                                                            type="text"
                                                            value={btn.label || ''}
                                                            onChange={(e) => {
                                                                const newButtons = [...buttons];
                                                                newButtons[idx] = { ...newButtons[idx], label: e.target.value };
                                                                updateBlockData(block.id, 'buttons', newButtons);
                                                            }}
                                                            placeholder="Button Label"
                                                            className="flex-1 text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0"
                                                        />
                                                        <select
                                                            value={btn.style || 'primary'}
                                                            onChange={(e) => {
                                                                const newButtons = [...buttons];
                                                                newButtons[idx] = { ...newButtons[idx], style: e.target.value };
                                                                updateBlockData(block.id, 'buttons', newButtons);
                                                            }}
                                                            className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-transparent border-transparent p-0 pr-4 focus:ring-0"
                                                        >
                                                            <option value="primary">Primary</option>
                                                            <option value="ghost">Ghost</option>
                                                        </select>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={btn.url || ''}
                                                        onChange={(e) => {
                                                            const newButtons = [...buttons];
                                                            newButtons[idx] = { ...newButtons[idx], url: e.target.value };
                                                            updateBlockData(block.id, 'buttons', newButtons);
                                                        }}
                                                        placeholder="URL (e.g. /login or #)"
                                                        className="w-full text-[10px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0 mb-2"
                                                    />

                                                    {/* Advanced Button Properties */}
                                                    <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-3">
                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Visibility</label>
                                                            <select
                                                                value={btn.visibility || 'always'}
                                                                onChange={(e) => {
                                                                    const newButtons = [...buttons];
                                                                    newButtons[idx] = { ...newButtons[idx], visibility: e.target.value };
                                                                    updateBlockData(block.id, 'buttons', newButtons);
                                                                }}
                                                                className="w-full text-[10px] py-1 border-gray-200 rounded focus:ring-indigo-500"
                                                            >
                                                                <option value="always">Always Visible</option>
                                                                <option value="guest">Guest Only (Not Logged In)</option>
                                                                <option value="auth">Authenticated Only</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 mt-2">Custom CSS</label>
                                                            <textarea
                                                                value={btn.custom_css || ''}
                                                                onChange={(e) => {
                                                                    const newButtons = [...buttons];
                                                                    newButtons[idx] = { ...newButtons[idx], custom_css: e.target.value };
                                                                    updateBlockData(block.id, 'buttons', newButtons);
                                                                }}
                                                                placeholder="e.g. background-color: #ff0000; border-radius: 20px;"
                                                                rows="2"
                                                                className="w-full text-[10px] font-mono border-gray-200 rounded bg-gray-50 focus:ring-indigo-500"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 mt-2">Custom JS (onClick)</label>
                                                            <textarea
                                                                value={btn.events?.onClick || ''}
                                                                onChange={(e) => {
                                                                    const newButtons = [...buttons];
                                                                    newButtons[idx] = { ...newButtons[idx], events: { ...(newButtons[idx].events || {}), onClick: e.target.value } };
                                                                    updateBlockData(block.id, 'buttons', newButtons);
                                                                }}
                                                                placeholder="e.g. router.post('/logout')"
                                                                rows="2"
                                                                className="w-full text-[10px] font-mono border-gray-200 rounded bg-gray-50 focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </SortableNestedItem>
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${data.sticky !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.sticky !== false ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.sticky !== false} onChange={e => updateBlockData(block.id, 'sticky', e.target.checked)} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sticky</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${data.glass !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.glass !== false ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.glass !== false} onChange={e => updateBlockData(block.id, 'glass', e.target.checked)} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Blur</span>
                            </label>
                        </div>
                    </div>
                );
            }
            case 'content_list': {
                const selectedType = contentTypes.find(ct => ct.slug === data.content_type);
                const fields = selectedType ? selectedType.fields : [];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content Type</label>
                                <select value={data.content_type || ''} onChange={e => updateBlockData(block.id, 'content_type', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                    <option value="">Select Content Type...</option>
                                    {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Layout</label>
                                <select value={data.layout_style || 'grid'} onChange={e => updateBlockData(block.id, 'layout_style', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                    <option value="grid">Grid View</option>
                                    <option value="list">List View</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Items</label>
                                <input type="number" min="1" max="100" value={data.limit || 3} onChange={e => updateBlockData(block.id, 'limit', parseInt(e.target.value))} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
                                <select value={data.sort_by || 'created_at'} onChange={e => updateBlockData(block.id, 'sort_by', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                    <option value="created_at">Creation Date</option>
                                    <option value="updated_at">Last Updated</option>
                                    <option value="id">ID</option>
                                    <optgroup label="Custom Fields">
                                        {fields.map(f => { const fn = f.name.toLowerCase().replace(/ /g, '_'); return <option key={'sort_'+f.id} value={fn}>{f.name}</option>; })}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Direction</label>
                                <select value={data.sort_dir || 'desc'} onChange={e => updateBlockData(block.id, 'sort_dir', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                    <option value="desc">Latest First</option>
                                    <option value="asc">Oldest First</option>
                                </select>
                            </div>
                        </div>
                        {data.content_type && (
                            <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Field Mapping</h4>
                                <div className="space-y-3">
                                    {['title', 'description', 'image'].map(slot => (
                                        <div key={slot} className="flex items-center gap-3">
                                            <label className="w-1/3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Card {slot}</label>
                                            <select
                                                value={data.mapping?.[slot] || ''}
                                                onChange={e => { const mapping = { ...(data.mapping || {}), [slot]: e.target.value }; updateBlockData(block.id, 'mapping', mapping); }}
                                                className="flex-1 text-xs border-gray-200 rounded-lg bg-white focus:ring-indigo-500"
                                            >
                                                <option value="">-- None --</option>
                                                {(slot === 'image' ? fields : fields.filter(f => ['text','longtext','string'].includes(f.type))).map(f => {
                                                    const fn = f.name.toLowerCase().replace(/ /g, '_');
                                                    return <option key={`m_${slot}_${f.id}`} value={fn}>{f.name}</option>;
                                                })}
                                            </select>
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-3">
                                        <label className="w-1/3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Link Prefix</label>
                                        <input type="text" value={data.mapping?.link_prefix || '/content/'} onChange={e => { const mapping = { ...(data.mapping || {}), link_prefix: e.target.value }; updateBlockData(block.id, 'mapping', mapping); }} className="flex-1 text-xs border-gray-200 rounded-lg bg-white focus:ring-indigo-500" placeholder="/content/slug/" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
            case 'hero':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Heading</label>
                            <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subtitle</label>
                            <textarea value={data.subtitle || ''} onChange={e => updateBlockData(block.id, 'subtitle', e.target.value)} rows="2" className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.bgImage || ''} readOnly className="flex-1 text-sm border-gray-200 rounded-lg bg-gray-100 text-gray-400" />
                                <button onClick={() => { setMediaPickerTarget({ blockId: block.id, fieldName: 'bgImage' }); setMediaPickerOpen(true); }} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50">Select</button>
                            </div>
                        </div>
                    </div>
                );
            case 'text':
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Content Editor</label>
                            <MarkdownToolbar 
                                onInsert={(syntax) => {
                                    const textarea = document.getElementById(`text-editor-${block.id}`);
                                    if (!textarea) return;
                                    const start = textarea.selectionStart;
                                    const end = textarea.selectionEnd;
                                    const text = textarea.value;
                                    const before = text.substring(0, start);
                                    const selected = text.substring(start, end);
                                    const after = text.substring(end);
                                    
                                    let replacement = '';
                                    if (syntax === 'bold') replacement = `**${selected}**`;
                                    else if (syntax === 'italic') replacement = `*${selected}*`;
                                    else if (syntax === 'link') replacement = `[${selected}](https://)`;
                                    else if (syntax === 'list') replacement = `\n- ${selected}`;
                                    else if (syntax === 'h1') replacement = `\n# ${selected}`;
                                    else if (syntax === 'h2') replacement = `\n## ${selected}`;

                                    const newValue = before + replacement + after;
                                    updateBlockData(block.id, 'content', newValue);
                                    
                                    setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start + 2, start + 2 + selected.length);
                                    }, 10);
                                }}
                            />
                            <textarea 
                                id={`text-editor-${block.id}`}
                                value={data.content || ''} 
                                onChange={e => updateBlockData(block.id, 'content', e.target.value)} 
                                rows="10" 
                                className="w-full text-sm border-gray-200 rounded-b-xl focus:ring-0 focus:border-gray-200 bg-gray-50 font-mono p-4 resize-y border-t-0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> Alignment</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {['left', 'center', 'right'].map(align => (
                                        <button
                                            key={align}
                                            onClick={() => updateBlockData(block.id, 'align', align)}
                                            className={`flex-1 py-1.5 rounded-md flex items-center justify-center transition-all ${data.align === align || (!data.align && align === 'left') ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                            {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                            {align === 'right' && <AlignRight className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Palette className="w-3 h-3" /> Colors</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <input 
                                            type="color" 
                                            value={data.backgroundColor || '#ffffff'} 
                                            onChange={e => updateBlockData(block.id, 'backgroundColor', e.target.value)}
                                            className="w-full h-8 p-0.5 rounded-lg border-gray-200 cursor-pointer"
                                            title="Background Color"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="color" 
                                            value={data.textColor || '#111827'} 
                                            onChange={e => updateBlockData(block.id, 'textColor', e.target.value)}
                                            className="w-full h-8 p-0.5 rounded-lg border-gray-200 cursor-pointer"
                                            title="Text Color"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Vertical Spacing (px)</label>
                                <input 
                                    type="number" 
                                    value={data.paddingY || 64} 
                                    onChange={e => updateBlockData(block.id, 'paddingY', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Border Radius (px)</label>
                                <input 
                                    type="number" 
                                    value={data.borderRadius || 0} 
                                    onChange={e => updateBlockData(block.id, 'borderRadius', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'slideshow': {
                const source = data.source || 'manual';
                const items = Array.isArray(data.items) ? data.items : [];
                const config = data.config || { autoPlay: true, interval: 5000, showArrows: true, showDots: true };
                const selectedType = contentTypes.find(ct => ct.slug === data.content_type);
                const fields = selectedType ? selectedType.fields : [];

                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content Source</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['manual', 'dynamic'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateBlockData(block.id, 'source', s)}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${source === s ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {source === 'manual' ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Items</label>
                                    <button
                                        onClick={() => {
                                            const newItems = [...items, { id: generateId(), image: '', title: '', link: '' }];
                                            updateBlockData(block.id, 'items', newItems);
                                        }}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                                    >
                                        + ADD SLIDE
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={item.id || idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                            <button
                                                onClick={() => {
                                                    const newItems = items.filter((_, i) => i !== idx);
                                                    updateBlockData(block.id, 'items', newItems);
                                                }}
                                                className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 relative">
                                                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon className="w-4 h-4" /></div>}
                                                    <button onClick={() => { setMediaPickerTarget({ blockId: block.id, fieldName: `items.${idx}.image` }); setMediaPickerOpen(true); }} className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[8px] font-bold">SET</button>
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <input type="text" value={item.title || ''} onChange={e => { const newItems = [...items]; newItems[idx] = { ...newItems[idx], title: e.target.value }; updateBlockData(block.id, 'items', newItems); }} placeholder="Title" className="w-full text-[10px] border-transparent bg-transparent focus:ring-0 font-bold p-0" />
                                                    <input type="text" value={item.link || ''} onChange={e => { const newItems = [...items]; newItems[idx] = { ...newItems[idx], link: e.target.value }; updateBlockData(block.id, 'items', newItems); }} placeholder="Link" className="w-full text-[9px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content Type</label>
                                    <select value={data.content_type || ''} onChange={e => updateBlockData(block.id, 'content_type', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50">
                                        <option value="">Select...</option>
                                        {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                                    </select>
                                </div>
                                {data.content_type && (
                                    <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mapping</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 w-12">Image</span>
                                            <select value={data.mapping?.image || ''} onChange={e => { const mapping = { ...(data.mapping || {}), image: e.target.value }; updateBlockData(block.id, 'mapping', mapping); }} className="flex-1 text-[10px] border-gray-100 rounded bg-white">
                                                <option value="">-- Choose --</option>
                                                {fields.map(f => <option key={'s_img_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 w-12">Title</span>
                                            <select value={data.mapping?.title || ''} onChange={e => { const mapping = { ...(data.mapping || {}), title: e.target.value }; updateBlockData(block.id, 'mapping', mapping); }} className="flex-1 text-[10px] border-gray-100 rounded bg-white">
                                                <option value="">-- None --</option>
                                                {fields.filter(f => ['text', 'string'].includes(f.type)).map(f => <option key={'s_title_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 w-12">Link</span>
                                            <select value={data.mapping?.link || ''} onChange={e => { const mapping = { ...(data.mapping || {}), link: e.target.value }; updateBlockData(block.id, 'mapping', mapping); }} className="flex-1 text-[10px] border-gray-100 rounded bg-white">
                                                <option value="">-- None --</option>
                                                {fields.map(f => <option key={'s_link_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2 space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Autoplay</label>
                                <input type="checkbox" checked={config.autoPlay !== false} onChange={e => updateBlockData(block.id, 'config', { ...config, autoPlay: e.target.checked })} className="rounded text-indigo-600 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Custom CSS</label>
                                <textarea value={data.customCss || ''} onChange={e => updateBlockData(block.id, 'customCss', e.target.value)} rows="3" className="w-full text-[10px] font-mono border-gray-100 rounded bg-gray-50 p-2" placeholder=".slideshow { ... }" />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'reusable_block':
                return (
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Select Reusable Block</label>
                        <select
                            value={data.block_id || ''}
                            onChange={e => updateBlockData(block.id, 'block_id', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50"
                        >
                            <option value="">-- Choose --</option>
                            {reusableBlocks.map(rb => (
                                <option key={rb.id} value={rb.id}>{rb.name}</option>
                            ))}
                        </select>
                    </div>
                );
            case 'feature_grid': {
                const features = Array.isArray(data.features) ? data.features : [];
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Grid Title</label>
                            <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Features</label>
                                <button
                                    onClick={() => {
                                        const newFeatures = [...features, { id: generateId(), title: 'New Feature', desc: '', iconUrl: '' }];
                                        updateBlockData(block.id, 'features', newFeatures);
                                    }}
                                    className="text-[10px] text-indigo-600 font-bold hover:underline"
                                >
                                    + ADD FEATURE
                                </button>
                            </div>
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'features', e)}>
                                    <SortableContext items={features.map((f, idx) => f.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {features.map((feature, idx) => {
                                            const featureId = feature.id || `item-${idx}`;
                                            return (
                                            <SortableNestedItem key={featureId} id={featureId}>
                                                <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 group relative flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newFeatures = features.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'features', newFeatures);
                                                        }}
                                                        className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-gray-100 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-3 h-3" />
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
                                                        className="w-full text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0 mb-1"
                                                    />
                                                    <textarea
                                                        value={feature.desc || ''}
                                                        onChange={(e) => {
                                                            const newFeatures = [...features];
                                                            newFeatures[idx] = { ...newFeatures[idx], desc: e.target.value };
                                                            updateBlockData(block.id, 'features', newFeatures);
                                                        }}
                                                        placeholder="Description..."
                                                        rows="2"
                                                        className="w-full text-[10px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0 resize-none"
                                                    />
                                                </div>
                                            </SortableNestedItem>
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <p className="text-gray-400 text-xs italic">Configuration coming soon for this type.</p>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Global Layout Editor" />

            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
                {/* Sidebar */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm relative">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-bold text-gray-900 leading-tight">Layout Editor</h2>
                        <div className="mt-3 flex gap-1 p-1 bg-gray-100 rounded-xl">
                            <button 
                                onClick={() => switchTab('header')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'header' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Header
                            </button>
                            <button 
                                onClick={() => switchTab('footer')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'footer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Footer
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Structure: {activeTab.toUpperCase()}
                        </div>

                        <div className="space-y-2">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={blocks.map(b => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {blocks.map((block, index) => (
                                        <SortableBlockItem
                                            key={block.id}
                                            block={block}
                                            index={index}
                                            isActive={activeBlockId === block.id}
                                            onClick={() => setActiveBlockId(block.id)}
                                            onRemove={() => removeBlock(block.id)}
                                            blockTypes={BLOCK_TYPES}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>

                            {blocks.length === 0 && (
                                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                    No blocks added to global {activeTab}.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowBlockMenu(true)}
                            className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add to {activeTab}
                        </button>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Layout'}
                        </button>
                    </div>
                </div>

                {/* Config Panel */}
                <div className={`w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.1)] transition-transform duration-300 ${activeBlockId ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>
                    {activeBlockId && (() => {
                        const activeBlock = blocks.find(b => b.id === activeBlockId);
                        if (!activeBlock) return null;
                        const typeInfo = BLOCK_TYPES.find(t => t.id === activeBlock.type);
                        return (
                            <>
                                <div className="p-4 border-b border-gray-100 bg-indigo-50/30 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-sm">{typeInfo?.name} Settings</h3>
                                    <button onClick={() => setActiveBlockId(null)}><X className="w-4 h-4 text-gray-400" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5">
                                    {renderBlockConfig(activeBlock)}
                                </div>
                            </>
                        );
                    })()}
                </div>

                {/* Preview */}
                <div className="flex-1 overflow-y-auto p-12 bg-gray-100 flex flex-col items-center">
                    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 min-h-[600px] flex flex-col">
                        <div className="bg-gray-50 border-b p-3 flex items-center gap-2 px-6">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 text-center text-[10px] text-gray-400 font-mono">Global {activeTab} Preview</div>
                        </div>

                        <div className="flex-1 relative overflow-y-auto p-8">
                             {/* The actual preview would render Header or Footer */}
                             <div className="opacity-50 pointer-events-none">
                                <DynamicPageRenderer blocks={blocks} reusableBlocks={reusableBlocks} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <BlockPickerModal
                isOpen={showBlockMenu}
                onClose={() => setShowBlockMenu(false)}
                onSelect={addBlock}
                blockTypes={BLOCK_TYPES}
            />

            <MediaPickerModal
                isOpen={mediaPickerOpen}
                onClose={() => setMediaPickerOpen(false)}
                onSelect={handleMediaSelect}
            />
        </AuthenticatedLayout>
    );
}

function BlockPickerModal({ isOpen, onClose, onSelect, blockTypes = [] }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Available Components</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto px-6 pb-6">
                    {blockTypes.map(type => (
                        <button key={type.id} onClick={() => { onSelect(type.id); onClose(); }} className="flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-2xl text-left border border-transparent hover:border-indigo-100 group transition-all">
                            <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><type.icon className="w-6 h-6" /></div>
                            <div>
                                <div className="text-base font-bold text-gray-900">{type.name}</div>
                                <div className="text-sm text-gray-500">{type.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function SortableBlockItem({ block, isActive, onClick, onRemove, blockTypes = [] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : (isActive ? 10 : 1),
        position: 'relative'
    };

    const typeInfo = blockTypes.find(t => t.id === block.type);
    const Icon = typeInfo?.icon || LayoutIcon;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isDragging ? 'opacity-50 scale-95 shadow-xl bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'}`}
            onClick={onClick}
        >
            <div 
                {...attributes} 
                {...listeners} 
                className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <span className={`text-sm font-bold flex-1 truncate ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                {typeInfo?.name || 'Block'}
            </span>
            {isActive && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }} 
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
}

function SortableNestedItem({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 ${isDragging ? 'opacity-50 scale-95' : ''}`}
        >
            <div 
                {...attributes} 
                {...listeners} 
                className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="w-3.5 h-3.5" />
            </div>
            {children}
        </div>
    );
}

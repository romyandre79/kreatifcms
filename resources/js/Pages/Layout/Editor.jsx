import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
    Layout as LayoutIcon, Type, Image as ImageIcon, Grid, Layers,
    Plus, Save, ArrowLeft, Trash2, GripVertical, ChevronUp, ChevronDown, ChevronRight, X,
    Monitor, LayoutTemplate, Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, Palette,
    Menu, Globe
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';
import MarkdownToolbar from '@/Components/MarkdownToolbar';
import {
    DndContext,
    closestCenter,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';



export default function LayoutEditor({ headerBlocks = [], footerBlocks = [], themeData = {}, reusableBlocks = [], contentTypes = [] }) {
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
    const [theme, setTheme] = useState(themeData);

    const [activeBlockId, setActiveBlockId] = useState(null);
    const [showBlockMenu, setShowBlockMenu] = useState(false);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
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
        else if (activeTab === 'footer') setFooterData(blocks);

        setActiveTab(tab);
        if (tab === 'header') setBlocks(headerData);
        else if (tab === 'footer') setBlocks(footerData);
        else setBlocks([]); // Clear blocks for theme tab
        
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
                    { id: generateId(), label: 'Login', url: '/login', style: 'ghost', visibility: 'guest' },
                    { id: generateId(), label: 'Get Started', url: '#', style: 'primary' }
                ],
                social_links: [],
                composition: ['links', 'buttons', 'social_links'],
                sticky: true, 
                glass: true 
            };
        } else if (type === 'social_media') {
            newBlock.data = {
                links: [
                    { id: generateId(), icon: 'Facebook', url: '#' },
                    { id: generateId(), icon: 'Instagram', url: '#' },
                    { id: generateId(), icon: 'Twitter', url: '#' }
                ],
                style: 'circular',
                size: 'md',
                alignment: 'center',
                backgroundColor: '#ffffff',
                iconColor: '#4f46e5'
            };
        } else if (type === 'timeline') {
            newBlock.data = {
                source: 'manual',
                layout: 'vertical',
                style: 'modern',
                alignment: 'alternating',
                content_type: '',
                limit: 5,
                sort_by: 'created_at',
                sort_dir: 'desc',
                mapping: {
                    title: 'title',
                    date: 'created_at',
                    content: 'content',
                    image: 'image',
                    icon: 'icon',
                    color: 'color'
                },
                items: [
                    { id: generateId(), title: 'Initial Step', date: '2021', content: 'Description here', image: '', icon: 'Flag', color: '#4f46e5' },
                    { id: generateId(), title: 'Growth Phase', date: '2023', content: 'More progress', image: '', icon: 'TrendingUp', color: '#10b981' }
                ]
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
        const newBlocks = blocks.map(b => b.id === id ? { ...b, data: { ...b.data, [field]: value } } : b);
        setBlocks(newBlocks);
        // Sync with parent data immediately to ensure preview/sidebar stay in sync.
        if (activeTab === 'header') setHeaderData(newBlocks);
        else setFooterData(newBlocks);
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
                    const getItemId = (item, idx) => {
                        if (typeof item === 'string') return item;
                        return item.id || `item-${idx}`;
                    };
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

    const handleDeepNestedDragEnd = (blockId, field, index, subField, event) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setBlocks((prevBlocks) => prevBlocks.map(block => {
                if (block.id === blockId) {
                    const parentItems = [...(block.data[field] || [])];
                    if (parentItems[index]) {
                        const items = [...(parentItems[index][subField] || [])];
                        const getItemId = (item, idx) => item.id || `item-${idx}`;
                        const oldIndex = items.findIndex((item, idx) => getItemId(item, idx) === active.id);
                        const newIndex = items.findIndex((item, idx) => getItemId(item, idx) === over.id);
                        if (oldIndex !== -1 && newIndex !== -1) {
                            parentItems[index] = {
                                ...parentItems[index],
                                [subField]: arrayMove(items, oldIndex, newIndex)
                            };
                            return {
                                ...block,
                                data: { ...block.data, [field]: parentItems }
                            };
                        }
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
            footer: finalFooter,
            theme: theme
        }, {
            preserveScroll: true,
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
        });
    };

    const openMediaPicker = (blockId, fieldName, index = null) => {
        setMediaPickerTarget({ blockId, fieldName, index });
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (url) => {
        if (mediaPickerTarget) {
            const { blockId, fieldName, index } = mediaPickerTarget;
            if (index !== null && index !== undefined) {
                // Handle nested items
                const block = blocks.find(b => b.id === blockId);
                if (block && Array.isArray(block.data[fieldName])) {
                    const newItems = [...block.data[fieldName]];
                    if (newItems[index]) {
                        if (block.type === 'timeline' || block.type === 'slideshow') {
                            newItems[index] = { ...newItems[index], image: url };
                        } else {
                            newItems[index] = { ...newItems[index], url: url };
                        }
                        updateBlockData(blockId, fieldName, newItems);
                    }
                }
            } else {
                updateBlockData(blockId, fieldName, url);
            }
        }
        setMediaPickerTarget(null);
        setMediaPickerOpen(false);
    };

    const renderBlockConfig = (block) => {
        const data = block.data || {};
        switch (block.type) {
            case 'navbar': {
                const links = Array.isArray(data.links) ? data.links : [];
                const buttons = Array.isArray(data.buttons) ? data.buttons : [];
                const social_links = Array.isArray(data.social_links) ? data.social_links : [];
                const composition = Array.isArray(data.composition) ? data.composition : ['logo', 'links', 'buttons', 'social_links'];

                const moveItem = (arr, index, direction, fieldName) => {
                    const newArr = [...arr];
                    const targetIndex = index + direction;
                    if (targetIndex < 0 || targetIndex >= arr.length) return;
                    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
                    updateBlockData(block.id, fieldName, newArr);
                };

                const renderSection = (key, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === composition.length - 1;

                    const sectionHeader = (title, onAdd, addLabel) => (
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</label>
                                <div className="flex gap-1">
                                    <button disabled={isFirst} onClick={() => moveItem(composition, idx, -1, 'composition')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400"><ChevronUp className="w-3 h-3" /></button>
                                    <button disabled={isLast} onClick={() => moveItem(composition, idx, 1, 'composition')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-gray-400"><ChevronDown className="w-3 h-3" /></button>
                                </div>
                            </div>
                            {onAdd && <button onClick={onAdd} className="text-[10px] text-indigo-600 font-bold hover:underline">{addLabel}</button>}
                        </div>
                    );

                    const cssInput = (key) => (
                        <div className="mt-2 pt-2 border-t border-gray-50">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Section Style CSS</label>
                            <input 
                                type="text" 
                                value={data[`${key}_css`] || ''} 
                                onChange={(e) => updateBlockData(block.id, `${key}_css`, e.target.value)}
                                placeholder="e.g. flex: 1; justify-content: center;"
                                className="w-full text-[10px] border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 h-7"
                            />
                        </div>
                    );

                    switch (key) {
                        case 'logo':
                            return (
                                <div key="logo" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Navbar Logo', null, '')}
                                    <div className="flex gap-2">
                                        <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
                                        <button onClick={() => { setMediaPickerTarget({ blockId: block.id, fieldName: 'logo' }); setMediaPickerOpen(true); }} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100">Browse</button>
                                    </div>
                                    {cssInput('logo')}
                                </div>
                            );
                        case 'links':
                            return (
                                <div key="links" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Menu Links', () => {
                                        const newLinks = [...links, { id: generateId(), label: 'New Link', url: '#' }];
                                        updateBlockData(block.id, 'links', newLinks);
                                    }, '+ ADD LINK')}
                                    <div className="space-y-3">
                                        {links.map((link, lIdx) => (
                                            <div key={link.id || `l-${lIdx}`} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button disabled={lIdx === 0} onClick={() => moveItem(links, lIdx, -1, 'links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={lIdx === links.length - 1} onClick={() => moveItem(links, lIdx, 1, 'links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'links', links.filter((_, i) => i !== lIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <input type="text" value={link.label || ''} onChange={(e) => { const newLinks = [...links]; newLinks[lIdx] = { ...newLinks[lIdx], label: e.target.value }; updateBlockData(block.id, 'links', newLinks); }} placeholder="Label" className="w-full text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0" />
                                                    <input type="text" value={link.url || ''} onChange={(e) => { const newLinks = [...links]; newLinks[lIdx] = { ...newLinks[lIdx], url: e.target.value }; updateBlockData(block.id, 'links', newLinks); }} placeholder="URL" className="w-full text-[10px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {cssInput('links')}
                                </div>
                            );
                        case 'buttons':
                            return (
                                <div key="buttons" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('CTA Buttons', () => {
                                        const newButtons = [...buttons, { id: generateId(), label: 'New Button', url: '#', style: 'primary', visibility: 'always' }];
                                        updateBlockData(block.id, 'buttons', newButtons);
                                    }, '+ ADD BUTTON')}
                                    <div className="space-y-3">
                                        {buttons.map((btn, bIdx) => (
                                            <div key={btn.id || `b-${bIdx}`} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button disabled={bIdx === 0} onClick={() => moveItem(buttons, bIdx, -1, 'buttons')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={bIdx === buttons.length - 1} onClick={() => moveItem(buttons, bIdx, 1, 'buttons')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'buttons', buttons.filter((_, i) => i !== bIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="flex gap-2 mb-1 mt-1">
                                                    <input type="text" value={btn.label || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], label: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} placeholder="Label" className="flex-1 text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0" />
                                                    <select value={btn.style || 'primary'} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], style: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-transparent border-transparent p-0 pr-4 focus:ring-0">
                                                        <option value="primary">PRIMARY</option>
                                                        <option value="ghost">GHOST</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input type="text" value={btn.url || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], url: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} placeholder="URL" className="flex-1 text-[10px] border-transparent bg-transparent focus:ring-0 text-gray-400 p-0" />
                                                    <select value={btn.visibility || 'always'} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], visibility: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} className="text-[9px] font-bold border-gray-200 rounded p-0 px-1 bg-white">
                                                        <option value="always">ALWAYS</option>
                                                        <option value="guest">GUEST</option>
                                                        <option value="auth">AUTH</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {cssInput('buttons')}
                                </div>
                            );
                        case 'social_links':
                            return (
                                <div key="social_links" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Social Links', () => {
                                        const newSocial = [...social_links, { id: generateId(), icon: 'Facebook', url: '#' }];
                                        updateBlockData(block.id, 'social_links', newSocial);
                                    }, '+ ADD SOCIAL')}
                                    <div className="space-y-2">
                                        {social_links.map((link, sIdx) => (
                                            <div key={link.id || `s-${sIdx}`} className="flex gap-2 items-center group bg-gray-50/50 p-2 rounded-xl border border-gray-100 relative">
                                                <select value={link.icon || 'Facebook'} onChange={(e) => { const newLinks = [...social_links]; newLinks[sIdx] = { ...newLinks[sIdx], icon: e.target.value }; updateBlockData(block.id, 'social_links', newLinks); }} className="text-[10px] border-transparent bg-transparent p-0 focus:ring-0 font-bold text-gray-500">
                                                    <option value="Facebook">FB</option>
                                                    <option value="Instagram">IG</option>
                                                    <option value="Twitter">X</option>
                                                    <option value="Linkedin">IN</option>
                                                    <option value="Youtube">YT</option>
                                                    <option value="Github">GH</option>
                                                    <option value="Globe">WEB</option>
                                                </select>
                                                <input type="text" value={link.url || ''} onChange={(e) => { const newLinks = [...social_links]; newLinks[sIdx] = { ...newLinks[sIdx], url: e.target.value }; updateBlockData(block.id, 'social_links', newLinks); }} placeholder="URL" className="flex-1 text-[10px] border-transparent bg-transparent focus:ring-0 p-0 text-gray-400 px-1" />
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button disabled={sIdx === 0} onClick={() => moveItem(social_links, sIdx, -1, 'social_links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={sIdx === social_links.length - 1} onClick={() => moveItem(social_links, sIdx, 1, 'social_links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'social_links', social_links.filter((_, i) => i !== sIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {cssInput('social_links')}
                                </div>
                            );
                        case 'search':
                            return (
                                <div key="search" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Search Bar', null, '')}
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Placeholder Text</label>
                                        <input 
                                            type="text" 
                                            value={data.search_placeholder || ''} 
                                            onChange={(e) => updateBlockData(block.id, 'search_placeholder', e.target.value)}
                                            placeholder="e.g. Cari produk..."
                                            className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {cssInput('search')}
                                </div>
                            );
                        case 'cart':
                            return (
                                <div key="cart" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Shopping Cart', null, '')}
                                    <div>
                                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Cart URL</label>
                                        <input 
                                            type="text" 
                                            value={data.cart_url || ''} 
                                            onChange={(e) => updateBlockData(block.id, 'cart_url', e.target.value)}
                                            placeholder="/cart"
                                            className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                        />
                                    </div>
                                    {cssInput('cart')}
                                </div>
                            );
                        default:
                            return null;
                    }
                };

                const availableSections = [
                    { id: 'logo', label: 'Navbar Logo' },
                    { id: 'links', label: 'Menu Links' },
                    { id: 'buttons', label: 'CTA Buttons' },
                    { id: 'social_links', label: 'Social Icons' },
                    { id: 'search', label: 'Search Bar' },
                    { id: 'cart', label: 'Shopping Cart' }
                ];

                const toggleSection = (id) => {
                    if (composition.includes(id)) {
                        updateBlockData(block.id, 'composition', composition.filter(k => k !== id));
                    } else {
                        updateBlockData(block.id, 'composition', [...composition, id]);
                    }
                };

                return (
                    <div className="space-y-6">
                        {/* Section Manager */}
                        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                            <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-widest mb-3">Navbar Setup</label>
                            <div className="grid grid-cols-2 gap-2">
                                {availableSections.map(sec => (
                                    <label key={sec.id} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative">
                                            <input 
                                                type="checkbox" 
                                                checked={composition.includes(sec.id)} 
                                                onChange={() => toggleSection(sec.id)}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded border ${composition.includes(sec.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-300'} transition-all flex items-center justify-center`}>
                                                {composition.includes(sec.id) && <LucideIcons.Check className="w-3 h-3 text-white" strokeWidth={4} />}
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold ${composition.includes(sec.id) ? 'text-indigo-900' : 'text-gray-500'} group-hover:text-indigo-600 transition-colors`}>{sec.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color Manager */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 whitespace-nowrap overflow-hidden text-ellipsis">Colors & Theme</label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600">Background</span>
                                    <input type="color" value={data.bg_color || '#ffffff'} onChange={e => updateBlockData(block.id, 'bg_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600">Text & Icons</span>
                                    <input type="color" value={data.text_color || '#111827'} onChange={e => updateBlockData(block.id, 'text_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600">Accent Icon</span>
                                    <input type="color" value={data.accent_color || '#4f46e5'} onChange={e => updateBlockData(block.id, 'accent_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {composition.map((key, idx) => renderSection(key, idx))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${data.sticky !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.sticky !== false ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.sticky !== false} onChange={e => updateBlockData(block.id, 'sticky', e.target.checked)} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Sticky Top</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${data.glass !== false ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.glass !== false ? 'translate-x-4' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.glass !== false} onChange={e => updateBlockData(block.id, 'glass', e.target.checked)} />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Glass Effect</span>
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
            case 'social_media': {
                const links = Array.isArray(data.links) ? data.links : [];
                const iconOptions = [
                    'Facebook', 'Instagram', 'Twitter', 'Linkedin', 'Youtube', 'Github', 'Tiktok', 'Globe', 'Mail', 'Smartphone', 'Video', 'MessageSquare', 'Send', 'Share2', 'Link2'
                ];
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Style</label>
                                <select value={data.style || 'circular'} onChange={e => updateBlockData(block.id, 'style', e.target.value)} className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500">
                                    <option value="minimal">Minimal</option>
                                    <option value="circular">Circular</option>
                                    <option value="square">Square</option>
                                    <option value="glass">Glassmorphism</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Size</label>
                                <select value={data.size || 'md'} onChange={e => updateBlockData(block.id, 'size', e.target.value)} className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500">
                                    <option value="sm">Small</option>
                                    <option value="md">Medium</option>
                                    <option value="lg">Large</option>
                                    <option value="xl">Extra Large</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Social Links</label>
                                <button
                                    onClick={() => {
                                        const newLinks = [...links, { id: generateId(), icon: 'Facebook', url: '#' }];
                                        updateBlockData(block.id, 'links', newLinks);
                                    }}
                                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    + Add Link
                                </button>
                            </div>
                            
                            <div className="space-y-2">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'links', e)}>
                                    <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                        {links.map((link, idx) => (
                                            <SortableNestedItem key={link.id} id={link.id}>
                                                <div className="flex-1 flex gap-2 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <select
                                                        value={link.icon}
                                                        onChange={(e) => {
                                                            const newLinks = [...links];
                                                            newLinks[idx] = { ...newLinks[idx], icon: e.target.value };
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        className="text-[10px] border-gray-200 rounded focus:ring-indigo-500"
                                                    >
                                                        {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={link.url}
                                                        onChange={(e) => {
                                                            const newLinks = [...links];
                                                            newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        placeholder="URL"
                                                        className="flex-1 text-[10px] border-gray-200 rounded focus:ring-indigo-500"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const newLinks = links.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </SortableNestedItem>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> BG Color</label>
                                <input type="color" value={data.backgroundColor || '#ffffff'} onChange={e => updateBlockData(block.id, 'backgroundColor', e.target.value)} className="w-full h-8 rounded border-gray-200 cursor-pointer" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Palette className="w-3 h-3" /> Icon Color</label>
                                <input type="color" value={data.iconColor || '#4f46e5'} onChange={e => updateBlockData(block.id, 'iconColor', e.target.value)} className="w-full h-8 rounded border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'timeline': {
                const items = Array.isArray(data.items) ? data.items : [];
                return (
                    <div className="space-y-6">
                        <div className="pt-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Source</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => updateBlockData(block.id, 'source', 'manual')}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${data.source !== 'dynamic' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Manual
                                </button>
                                <button
                                    onClick={() => updateBlockData(block.id, 'source', 'dynamic')}
                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${data.source === 'dynamic' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Dynamic
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Layout</label>
                                <select value={data.layout || 'vertical'} onChange={e => updateBlockData(block.id, 'layout', e.target.value)} className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500">
                                    <option value="vertical">Vertical</option>
                                    <option value="horizontal">Horizontal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Style</label>
                                <select value={data.style || 'modern'} onChange={e => updateBlockData(block.id, 'style', e.target.value)} className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500">
                                    <option value="modern">Modern</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="glass">Glassmorphism</option>
                                </select>
                            </div>
                        </div>

                        {data.layout === 'vertical' && (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vertical Alignment</label>
                                <select value={data.alignment || 'alternating'} onChange={e => updateBlockData(block.id, 'alignment', e.target.value)} className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500">
                                    <option value="alternating">Alternating</option>
                                    <option value="left">All Left</option>
                                </select>
                            </div>
                        )}

                        {data.source === 'dynamic' ? (
                            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900">Dynamic Source</h4>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Content Type</label>
                                    <select 
                                        value={data.content_type || ''} 
                                        onChange={e => updateBlockData(block.id, 'content_type', e.target.value)}
                                        className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="">Select source...</option>
                                        {contentTypes.map(ct => (
                                            <option key={ct.id} value={ct.slug}>{ct.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {data.content_type && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sort By</label>
                                                <select value={data.sort_by || 'created_at'} onChange={e => updateBlockData(block.id, 'sort_by', e.target.value)} className="w-full text-[10px] border-gray-200 rounded-lg bg-white">
                                                    <option value="created_at">Date</option>
                                                    <option value="id">ID</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Direction</label>
                                                <select value={data.sort_dir || 'desc'} onChange={e => updateBlockData(block.id, 'sort_dir', e.target.value)} className="w-full text-[10px] border-gray-200 rounded-lg bg-white">
                                                    <option value="desc">Newest</option>
                                                    <option value="asc">Oldest</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Max Items</label>
                                                <input 
                                                    type="number" 
                                                    value={data.limit || 5} 
                                                    onChange={e => updateBlockData(block.id, 'limit', parseInt(e.target.value) || 5)} 
                                                    className="w-full text-[10px] border-gray-200 rounded-lg bg-white" 
                                                    min="1" 
                                                    max="50" 
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 space-y-3">
                                            <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Field Mapping</label>
                                            {['title', 'date', 'content', 'image', 'icon', 'color'].map(field => {
                                                const selectedType = contentTypes.find(ct => ct.slug === data.content_type);
                                                const ctFields = selectedType ? selectedType.fields : [];
                                                return (
                                                    <div key={field} className="flex items-center gap-3">
                                                        <label className="w-1/3 text-[10px] font-bold text-gray-500 uppercase tracking-tight">{field}</label>
                                                        <select
                                                            value={data.mapping?.[field] || ''}
                                                            onChange={e => {
                                                                const newMapping = { ...(data.mapping || {}), [field]: e.target.value };
                                                                updateBlockData(block.id, 'mapping', newMapping);
                                                            }}
                                                            className="flex-1 text-[10px] border-gray-200 rounded-lg bg-white"
                                                        >
                                                            <option value="">-- Auto --</option>
                                                            {ctFields.map(f => (
                                                                <option key={f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Manual Items</label>
                                    <button
                                        onClick={() => {
                                            const newItems = [...items, { id: generateId(), title: 'New Event', date: 'Date', content: '', image: '', icon: 'Clock', color: '#4f46e5' }];
                                            updateBlockData(block.id, 'items', newItems);
                                        }}
                                        className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                    >
                                        + Add Item
                                    </button>
                                </div>
                                
                                <div className="space-y-3">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'items', e)}>
                                        <SortableContext items={items.map(it => it.id)} strategy={verticalListSortingStrategy}>
                                            {items.map((item, idx) => (
                                                <SortableNestedItem key={item.id} id={item.id}>
                                                    <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2 group relative">
                                                        <button
                                                            onClick={() => {
                                                                const newItems = items.filter((_, i) => i !== idx);
                                                                updateBlockData(block.id, 'items', newItems);
                                                            }}
                                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="flex gap-2">
                                                            <input type="text" value={item.title} onChange={e => { const newItems = [...items]; newItems[idx].title = e.target.value; updateBlockData(block.id, 'items', newItems); }} placeholder="Title" className="flex-1 text-xs font-bold border-none bg-white rounded p-1" />
                                                            <input type="text" value={item.date} onChange={e => { const newItems = [...items]; newItems[idx].date = e.target.value; updateBlockData(block.id, 'items', newItems); }} placeholder="Date" className="w-20 text-[10px] border-none bg-white rounded p-1" />
                                                        </div>
                                                        <textarea value={item.content} onChange={e => { const newItems = [...items]; newItems[idx].content = e.target.value; updateBlockData(block.id, 'items', newItems); }} placeholder="Content (Markdown)" rows="2" className="w-full text-[10px] border-none bg-white rounded p-1 resize-none" />
                                                        <div className="flex gap-2 items-center">
                                                            <div 
                                                                className="w-12 h-10 bg-gray-100 rounded border border-gray-200 cursor-pointer overflow-hidden flex items-center justify-center group/img"
                                                                onClick={() => openMediaPicker(block.id, 'items', idx)}
                                                            >
                                                                {item.image ? (
                                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <LucideIcons.Image className="w-4 h-4 text-gray-400 group-hover/img:text-indigo-500" />
                                                                )}
                                                            </div>
                                                            <select value={item.icon || 'Clock'} onChange={e => { const newItems = [...items]; newItems[idx].icon = e.target.value; updateBlockData(block.id, 'items', newItems); }} className="flex-1 text-[10px] border-gray-200 rounded py-0.5">
                                                                <option value="Clock">Clock</option>
                                                                <option value="Flag">Flag</option>
                                                                <option value="TrendingUp">Trend</option>
                                                                <option value="Star">Star</option>
                                                                <option value="CheckCircle">Check</option>
                                                                <option value="Rocket">Rocket</option>
                                                                <option value="Target">Target</option>
                                                            </select>
                                                            <input type="color" value={item.color || '#4f46e5'} onChange={e => { const newItems = [...items]; newItems[idx].color = e.target.value; updateBlockData(block.id, 'items', newItems); }} className="w-6 h-6 border-none bg-transparent cursor-pointer" />
                                                        </div>
                                                    </div>
                                                </SortableNestedItem>
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                             <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custom CSS</label>
                                <textarea value={data.customCss || ''} onChange={e => updateBlockData(block.id, 'customCss', e.target.value)} rows="3" className="w-full text-[10px] font-mono border-gray-100 rounded bg-gray-50 p-2" placeholder=".timeline { ... }" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custom JS</label>
                                <textarea value={data.customJs || ''} onChange={e => updateBlockData(block.id, 'customJs', e.target.value)} rows="3" className="w-full text-[10px] font-mono border-gray-100 rounded bg-gray-50 p-2" placeholder="console.log('hi');" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Custom PHP</label>
                                <textarea value={data.customPhp || ''} onChange={e => updateBlockData(block.id, 'customPhp', e.target.value)} rows="3" className="w-full text-[10px] font-mono border-gray-100 rounded bg-gray-50 p-2" placeholder="// Server logic" />
                            </div>
                        </div>
                    </div>
                );
            }
            default:
                return <p className="text-gray-400 text-xs italic">Configuration coming soon for this type ({block.type}).</p>;
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
                            <button 
                                onClick={() => switchTab('theme')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'theme' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Theme
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Structure: {activeTab.toUpperCase()}
                        </div>

                        {activeTab === 'theme' ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Colors</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Primary</span>
                                            <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                <input type="color" value={theme.primaryColor || '#4f46e5'} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 overflow-hidden cursor-pointer" />
                                                <input type="text" value={theme.primaryColor || '#4f46e5'} onChange={e => setTheme({ ...theme, primaryColor: e.target.value })} className="flex-1 bg-transparent border-0 p-0 text-[10px] font-mono uppercase focus:ring-0" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Secondary</span>
                                            <div className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                <input type="color" value={theme.secondaryColor || '#10b981'} onChange={e => setTheme({ ...theme, secondaryColor: e.target.value })} className="w-6 h-6 rounded border-0 p-0 overflow-hidden cursor-pointer" />
                                                <input type="text" value={theme.secondaryColor || '#10b981'} onChange={e => setTheme({ ...theme, secondaryColor: e.target.value })} className="flex-1 bg-transparent border-0 p-0 text-[10px] font-mono uppercase focus:ring-0" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Typography</label>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5">Font Family</span>
                                            <select 
                                                value={theme.fontFamily || 'Inter'} 
                                                onChange={e => setTheme({ ...theme, fontFamily: e.target.value })}
                                                className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                            >
                                                <option value="Inter">Inter (Sans-serif)</option>
                                                <option value="Roboto">Roboto (Clean Sans)</option>
                                                <option value="Outfit">Outfit (Geometric)</option>
                                                <option value="Playfair Display">Playfair Display (Serif)</option>
                                                <option value="Montserrat">Montserrat (Classic)</option>
                                                <option value="System">System Default</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1.5">Base Font Size (px)</span>
                                            <div className="flex items-center gap-3">
                                                <input 
                                                    type="range" 
                                                    min="12" 
                                                    max="20" 
                                                    value={theme.fontSize || 16} 
                                                    onChange={e => setTheme({ ...theme, fontSize: e.target.value })}
                                                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <span className="text-xs font-bold text-gray-600 w-8">{theme.fontSize || 16}px</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
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
                        )}

                        {activeTab !== 'theme' && (
                            <button
                                onClick={() => setShowBlockMenu(true)}
                                className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add to {activeTab}
                            </button>
                        )}
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
        <div ref={setNodeRef} style={style} className={`flex items-center gap-3 group/nested ${isDragging ? 'ring-2 ring-indigo-500 ring-offset-2 rounded-xl' : ''}`}>
            <div 
                {...attributes} 
                {...listeners} 
                className="p-2 -ml-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all"
                title="Drag to reorder"
            >
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}

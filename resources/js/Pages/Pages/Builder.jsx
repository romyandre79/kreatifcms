import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
    Layout, Type, Image as ImageIcon, Grid, Layers,
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

export default function Builder({ page, reusableBlocks = [], contentTypes = [] }) {
    const { plugins = [] } = usePage().props;
    const blockPlugins = plugins.filter(p => p.type === 'block');
    const BLOCK_TYPES = [
        ...blockPlugins.map(p => {
            const IconComponent = p.meta?.icon ? LucideIcons[p.meta.icon] || LucideIcons.LayoutGrid : LucideIcons.LayoutGrid;
            return {
                id: p.meta?.id || p.alias,
                name: p.meta?.name || p.name,
                icon: IconComponent,
                desc: p.meta?.desc || p.description || ''
            };
        }),
        { id: 'reusable_block', name: 'Saved Block', icon: LucideIcons.Box || LucideIcons.Layers, desc: 'Import a saved block' }
    ];

    const generateId = () => Math.random().toString(36).substr(2, 9);
    
    // Ensure all blocks have an ID (for backward compatibility)
    const ensureIds = (blockArr) => {
        if (!Array.isArray(blockArr)) return [];
        return blockArr.map(b => b.id ? b : { ...b, id: generateId() });
    };

    const [blocks, setBlocks] = useState(ensureIds(page.blocks || []));
    const [title, setTitle] = useState(page.title);
    const [slug, setSlug] = useState(page.slug);
    const [isPublished, setIsPublished] = useState(page.is_published);
    
    // SEO State
    const [metaTitle, setMetaTitle] = useState(page.meta_title || '');
    const [metaDescription, setMetaDescription] = useState(page.meta_description || '');
    const [metaKeywords, setMetaKeywords] = useState(page.meta_keywords || '');
    const [ogImage, setOgImage] = useState(page.og_image || '');

    const [sidebarTab, setSidebarTab] = useState('structure'); // 'structure' or 'settings'

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
    // Which field of which block requested the media picker?
    const [mediaPickerTarget, setMediaPickerTarget] = useState(null);


    const addBlock = (type) => {
        let newBlock = { id: generateId(), type, data: {} };

        // Initial defaults
        if (type === 'hero') {
            newBlock.data = { title: 'Welcome to Kreatif', subtitle: 'A powerful internal application portal.', bgImage: '', buttonText: 'Get Started', buttonLink: '#' };
        } else if (type === 'text') {
            newBlock.data = { content: 'Enter your text here...', align: 'left' };
        } else if (type === 'image') {
            newBlock.data = { url: '', caption: '' };
        } else if (type === 'feature_grid') {
            newBlock.data = {
                title: 'Our Features',
                features: [
                    { id: generateId(), title: 'Feature 1', desc: 'Description for feature one', iconUrl: '' },
                    { id: generateId(), title: 'Feature 2', desc: 'Description for feature two', iconUrl: '' }
                ]
            };
        } else if (type === 'slideshow') {
            newBlock.data = {
                source: 'manual',
                items: [{ id: generateId(), image: '', title: '', link: '' }],
                config: { autoPlay: true, interval: 5000, showArrows: true, showDots: true }
            };
        } else if (type === 'navbar') {
            newBlock.data = { 
                logo: '', 
                links: [{ id: generateId(), label: 'Home', url: '/' }, { id: generateId(), label: 'Features', url: '/#features' }],
                buttons: [
                    { id: generateId(), label: 'Login', url: '/login', style: 'ghost' },
                    { id: generateId(), label: 'Get Started', url: '#', style: 'primary' }
                ],
                sticky: true,
                glass: true,
                align: 'center',
                customCss: '',
                customJs: ''
            };
        } else if (type === 'content_list') {
            newBlock.data = {
                content_type: '',
                limit: 3,
                sort_by: 'created_at',
                sort_dir: 'desc',
                layout_style: 'grid',
                mapping: {
                    title: '',
                    description: '',
                    image: '',
                    link_prefix: '/content/'
                }
            };
        } else if (type === 'reusable_block') {
            newBlock.data = { block_id: '' };
        } else if (type === 'form') {
            newBlock.data = { 
                mode: 'static', 
                title: 'Contact Us', 
                description: 'We would love to hear from you.',
                success_message: 'Thank you for your submission!',
                submit_button_text: 'Send Message',
                fields: [
                    { id: generateId(), label: 'Name', name: 'name', type: 'text', placeholder: 'Your Name', required: true },
                    { id: generateId(), label: 'Email', name: 'email', type: 'email', placeholder: 'your@email.com', required: true },
                    { id: generateId(), label: 'Message', name: 'message', type: 'textarea', placeholder: 'How can we help?', required: true }
                ],
                content_type: '',
                align: 'left',
                onSuccessJs: ''
            };
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
                    // Use the same ID generation as SortableContext to find items
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
        router.put(route('pages.update', page.id), {
            title,
            slug,
            is_published: isPublished,
            blocks,
            meta_title: metaTitle,
            meta_description: metaDescription,
            meta_keywords: metaKeywords,
            og_image: ogImage
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
            if (mediaPickerTarget.blockId === 'seo') {
                if (mediaPickerTarget.fieldName === 'og_image') setOgImage(url);
            } else {
                updateBlockData(mediaPickerTarget.blockId, mediaPickerTarget.fieldName, url);
            }
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Logo</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-sm border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                <button onClick={() => openMediaPicker(block.id, 'logo')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Select</button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Links</label>
                                <button
                                    onClick={() => {
                                        const newLinks = [...links, { id: generateId(), label: 'New Link', url: '#' }];
                                        updateBlockData(block.id, 'links', newLinks);
                                    }}
                                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    + Add Link
                                </button>
                            </div>
                            <div className="space-y-3">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'links', e)}>
                                    <SortableContext items={links.map((l, idx) => l.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {links.map((link, idx) => {
                                            const linkId = link.id || `item-${idx}`;
                                            const children = Array.isArray(link.children) ? link.children : [];
                                            return (
                                            <SortableNestedItem key={linkId} id={linkId}>
                                                <div className="p-3 border border-gray-200 rounded-lg bg-white relative group flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newLinks = links.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'links', newLinks);
                                                        }}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <input
                                                            type="text"
                                                            value={link.label || ''}
                                                            onChange={(e) => {
                                                                const newLinks = [...links];
                                                                newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                                updateBlockData(block.id, 'links', newLinks);
                                                            }}
                                                            placeholder="Label"
                                                            className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={link.url || ''}
                                                            onChange={(e) => {
                                                                const newLinks = [...links];
                                                                newLinks[idx] = { ...newLinks[idx], url: e.target.value };
                                                                updateBlockData(block.id, 'links', newLinks);
                                                            }}
                                                            placeholder="URL"
                                                            className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                        />
                                                    </div>

                                                    {/* Sub Links (Dropdown) */}
                                                    <div className="pl-4 border-l-2 border-indigo-50 space-y-2 mt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sub-links (Dropdown)</label>
                                                            <button 
                                                                onClick={() => {
                                                                    const newLinks = [...links];
                                                                    const newChildren = [...children, { id: generateId(), label: 'New Sub-link', url: '#' }];
                                                                    newLinks[idx] = { ...newLinks[idx], children: newChildren };
                                                                    updateBlockData(block.id, 'links', newLinks);
                                                                }}
                                                                className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold"
                                                            >
                                                                + Add
                                                            </button>
                                                        </div>
                                                        {children.map((child, childIdx) => (
                                                            <div key={child.id || childIdx} className="flex gap-1 group/child relative">
                                                                <input 
                                                                    type="text" 
                                                                    value={child.label || ''} 
                                                                    onChange={(e) => {
                                                                        const newLinks = [...links];
                                                                        const newChildren = [...children];
                                                                        newChildren[childIdx] = { ...newChildren[childIdx], label: e.target.value };
                                                                        newLinks[idx] = { ...newLinks[idx], children: newChildren };
                                                                        updateBlockData(block.id, 'links', newLinks);
                                                                    }}
                                                                    placeholder="Sub-label"
                                                                    className="flex-1 text-[10px] p-1 border-gray-100 rounded focus:ring-indigo-200"
                                                                />
                                                                <input 
                                                                    type="text" 
                                                                    value={child.url || ''} 
                                                                    onChange={(e) => {
                                                                        const newLinks = [...links];
                                                                        const newChildren = [...children];
                                                                        newChildren[childIdx] = { ...newChildren[childIdx], url: e.target.value };
                                                                        newLinks[idx] = { ...newLinks[idx], children: newChildren };
                                                                        updateBlockData(block.id, 'links', newLinks);
                                                                    }}
                                                                    placeholder="Sub-URL"
                                                                    className="flex-1 text-[10px] p-1 border-gray-100 rounded focus:ring-indigo-200"
                                                                />
                                                                <button 
                                                                    onClick={() => {
                                                                        const newLinks = [...links];
                                                                        const newChildren = children.filter((_, ci) => ci !== childIdx);
                                                                        newLinks[idx] = { ...newLinks[idx], children: newChildren };
                                                                        updateBlockData(block.id, 'links', newLinks);
                                                                    }}
                                                                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover/child:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
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
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">CTA Buttons</label>
                                <button
                                    onClick={() => {
                                        const newButtons = [...buttons, { id: generateId(), label: 'New Button', url: '#', style: 'primary' }];
                                        updateBlockData(block.id, 'buttons', newButtons);
                                    }}
                                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    + Add Button
                                </button>
                            </div>
                            <div className="space-y-3">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'buttons', e)}>
                                    <SortableContext items={buttons.map((b, idx) => b.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {buttons.map((btn, idx) => {
                                            const btnId = btn.id || `item-${idx}`;
                                            return (
                                            <SortableNestedItem key={btnId} id={btnId}>
                                                <div className="p-3 border border-gray-200 rounded-lg bg-white relative group flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newButtons = buttons.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'buttons', newButtons);
                                                        }}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex gap-2 mb-2">
                                                        <input
                                                            type="text"
                                                            value={btn.label || ''}
                                                            onChange={(e) => {
                                                                const newButtons = [...buttons];
                                                                newButtons[idx] = { ...newButtons[idx], label: e.target.value };
                                                                updateBlockData(block.id, 'buttons', newButtons);
                                                            }}
                                                            placeholder="Label"
                                                            className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                        />
                                                        <select
                                                            value={btn.style || 'primary'}
                                                            onChange={(e) => {
                                                                const newButtons = [...buttons];
                                                                newButtons[idx] = { ...newButtons[idx], style: e.target.value };
                                                                updateBlockData(block.id, 'buttons', newButtons);
                                                            }}
                                                            className="w-24 text-xs font-semibold uppercase text-gray-600 border-gray-200 rounded focus:ring-indigo-500"
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
                                                        placeholder="URL"
                                                        className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 mb-2"
                                                    />
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Visibility</label>
                                                        <select
                                                            value={btn.visibility || 'always'}
                                                            onChange={(e) => {
                                                                const newButtons = [...buttons];
                                                                newButtons[idx] = { ...newButtons[idx], visibility: e.target.value };
                                                                updateBlockData(block.id, 'buttons', newButtons);
                                                            }}
                                                            className="w-full text-[10px] border-gray-200 rounded focus:ring-indigo-500 mb-2"
                                                        >
                                                            <option value="always">Always</option>
                                                            <option value="guest">Guest Only</option>
                                                            <option value="auth">Logged In</option>
                                                        </select>
                                                    </div>
                                                    <div className="mb-2">
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
                                                    <div className="mt-2 pt-2 border-t border-dashed border-gray-100">
                                                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Events</label>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <label className="block text-[9px] text-gray-400 mb-0.5">onClick</label>
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
                                                </div>
                                            </SortableNestedItem>
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.sticky !== false} onChange={e => updateBlockData(block.id, 'sticky', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Sticky Top</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.glass !== false} onChange={e => updateBlockData(block.id, 'glass', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Glassmorphism</span>
                            </label>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Custom CSS</label>
                                <textarea
                                    value={data.customCss || ''}
                                    onChange={e => updateBlockData(block.id, 'customCss', e.target.value)}
                                    rows="3"
                                    placeholder=".nav-link { color: red; }"
                                    className="w-full text-xs font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Custom JS</label>
                                <textarea
                                    value={data.customJs || ''}
                                    onChange={e => updateBlockData(block.id, 'customJs', e.target.value)}
                                    rows="3"
                                    placeholder="console.log('Navbar loaded');"
                                    className="w-full text-xs font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                );
            }
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
            case 'content_list': {
                const selectedType = contentTypes.find(ct => ct.slug === data.content_type);
                const fields = selectedType ? selectedType.fields : [];
                
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content Type</label>
                                <select 
                                    value={data.content_type || ''} 
                                    onChange={e => updateBlockData(block.id, 'content_type', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="">Select Content Type...</option>
                                    {contentTypes.map(ct => (
                                        <option key={ct.id} value={ct.slug}>{ct.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Layout</label>
                                <select 
                                    value={data.layout_style || 'grid'} 
                                    onChange={e => updateBlockData(block.id, 'layout_style', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="grid">Grid View</option>
                                    <option value="list">List View</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Items</label>
                                <input 
                                    type="number" 
                                    min="1" max="100"
                                    value={data.limit || 3} 
                                    onChange={e => updateBlockData(block.id, 'limit', parseInt(e.target.value))}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sort By</label>
                                <select 
                                    value={data.sort_by || 'created_at'} 
                                    onChange={e => updateBlockData(block.id, 'sort_by', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="created_at">Creation Date</option>
                                    <option value="updated_at">Last Updated</option>
                                    <option value="id">ID</option>
                                    <optgroup label="Custom Fields">
                                        {fields.map(f => {
                                            const fieldName = f.name.toLowerCase().replace(/ /g, '_');
                                            return <option key={'sort_'+f.id} value={fieldName}>{f.name}</option>;
                                        })}
                                    </optgroup>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Direction</label>
                                <select 
                                    value={data.sort_dir || 'desc'} 
                                    onChange={e => updateBlockData(block.id, 'sort_dir', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="desc">Latest First (DESC)</option>
                                    <option value="asc">Oldest First (ASC)</option>
                                </select>
                            </div>
                        </div>

                        {data.content_type && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-bold text-gray-900 mb-3">Field Mapping</h4>
                                <p className="text-xs text-gray-500 mb-4">Map your custom fields to the layout elements.</p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="w-1/3 text-xs font-bold text-gray-600">Card Title</label>
                                        <select 
                                            value={data.mapping?.title || ''} 
                                            onChange={e => {
                                                const mapping = { ...(data.mapping || {}), title: e.target.value };
                                                updateBlockData(block.id, 'mapping', mapping);
                                            }}
                                            className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                        >
                                            <option value="">-- No Title --</option>
                                            {fields.filter(f => ['text', 'longtext', 'string'].includes(f.type)).map(f => {
                                                const fieldName = f.name.toLowerCase().replace(/ /g, '_');
                                                return <option key={'m_title_'+f.id} value={fieldName}>{f.name}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="w-1/3 text-xs font-bold text-gray-600">Card Description</label>
                                        <select 
                                            value={data.mapping?.description || ''} 
                                            onChange={e => {
                                                const mapping = { ...(data.mapping || {}), description: e.target.value };
                                                updateBlockData(block.id, 'mapping', mapping);
                                            }}
                                            className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                        >
                                            <option value="">-- No Description --</option>
                                            {fields.filter(f => ['text', 'longtext', 'string'].includes(f.type)).map(f => {
                                                const fieldName = f.name.toLowerCase().replace(/ /g, '_');
                                                return <option key={'m_desc_'+f.id} value={fieldName}>{f.name}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="w-1/3 text-xs font-bold text-gray-600">Card Image URL</label>
                                        <select 
                                            value={data.mapping?.image || ''} 
                                            onChange={e => {
                                                const mapping = { ...(data.mapping || {}), image: e.target.value };
                                                updateBlockData(block.id, 'mapping', mapping);
                                            }}
                                            className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                        >
                                            <option value="">-- No Image --</option>
                                            {fields.map(f => {
                                                const fieldName = f.name.toLowerCase().replace(/ /g, '_');
                                                return <option key={'m_img_'+f.id} value={fieldName}>{f.name}</option>;
                                            })}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="w-1/3 text-xs font-bold text-gray-600">Read More Links</label>
                                        <input 
                                            type="text" 
                                            value={data.mapping?.link_prefix || `/category/slug/`}
                                            onChange={e => {
                                                const mapping = { ...(data.mapping || {}), link_prefix: e.target.value };
                                                updateBlockData(block.id, 'mapping', mapping);
                                            }}
                                            placeholder="URL prefix (ID is appended automatically)"
                                            className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
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
                                    if (syntax === 'bold') replacement = `**${selected || 'bold text'}**`;
                                    else if (syntax === 'italic') replacement = `*${selected || 'italic text'}*`;
                                    else if (syntax === 'link') replacement = `[${selected || 'link text'}](https://)`;
                                    else if (syntax === 'list') replacement = `\n- ${selected || 'list item'}`;
                                    else if (syntax === 'h1') replacement = `\n# ${selected || 'heading 1'}`;
                                    else if (syntax === 'h2') replacement = `\n## ${selected || 'heading 2'}`;

                                    const newValue = before + replacement + after;
                                    updateBlockData(block.id, 'content', newValue);
                                    
                                    // Refocus and set selection (approximate)
                                    setTimeout(() => {
                                        textarea.focus();
                                        textarea.setSelectionRange(start + 2, start + 2 + (selected.length || 9));
                                    }, 10);
                                }}
                            />
                            <textarea 
                                id={`text-editor-${block.id}`}
                                value={data.content || ''} 
                                onChange={e => updateBlockData(block.id, 'content', e.target.value)} 
                                rows="10" 
                                className="w-full text-sm border-gray-200 rounded-b-xl focus:ring-0 focus:border-gray-200 bg-gray-50 font-mono p-4 resize-y border-t-0"
                                placeholder="Type your content here..."
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
                                <img src={data.url} className="w-full h-full object-contain" alt="Preview" />
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Caption / Alt Text</label>
                            <input type="text" value={data.caption || ''} onChange={e => updateBlockData(block.id, 'caption', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content Source</label>
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
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Slide Items</label>
                                    <button
                                        onClick={() => {
                                            const newItems = [...items, { id: generateId(), image: '', title: '', link: '' }];
                                            updateBlockData(block.id, 'items', newItems);
                                        }}
                                        className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800"
                                    >
                                        + Add Slide
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {items.map((item, idx) => (
                                        <div key={item.id || idx} className="p-3 border border-gray-100 rounded-xl bg-gray-50 relative group">
                                            <button
                                                onClick={() => {
                                                    const newItems = items.filter((_, i) => i !== idx);
                                                    updateBlockData(block.id, 'items', newItems);
                                                }}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            
                                            <div className="flex gap-3 mb-3">
                                                <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 relative">
                                                    {item.image ? (
                                                        <img src={item.image} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <ImageIcon className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                    <button 
                                                        onClick={() => openMediaPicker(block.id, `items.${idx}.image`)}
                                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input 
                                                        type="text" 
                                                        value={item.title || ''} 
                                                        onChange={e => {
                                                            const newItems = [...items];
                                                            newItems[idx] = { ...newItems[idx], title: e.target.value };
                                                            updateBlockData(block.id, 'items', newItems);
                                                        }}
                                                        placeholder="Slide Caption"
                                                        className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={item.link || ''} 
                                                        onChange={e => {
                                                            const newItems = [...items];
                                                            newItems[idx] = { ...newItems[idx], link: e.target.value };
                                                            updateBlockData(block.id, 'items', newItems);
                                                        }}
                                                        placeholder="Button Link (optional)"
                                                        className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content Type</label>
                                    <select 
                                        value={data.content_type || ''} 
                                        onChange={e => updateBlockData(block.id, 'content_type', e.target.value)}
                                        className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                    >
                                        <option value="">Select Content Type...</option>
                                        {contentTypes.map(ct => (
                                            <option key={ct.id} value={ct.slug}>{ct.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {data.content_type && (
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Field Mapping</h4>
                                        <div className="flex items-center gap-4">
                                            <label className="w-1/3 text-xs font-bold text-gray-600">Image Field</label>
                                            <select 
                                                value={data.mapping?.image || ''} 
                                                onChange={e => {
                                                    const mapping = { ...(data.mapping || {}), image: e.target.value };
                                                    updateBlockData(block.id, 'mapping', mapping);
                                                }}
                                                className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                            >
                                                <option value="">-- Choose Field --</option>
                                                {fields.map(f => (
                                                    <option key={'s_img_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-1/3 text-xs font-bold text-gray-600">Title Field</label>
                                            <select 
                                                value={data.mapping?.title || ''} 
                                                onChange={e => {
                                                    const mapping = { ...(data.mapping || {}), title: e.target.value };
                                                    updateBlockData(block.id, 'mapping', mapping);
                                                }}
                                                className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                            >
                                                <option value="">-- No Title --</option>
                                                {fields.filter(f => ['text', 'string'].includes(f.type)).map(f => (
                                                    <option key={'s_title_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <label className="w-1/3 text-xs font-bold text-gray-600">Link Field</label>
                                            <select 
                                                value={data.mapping?.link || ''} 
                                                onChange={e => {
                                                    const mapping = { ...(data.mapping || {}), link: e.target.value };
                                                    updateBlockData(block.id, 'mapping', mapping);
                                                }}
                                                className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500"
                                            >
                                                <option value="">-- No Link --</option>
                                                {fields.map(f => (
                                                    <option key={'s_link_'+f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={config.autoPlay} 
                                        onChange={e => updateBlockData(block.id, 'config', { ...config, autoPlay: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <label className="text-xs text-gray-600 font-medium">Autoplay</label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        checked={config.showArrows} 
                                        onChange={e => updateBlockData(block.id, 'config', { ...config, showArrows: e.target.checked })}
                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                    />
                                    <label className="text-xs text-gray-600 font-medium">Arrows</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Custom CSS</label>
                                <textarea 
                                    value={data.customCss || ''} 
                                    onChange={e => updateBlockData(block.id, 'customCss', e.target.value)}
                                    placeholder=".slideshow-container { ... }"
                                    rows="3"
                                    className="w-full text-xs font-mono border-gray-200 rounded-lg bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>
                );
            }
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
                                        const newFeatures = [...features, { id: generateId(), title: 'New Feature', desc: '', iconUrl: '' }];
                                        updateBlockData(block.id, 'features', newFeatures);
                                    }}
                                    className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                                >
                                    + Add Feature
                                </button>
                            </div>
                            <div className="space-y-3">
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'features', e)}>
                                    <SortableContext items={features.map((f, idx) => f.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                        {features.map((feature, idx) => {
                                            const featureId = feature.id || `item-${idx}`;
                                            return (
                                            <SortableNestedItem key={featureId} id={featureId}>
                                                <div className="p-3 border border-gray-200 rounded-lg bg-white relative group flex-1">
                                                    <button
                                                        onClick={() => {
                                                            const newFeatures = features.filter((_, i) => i !== idx);
                                                            updateBlockData(block.id, 'features', newFeatures);
                                                        }}
                                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X className="w-4 h-4" />
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
                                    <option key={rb.id} value={rb.id}>{rb.name} ({BLOCK_TYPES.find(t => t.id === rb.type)?.name})</option>
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
            case 'form': {
                const fields = Array.isArray(data.fields) ? data.fields : [];
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Form Mode</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['static', 'dynamic'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => updateBlockData(block.id, 'mode', m)}
                                        className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${data.mode === m || (!data.mode && m === 'static') ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2">
                                {data.mode === 'dynamic' ? 'Fields are pulled from a Content Type.' : 'Manually define fields for this form.'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                            <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                            <textarea value={data.description || ''} onChange={e => updateBlockData(block.id, 'description', e.target.value)} rows="2" className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                        </div>

                        {data.mode === 'dynamic' ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content Type</label>
                                <select 
                                    value={data.content_type || ''} 
                                    onChange={e => updateBlockData(block.id, 'content_type', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="">Select Content Type...</option>
                                    {contentTypes.map(ct => (
                                        <option key={ct.id} value={ct.slug}>{ct.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Form Fields</label>
                                    <button
                                        onClick={() => {
                                            const newFields = [...fields, { id: generateId(), label: 'New Field', name: 'field_' + generateId(), type: 'text', placeholder: '', required: false }];
                                            updateBlockData(block.id, 'fields', newFields);
                                        }}
                                        className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800"
                                    >
                                        + Add Field
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleNestedDragEnd(block.id, 'fields', e)}>
                                        <SortableContext items={fields.map((f, idx) => f.id || `item-${idx}`)} strategy={verticalListSortingStrategy}>
                                            {fields.map((field, idx) => {
                                                const fieldId = field.id || `item-${idx}`;
                                                return (
                                                <SortableNestedItem key={fieldId} id={fieldId}>
                                                    <div className="p-3 border border-gray-200 rounded-lg bg-white relative group flex-1">
                                                        <button
                                                            onClick={() => {
                                                                const newFields = fields.filter((_, i) => i !== idx);
                                                                updateBlockData(block.id, 'fields', newFields);
                                                            }}
                                                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            <input
                                                                type="text"
                                                                value={field.label || ''}
                                                                onChange={(e) => {
                                                                    const newFields = [...fields];
                                                                    newFields[idx] = { ...newFields[idx], label: e.target.value };
                                                                    updateBlockData(block.id, 'fields', newFields);
                                                                }}
                                                                placeholder="Label"
                                                                className="text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                            />
                                                            <select
                                                                value={field.type || 'text'}
                                                                onChange={(e) => {
                                                                    const newFields = [...fields];
                                                                    newFields[idx] = { ...newFields[idx], type: e.target.value };
                                                                    updateBlockData(block.id, 'fields', newFields);
                                                                }}
                                                                className="text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                            >
                                                                <option value="text">Text</option>
                                                                <option value="email">Email</option>
                                                                <option value="number">Number</option>
                                                                <option value="textarea">Textarea</option>
                                                                <option value="captcha">Captcha</option>
                                                            </select>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={field.name || ''}
                                                            onChange={(e) => {
                                                                const newFields = [...fields];
                                                                newFields[idx] = { ...newFields[idx], name: e.target.value };
                                                                updateBlockData(block.id, 'fields', newFields);
                                                            }}
                                                            placeholder="Internal Name (slug)"
                                                            className="w-full text-[10px] font-mono border-gray-200 rounded bg-gray-50 focus:ring-indigo-500 mb-2"
                                                        />
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={field.required} 
                                                                onChange={e => {
                                                                    const newFields = [...fields];
                                                                    newFields[idx] = { ...newFields[idx], required: e.target.checked };
                                                                    updateBlockData(block.id, 'fields', newFields);
                                                                }} 
                                                                className="rounded text-indigo-600 text-[10px]" 
                                                            />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Required</span>
                                                        </label>
                                                    </div>
                                                </SortableNestedItem>
                                                );
                                            })}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Button & Messages</h4>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Button Text</label>
                                <input type="text" value={data.submit_button_text || 'Submit'} onChange={e => updateBlockData(block.id, 'submit_button_text', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Success Message</label>
                                <textarea value={data.success_message || ''} onChange={e => updateBlockData(block.id, 'success_message', e.target.value)} rows="2" className="w-full text-xs border-gray-200 rounded-lg bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">On Success JS</label>
                                <textarea
                                    value={data.onSuccessJs || ''}
                                    onChange={e => updateBlockData(block.id, 'onSuccessJs', e.target.value)}
                                    rows="3"
                                    placeholder="console.log('Form submitted!', response, formData);"
                                    className="w-full text-[10px] font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500"
                                />
                                <p className="text-[9px] text-gray-400 mt-1">Available variables: <code>response</code>, <code>formData</code></p>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Alignment</label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    {['left', 'center'].map(a => (
                                        <button
                                            key={a}
                                            onClick={() => updateBlockData(block.id, 'align', a)}
                                            className={`flex-1 py-1 text-[10px] font-bold uppercase rounded transition-all ${data.align === a || (!data.align && a === 'left') ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }
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

                    <div className="flex items-center gap-1 p-2 border-b border-gray-100 bg-white">
                        <button 
                            onClick={() => setSidebarTab('structure')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${sidebarTab === 'structure' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Blocks
                        </button>
                        <button 
                            onClick={() => setSidebarTab('settings')}
                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${sidebarTab === 'settings' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            SEO & Settings
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {sidebarTab === 'structure' ? (
                            <>
                                <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
                                    <span>Structure</span>
                                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{blocks.length}</span>
                                </div>

                                <div className="space-y-2 relative min-h-[50px]">
                                    {blocks.length === 0 && (
                                        <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm">
                                            No blocks added.<br />Click + to add content.
                                        </div>
                                    )}

                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
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
                                </div>

                                <div className="mt-4">
                                    <button
                                        onClick={() => setShowBlockMenu(true)}
                                        className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 flex items-center justify-center gap-2 font-medium text-sm transition-all shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Block
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <Globe className="w-3 h-3" /> Page SEO
                                    </h4>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meta Title</label>
                                        <input 
                                            type="text" 
                                            value={metaTitle} 
                                            onChange={e => setMetaTitle(e.target.value)} 
                                            placeholder="Defaults to Page Title"
                                            className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Meta Description</label>
                                        <textarea 
                                            value={metaDescription} 
                                            onChange={e => setMetaDescription(e.target.value)} 
                                            rows="3"
                                            placeholder="Brief description for search engines..."
                                            className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Keywords</label>
                                        <input 
                                            type="text" 
                                            value={metaKeywords} 
                                            onChange={e => setMetaKeywords(e.target.value)} 
                                            placeholder="keyword1, keyword2..."
                                            className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Social Sharing Image (OG)</label>
                                        <div className="flex gap-2">
                                            <input type="text" value={ogImage} readOnly placeholder="Select image..." className="flex-1 text-[10px] border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                            <button onClick={() => openMediaPicker('seo', 'og_image')} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-bold hover:bg-gray-50">Browse</button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">General Settings</h4>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Page Title</label>
                                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">URL Slug</label>
                                        <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full text-xs border-gray-200 rounded-lg focus:ring-indigo-500 bg-gray-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                                        <select value={isPublished} onChange={e => setIsPublished(e.target.value === 'true')} className="w-full text-xs font-semibold border-gray-200 rounded-lg focus:ring-indigo-500 bg-white">
                                            <option value="false">Draft (Hidden)</option>
                                            <option value="true">Published (Live)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-75"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
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

                                    {/* Universal Custom CSS & Events for all block types */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                                            Advanced
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Custom CSS</label>
                                                <textarea
                                                    value={activeBlock.data?.customCss || ''}
                                                    onChange={e => updateBlockData(activeBlock.id, 'customCss', e.target.value)}
                                                    placeholder={`.block-${activeBlock.id} {\n  /* your styles here */\n}`}
                                                    rows="4"
                                                    className="w-full text-xs font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Use <code className="bg-gray-100 px-1 rounded">.block-{activeBlock.id}</code> as selector.</p>
                                            </div>

                                            <div className="pt-3 border-t border-dashed border-gray-100">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Event Handlers</label>
                                                <p className="text-[9px] text-gray-400 mb-3">JavaScript for each event. Available: <code className="bg-gray-100 px-1 rounded">blockEl</code>, <code className="bg-gray-100 px-1 rounded">blockId</code>, <code className="bg-gray-100 px-1 rounded">event</code></p>
                                                <div className="space-y-3">
                                                    {['onLoad', 'onClick', 'onMouseEnter', 'onMouseLeave'].map(evtName => (
                                                        <div key={evtName}>
                                                            <label className="block text-[9px] font-mono text-indigo-500 mb-0.5">{evtName}</label>
                                                            <textarea
                                                                value={activeBlock.data?.events?.[evtName] || ''}
                                                                onChange={e => {
                                                                    const events = { ...(activeBlock.data?.events || {}), [evtName]: e.target.value };
                                                                    updateBlockData(activeBlock.id, 'events', events);
                                                                }}
                                                                placeholder={evtName === 'onLoad' ? `console.log('Block loaded', blockId);` : evtName === 'onClick' ? `console.log('Clicked', event.target);` : ''}
                                                                rows="2"
                                                                className="w-full text-[10px] font-mono border-gray-200 rounded bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                                    <span className="text-[10px] text-gray-400 font-mono">kreatif.internal/{slug}</span>
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

            <BlockPickerModal
                isOpen={showBlockMenu}
                onClose={() => setShowBlockMenu(false)}
                onSelect={(type) => addBlock(type)}
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
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Add New Block</h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto">
                    {blockTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => {
                                onSelect(type.id);
                                onClose();
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-xl text-left transition-all border border-transparent hover:border-indigo-100 group"
                        >
                            <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                <type.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-base font-bold text-gray-900">{type.name}</div>
                                <div className="text-sm text-gray-500 mt-0.5">{type.desc}</div>
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
    const Icon = typeInfo?.icon || Layout;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border ${isDragging ? 'opacity-50 scale-95 shadow-xl bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
            onClick={onClick}
        >
            <div 
                {...attributes} 
                {...listeners} 
                className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700 handle transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            <div className={`p-1.5 rounded-md ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className={`text-sm font-medium flex-1 truncate ${isActive ? 'text-indigo-900' : 'text-gray-700'}`}>
                {typeInfo?.name || 'Block'}
            </span>

            {isActive && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
        zIndex: isDragging ? 40 : 1,
        position: 'relative',
        opacity: isDragging ? 0.3 : 1
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                <GripVertical className="w-4 h-4" />
            </div>
            {children}
        </div>
    );
}

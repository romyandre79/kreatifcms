import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
    Layout, Type, Image as ImageIcon, Grid, Layers,
    Plus, Save, ArrowLeft, Trash2, GripVertical, ChevronUp, ChevronDown, ChevronRight, X,
    Monitor, LayoutTemplate, Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, Palette,
    Menu, Globe
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import DynamicPageRenderer from '@/Components/DynamicPageRenderer';
import SocialIcon from '@/Components/SocialIcon';
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

export default function Builder({ page, reusableBlocks = [], contentTypes = [] }) {
    const { plugins = [] } = usePage().props;
    const isContentTypeEnabled = plugins.some(p => p.alias === 'contenttype' && p.enabled !== false);
    const blockPlugins = plugins.filter(p => p.type === 'block');
    
    // Filter out block options that require ContentType if it's disabled.
    // E.g., if 'content_list' is an option anywhere, we can hide it.
    
    const BLOCK_TYPES = [
        ...blockPlugins.map(p => {
            const IconComponent = p.meta?.icon ? LucideIcons[p.meta.icon] || LucideIcons.LayoutGrid : LucideIcons.LayoutGrid;
            return {
                id: p.meta?.id || p.alias,
                name: p.meta?.name || p.name,
                icon: IconComponent,
                desc: p.meta?.desc || p.description || ''
            };
        }).filter(p => isContentTypeEnabled || (p.id !== 'content_list' && p.id !== 'form' && p.id !== 'slideshow' && p.id !== 'timeline' && p.id !== 'feature_grid')),
        { id: 'reusable_block', name: 'Saved Block', icon: LucideIcons.Box || LucideIcons.Layers, desc: 'Import a saved block' }
    ];
    
    // But since `content_list`, `form`, `timeline`, `slideshow` are already block plugins, 
    // maybe we just disable their 'dynamic' part instead of hiding the whole block.
    // Let's redefine BLOCK_TYPES without full exclusion, but remove `content_list` block
    // which relies entirely on content type.
    const DISPLAY_BLOCK_TYPES = BLOCK_TYPES.filter(p => isContentTypeEnabled || p.id !== 'content_list');

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const iconOptions = [
        'Facebook', 'Instagram', 'Twitter', 'X', 'Linkedin', 'Youtube', 'Github', 'Tiktok', 'Globe', 'Mail', 'Smartphone', 'Video', 'MessageSquare', 'Send', 'Share2', 'Link2'
    ];

    const renderLinks = (links, path, updateFn, depth = 0) => {
        return (
            <div className={`space-y-1 ${depth > 0 ? 'ml-4 mt-2 border-l-2 border-indigo-50/50 pl-2' : ''}`}>
                {(links || []).map((link, lIdx) => (
                    <div key={link.id} className="group/link">
                        <div className="flex items-center gap-1 group/item">
                            <input
                                type="text"
                                value={link.label || ''}
                                onChange={(e) => {
                                    const newLinks = [...links];
                                    newLinks[lIdx] = { ...newLinks[lIdx], label: e.target.value };
                                    updateFn(newLinks, path);
                                }}
                                placeholder="Label"
                                className="flex-1 text-[10px] border-transparent bg-transparent focus:ring-0 p-0 font-medium"
                            />
                            <input
                                type="text"
                                value={link.url || ''}
                                onChange={(e) => {
                                    const newLinks = [...links];
                                    newLinks[lIdx] = { ...newLinks[lIdx], url: e.target.value };
                                    updateFn(newLinks, path);
                                }}
                                placeholder="URL"
                                className="w-16 text-[9px] border-transparent bg-transparent focus:ring-0 p-0 text-gray-400"
                            />
                            <div className="flex items-center opacity-0 group-hover/link:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        const newLinks = [...links];
                                        const childId = generateId();
                                        newLinks[lIdx] = {
                                            ...newLinks[lIdx],
                                            children: [...(newLinks[lIdx].children || []), { id: childId, label: 'Sub-link', url: '#', description: '' }]
                                        };
                                        updateFn(newLinks, path);
                                    }}
                                    className="p-0.5 text-indigo-400 hover:text-indigo-600"
                                    title="Add Sub-link"
                                >
                                    <Plus className="w-2.5 h-2.5" />
                                </button>
                                <button
                                    onClick={() => {
                                        const newLinks = links.filter((_, i) => i !== lIdx);
                                        updateFn(newLinks, path);
                                    }}
                                    className="p-0.5 text-gray-300 hover:text-red-500"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>
                        {link.children && link.children.length > 0 && renderLinks(link.children, [...path, lIdx, 'children'], updateFn, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };
    
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
    const [activeDragId, setActiveDragId] = useState(null);
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
                links: [{ id: generateId(), label: 'Home', url: '/' }], 
                buttons: [
                    { id: generateId(), label: 'Login', url: '/login', style: 'ghost', visibility: 'guest' },
                    { id: generateId(), label: 'Get Started', url: '#', style: 'primary' }
                ],
                social_links: [],
                composition: ['links', 'buttons', 'social_links'],
                sticky: true, 
                glass: true,
                align: 'center'
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
        } else if (type === 'social_media') {
            newBlock.data = {
                links: [
                    { id: generateId(), icon: 'Facebook', url: 'https://facebook.com', label: 'Facebook' },
                    { id: generateId(), icon: 'Instagram', url: 'https://instagram.com', label: 'Instagram' },
                    { id: generateId(), icon: 'Twitter', url: 'https://twitter.com', label: 'Twitter' }
                ],
                alignment: 'center',
                size: 'md',
                iconStyle: 'circular',
                backgroundColor: '#ffffff',
                textColor: '#111827'
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
        } else if (type === 'megamenu') {
            newBlock.data = {
                source: 'static',
                menus: [
                    {
                        id: generateId(),
                        label: 'Products',
                        icon: 'Package',
                        url: '#',
                        columns: [
                            {
                                id: generateId(),
                                title: 'Category',
                                links: [
                                    { id: generateId(), label: 'Item 1', url: '#', description: 'Short description' },
                                    { id: generateId(), label: 'Item 2', url: '#', description: '' }
                                ],
                                image: ''
                            }
                        ],
                        featured_image: '',
                        cta_label: '',
                        cta_url: '',
                        cta_description: ''
                    },
                    {
                        id: generateId(),
                        label: 'Company',
                        icon: 'Building2',
                        url: '#',
                        columns: [
                            {
                                id: generateId(),
                                title: 'About',
                                links: [
                                    { id: generateId(), label: 'Our Story', url: '#', description: '' },
                                    { id: generateId(), label: 'Team', url: '#', description: '' }
                                ],
                                image: ''
                            }
                        ],
                        featured_image: '',
                        cta_label: '',
                        cta_url: '',
                        cta_description: ''
                    }
                ],
                content_type: '',
                limit: 12,
                sort_by: 'created_at',
                sort_dir: 'desc',
                columns_count: 4,
                mapping: {
                    title: '',
                    description: '',
                    image: '',
                    link_prefix: '/content/'
                },
                sticky: false,
                glass: false,
                logo: '',
                bg_color: '#ffffff',
                text_color: '#111827',
                accent_color: '#4f46e5',
                hover_color: '#eef2ff',
                panel_bg: '#ffffff',
                cta_label: '',
                cta_url: ''
            };
        } else if (type === 'video') {
            newBlock.data = {
                source: 'external',
                url: '',
                poster: '',
                title: '',
                description: '',
                autoplay: false,
                loop: false,
                muted: false,
                controls: true,
                is_paid: false,
                paid_message: 'This video is exclusive to registered members. Please log in to watch.',
                locked_title: 'Premium Content',
                locked_button_text: 'Log In to Watch'
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
                    // Check if it's a direct field drag (like composition) or a sub-item drag
                    // We look for the field in block.data
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

    const openMediaPicker = (blockId, fieldName, index = null) => {
        setMediaPickerTarget({ blockId, fieldName, index });
        setMediaPickerOpen(true);
    };

    const handleMediaSelect = (url) => {
        if (mediaPickerTarget) {
            const { blockId, fieldName, index } = mediaPickerTarget;
            
            if (blockId === 'seo') {
                if (fieldName === 'og_image') setOgImage(url);
            } else if (index !== null && index !== undefined) {
                // Handle nested items (e.g., timeline events, gallery images)
                const block = blocks.find(b => b.id === blockId);
                if (block && Array.isArray(block.data[fieldName])) {
                    const newItems = [...block.data[fieldName]];
                    if (newItems[index]) {
                        // Assumption: nested media picker usually updates 'image' or 'url'
                        // For timeline, it's 'image'. For others, we might need a subFieldName.
                        // Let's use a heuristic or check the block type.
                        if (block.type === 'timeline') {
                            newItems[index] = { ...newItems[index], image: url };
                        } else if (block.type === 'slideshow') {
                            newItems[index] = { ...newItems[index], image: url };
                        } else {
                            newItems[index] = { ...newItems[index], url: url };
                        }
                        updateBlockData(blockId, fieldName, newItems);
                    }
                }
            } else {
                // Handle megamenu column images with pattern col_img_{menuIdx}_{colIdx}
                const colImgMatch = fieldName.match(/^col_img_(\d+)_(\d+)$/);
                if (colImgMatch) {
                    const block = blocks.find(b => b.id === blockId);
                    if (block && block.type === 'megamenu') {
                        const mIdx = parseInt(colImgMatch[1]);
                        const cIdx = parseInt(colImgMatch[2]);
                        const newMenus = [...(block.data.menus || [])];
                        if (newMenus[mIdx]) {
                            const cols = [...(newMenus[mIdx].columns || [])];
                            if (cols[cIdx]) {
                                cols[cIdx] = { ...cols[cIdx], image: url };
                                newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                updateBlockData(blockId, 'menus', newMenus);
                            }
                        }
                    }
                } else {
                    updateBlockData(blockId, fieldName, url);
                }
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
                const mega_menus = Array.isArray(data.mega_menus) ? data.mega_menus : [];
                const composition = Array.isArray(data.composition) ? data.composition : ['logo', 'links', 'buttons', 'social_links'];
                const isMegaMenuPluginActive = plugins.some(p => p.alias === 'megamenu' && p.enabled !== false);

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
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</label>
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
                                className="w-full text-[10px] border-gray-200 rounded focus:ring-indigo-500 h-7 px-1"
                            />
                        </div>
                    );

                    switch (key) {
                        case 'logo':
                            return (
                                <div key="logo" className="space-y-3 pb-4 border-b border-gray-100">
                                    {sectionHeader('Navbar Logo', null, '')}
                                    <div className="flex gap-2">
                                        <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                        <button onClick={() => openMediaPicker(block.id, 'logo')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Select</button>
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
                                            <div key={link.id || `l-${lIdx}`} className="p-3 border border-gray-200 rounded-lg bg-white relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button disabled={lIdx === 0} onClick={() => moveItem(links, lIdx, -1, 'links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={lIdx === links.length - 1} onClick={() => moveItem(links, lIdx, 1, 'links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'links', links.filter((_, i) => i !== lIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    <input type="text" value={link.label || ''} onChange={(e) => { const newLinks = [...links]; newLinks[lIdx] = { ...newLinks[lIdx], label: e.target.value }; updateBlockData(block.id, 'links', newLinks); }} placeholder="Label" className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 px-1" />
                                                    <input type="text" value={link.url || ''} onChange={(e) => { const newLinks = [...links]; newLinks[lIdx] = { ...newLinks[lIdx], url: e.target.value }; updateBlockData(block.id, 'links', newLinks); }} placeholder="URL" className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 px-1" />
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
                                            <div key={btn.id || `b-${bIdx}`} className="p-3 border border-gray-200 rounded-lg bg-white relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button disabled={bIdx === 0} onClick={() => moveItem(buttons, bIdx, -1, 'buttons')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={bIdx === buttons.length - 1} onClick={() => moveItem(buttons, bIdx, 1, 'buttons')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'buttons', buttons.filter((_, i) => i !== bIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="flex gap-2 mb-2 mt-1">
                                                    <input type="text" value={btn.label || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], label: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} placeholder="Label" className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500 px-1" />
                                                    <select value={btn.style || 'primary'} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], style: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} className="w-20 text-[10px] font-bold border-gray-200 rounded">
                                                        <option value="primary">PRIMARY</option>
                                                        <option value="ghost">GHOST</option>
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input type="text" value={btn.url || ''} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], url: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} placeholder="URL" className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500 px-1" />
                                                    <select value={btn.visibility || 'always'} onChange={(e) => { const newButtons = [...buttons]; newButtons[bIdx] = { ...newButtons[bIdx], visibility: e.target.value }; updateBlockData(block.id, 'buttons', newButtons); }} className="w-20 text-[10px] border-gray-200 rounded">
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
                                    <div className="space-y-3">
                                        {social_links.map((link, sIdx) => (
                                            <div key={link.id || `s-${sIdx}`} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                    <button disabled={sIdx === 0} onClick={() => moveItem(social_links, sIdx, -1, 'social_links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                    <button disabled={sIdx === social_links.length - 1} onClick={() => moveItem(social_links, sIdx, 1, 'social_links')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                    <button onClick={() => updateBlockData(block.id, 'social_links', social_links.filter((_, i) => i !== sIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-100 shrink-0">
                                                        <SocialIcon name={link.icon} size={18} color="brand" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 flex-1 pt-1">
                                                        <select
                                                            value={link.icon || 'Facebook'} 
                                                            onChange={(e) => {
                                                                const newLinks = [...social_links];
                                                                newLinks[sIdx] = { ...newLinks[sIdx], icon: e.target.value };
                                                                updateBlockData(block.id, 'social_links', newLinks);
                                                            }}
                                                            className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 p-1 bg-white"
                                                        >
                                                            {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                        <input 
                                                            type="text" 
                                                            value={link.label || ''} 
                                                            onChange={(e) => {
                                                                const newLinks = [...social_links];
                                                                newLinks[sIdx] = { ...newLinks[sIdx], label: e.target.value };
                                                                updateBlockData(block.id, 'social_links', newLinks);
                                                            }} 
                                                            placeholder="Label (opt)" 
                                                            className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 p-1 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    value={link.url || ''} 
                                                    onChange={(e) => {
                                                        const newLinks = [...social_links];
                                                        newLinks[sIdx] = { ...newLinks[sIdx], url: e.target.value };
                                                        updateBlockData(block.id, 'social_links', newLinks);
                                                    }} 
                                                    placeholder="URL" 
                                                    className="w-full text-[10px] border-gray-200 rounded focus:ring-indigo-500 p-1 bg-white" 
                                                />
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
                                            className="w-full text-xs border-gray-200 rounded-lg bg-white focus:ring-indigo-500 h-8 px-2"
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
                                            className="w-full text-xs border-gray-200 rounded-lg bg-white focus:ring-indigo-500 h-8 px-2"
                                        />
                                    </div>
                                    {cssInput('cart')}
                                </div>
                            );
                        case 'megamenu': {
                            const mmSource = data.megamenu_source || 'static';
                            const selectedType = contentTypes.find(ct => ct.slug === data.megamenu_content_type);
                            const fields = selectedType ? selectedType.fields : [];
                            
                            return (
                                <div key="megamenu" className="space-y-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mega Menu Source</label>
                                        <div className="flex bg-gray-100 p-0.5 rounded-lg">
                                            {['static', 'dynamic'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateBlockData(block.id, 'megamenu_source', s)}
                                                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${mmSource === s ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {mmSource === 'static' ? (
                                        <>
                                            {sectionHeader('Mega Menu Items', () => {
                                                const newMega = [...mega_menus, {
                                                    id: generateId(),
                                                    label: 'Menu',
                                                    icon: '',
                                                    columns: [{ id: generateId(), title: 'Column', links: [{ id: generateId(), label: 'Link', url: '#', description: '' }], image: '' }]
                                                }];
                                                updateBlockData(block.id, 'mega_menus', newMega);
                                            }, '+ ADD MEGA')}
                                            <div className="space-y-3">
                                                {mega_menus.map((menu, mIdx) => (
                                                    <div key={menu.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                            <button disabled={mIdx === 0} onClick={() => moveItem(mega_menus, mIdx, -1, 'mega_menus')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                                            <button disabled={mIdx === mega_menus.length - 1} onClick={() => moveItem(mega_menus, mIdx, 1, 'mega_menus')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                                            <button onClick={() => updateBlockData(block.id, 'mega_menus', mega_menus.filter((_, i) => i !== mIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                                            <input type="text" value={menu.label || ''} onChange={(e) => { const arr = [...mega_menus]; arr[mIdx] = { ...arr[mIdx], label: e.target.value }; updateBlockData(block.id, 'mega_menus', arr); }} placeholder="Label" className="col-span-2 text-xs border-transparent bg-transparent focus:ring-0 font-bold text-gray-900 p-0" />
                                                            <input type="text" value={menu.icon || ''} onChange={(e) => { const arr = [...mega_menus]; arr[mIdx] = { ...arr[mIdx], icon: e.target.value }; updateBlockData(block.id, 'mega_menus', arr); }} placeholder="Icon" className="text-[10px] border-transparent bg-transparent focus:ring-0 p-0 text-gray-400" />
                                                        </div>
                                                        <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                                                            {(menu.columns || []).map((col, cIdx) => {
                                                                const updateLinks = (newLinks, path) => {
                                                                    const arr = [...mega_menus];
                                                                    // The path approach is tricky here since we're using a simple updateBlockData
                                                                    // Let's simplify: recursive update for the specific column's links
                                                                    const cols = [...(arr[mIdx].columns || [])];
                                                                    cols[cIdx] = { ...cols[cIdx], links: newLinks };
                                                                    arr[mIdx] = { ...arr[mIdx], columns: cols };
                                                                    updateBlockData(block.id, 'mega_menus', arr);
                                                                };

                                                                return (
                                                                    <div key={col.id} className="relative group/col">
                                                                        <div className="flex items-center justify-between">
                                                                            <input type="text" value={col.title || ''} onChange={(e) => {
                                                                                const arr = [...mega_menus]; const cols = [...(arr[mIdx].columns || [])]; cols[cIdx] = { ...cols[cIdx], title: e.target.value }; arr[mIdx] = { ...arr[mIdx], columns: cols }; updateBlockData(block.id, 'mega_menus', arr);
                                                                            }} placeholder="Col Title" className="text-[9px] font-bold uppercase text-gray-500 border-transparent bg-transparent focus:ring-0 p-0" />
                                                                            <button onClick={() => {
                                                                                const arr = [...mega_menus]; const cols = (arr[mIdx].columns || []).filter((_, i) => i !== cIdx); arr[mIdx] = { ...arr[mIdx], columns: cols }; updateBlockData(block.id, 'mega_menus', arr);
                                                                            }} className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/col:opacity-100"><X className="w-2.5 h-2.5" /></button>
                                                                        </div>
                                                                        
                                                                        {renderLinks(col.links, [], updateLinks)}

                                                                        <button onClick={() => {
                                                                            const arr = [...mega_menus]; const cols = [...(arr[mIdx].columns || [])]; const links = [...(cols[cIdx].links || []), { id: generateId(), label: 'Link', url: '#', description: '' }]; cols[cIdx] = { ...cols[cIdx], links }; arr[mIdx] = { ...arr[mIdx], columns: cols }; updateBlockData(block.id, 'mega_menus', arr);
                                                                        }} className="text-[8px] text-indigo-500 font-bold hover:underline mt-1">+ link</button>
                                                                    </div>
                                                                );
                                                            })}
                                                            <button onClick={() => {
                                                                const arr = [...mega_menus]; const cols = [...(arr[mIdx].columns || []), { id: generateId(), title: 'Column', links: [{ id: generateId(), label: 'Link', url: '#', description: '' }], image: '' }]; arr[mIdx] = { ...arr[mIdx], columns: cols }; updateBlockData(block.id, 'mega_menus', arr);
                                                            }} className="text-[8px] text-indigo-600 font-bold hover:underline">+ column</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Content Type</label>
                                                <select
                                                    value={data.megamenu_content_type || ''}
                                                    onChange={e => updateBlockData(block.id, 'megamenu_content_type', e.target.value)}
                                                    className="w-full text-xs border-gray-200 rounded-lg bg-white"
                                                >
                                                    <option value="">Select...</option>
                                                    {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={data.megamenu_label || 'Browse'}
                                                    onChange={e => updateBlockData(block.id, 'megamenu_label', e.target.value)}
                                                    className="w-full text-xs border-gray-200 rounded-lg bg-white h-8"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Limit</label>
                                                    <input
                                                        type="number"
                                                        value={data.megamenu_limit || 12}
                                                        onChange={e => updateBlockData(block.id, 'megamenu_limit', parseInt(e.target.value))}
                                                        className="w-full text-xs border-gray-200 rounded-lg bg-white h-8"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Columns</label>
                                                    <select
                                                        value={data.megamenu_columns || 4}
                                                        onChange={e => updateBlockData(block.id, 'megamenu_columns', parseInt(e.target.value))}
                                                        className="w-full text-xs border-gray-200 rounded-lg bg-white"
                                                    >
                                                        {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} columns</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2 pt-2 border-t">
                                                <p className="text-[9px] font-bold text-gray-400 uppercase">Field Mapping</p>
                                                {['title', 'description', 'image'].map(slot => (
                                                    <div key={slot} className="flex items-center gap-2">
                                                        <span className="w-16 text-[9px] font-bold text-gray-500">{slot}</span>
                                                        <select
                                                            value={(data.megamenu_mapping || {})[slot] || ''}
                                                            onChange={e => {
                                                                const mapping = { ...(data.megamenu_mapping || {}), [slot]: e.target.value };
                                                                updateBlockData(block.id, 'megamenu_mapping', mapping);
                                                            }}
                                                            className="flex-1 text-[10px] border-gray-100 rounded bg-white p-1"
                                                        >
                                                            <option value="">-- None --</option>
                                                            {fields.map(f => {
                                                                const fn = f.name.toLowerCase().replace(/ /g, '_');
                                                                return <option key={f.id} value={fn}>{f.name}</option>;
                                                            })}
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {cssInput('megamenu')}
                                </div>
                            );
                        }
                        default:
                            return null;
                    }
                };

                const availableSections = [
                    { id: 'logo', label: 'Navbar Logo' },
                    { id: 'links', label: 'Menu Links' },
                    ...(isMegaMenuPluginActive ? [{ id: 'megamenu', label: 'Mega Menu' }] : []),
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
                            <div className="grid grid-cols-2 gap-2 text-indigo-900">
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
                                        <span className={`text-[10px] font-bold ${composition.includes(sec.id) ? 'text-indigo-900' : 'text-gray-500'} group-hover:text-indigo-600 transition-colors uppercase tracking-tight`}>{sec.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color Manager */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Colors & Theme</label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Background</span>
                                    <input type="color" value={data.bg_color || '#ffffff'} onChange={e => updateBlockData(block.id, 'bg_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Text & Icons</span>
                                    <input type="color" value={data.text_color || '#111827'} onChange={e => updateBlockData(block.id, 'text_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">Accent Icon</span>
                                    <input type="color" value={data.accent_color || '#4f46e5'} onChange={e => updateBlockData(block.id, 'accent_color', e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {composition.map((key, idx) => renderSection(key, idx))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.sticky !== false} onChange={e => updateBlockData(block.id, 'sticky', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Sticky Top</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.glass !== false} onChange={e => updateBlockData(block.id, 'glass', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Glassmorphism</span>
                            </label>
                        </div>

                        {/* Block-wide Custom CSS/JS for Navbar specifically (Prominence) */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                <LucideIcons.Code2 className="w-3 h-3" /> Advanced Override
                            </label>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Navbar Custom CSS</label>
                                <textarea 
                                    value={data.customCss || ''} 
                                    onChange={e => updateBlockData(block.id, 'customCss', e.target.value)}
                                    placeholder=".block-id { ... }"
                                    className="w-full text-[10px] font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Navbar Custom JS (On Load)</label>
                                <textarea 
                                    value={data.customJs || ''} 
                                    onChange={e => updateBlockData(block.id, 'customJs', e.target.value)}
                                    placeholder="console.log('navbar loaded');"
                                    className="w-full text-[10px] font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows="3"
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
            case 'social_media': {
                const links = Array.isArray(data.links) ? data.links : [];
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Social Links</label>
                                <button
                                    onClick={() => {
                                        const newLinks = [...links, { id: generateId(), icon: 'Facebook', url: '#', label: '' }];
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
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg shrink-0">
                                                                <SocialIcon name={link.icon} size={18} color="brand" />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 flex-1">
                                                                <select
                                                                    value={link.icon || 'Facebook'}
                                                                    onChange={(e) => {
                                                                        const newLinks = [...links];
                                                                        newLinks[idx] = { ...newLinks[idx], icon: e.target.value };
                                                                        updateBlockData(block.id, 'links', newLinks);
                                                                    }}
                                                                    className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500 px-1"
                                                                >
                                                                    {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                                                </select>
                                                            <input
                                                                type="text"
                                                                value={link.label || ''}
                                                                onChange={(e) => {
                                                                    const newLinks = [...links];
                                                                    newLinks[idx] = { ...newLinks[idx], label: e.target.value };
                                                                    updateBlockData(block.id, 'links', newLinks);
                                                                }}
                                                                placeholder="Label (optional)"
                                                                className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500"
                                                            />
                                                        </div>
                                                        </div>
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
                                                </SortableNestedItem>
                                            );
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Style</label>
                                <select 
                                    value={data.iconStyle || 'circular'} 
                                    onChange={e => updateBlockData(block.id, 'iconStyle', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="minimal">Minimal</option>
                                    <option value="circular">Circular</option>
                                    <option value="square">Square</option>
                                    <option value="glass">Glass</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Size</label>
                                <select 
                                    value={data.size || 'md'} 
                                    onChange={e => updateBlockData(block.id, 'size', e.target.value)}
                                    className="w-full text-sm border-gray-200 rounded-lg focus:ring-indigo-500"
                                >
                                    <option value="sm">Small</option>
                                    <option value="md">Medium</option>
                                    <option value="lg">Large</option>
                                    <option value="xl">Extra Large</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlignLeft className="w-3 h-3" /> Alignment</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['left', 'center', 'right'].map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateBlockData(block.id, 'alignment', align)}
                                        className={`flex-1 py-1.5 rounded-md flex items-center justify-center transition-all ${data.alignment === align || (!data.alignment && align === 'center') ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {align === 'left' && <AlignLeft className="w-4 h-4" />}
                                        {align === 'center' && <AlignCenter className="w-4 h-4" />}
                                        {align === 'right' && <AlignRight className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Background</label>
                                <input 
                                    type="color" 
                                    value={data.backgroundColor || '#ffffff'} 
                                    onChange={e => updateBlockData(block.id, 'backgroundColor', e.target.value)}
                                    className="w-full h-10 p-0 border-0 bg-transparent cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Icon Color</label>
                                <input 
                                    type="color" 
                                    value={data.textColor || '#111827'} 
                                    onChange={e => updateBlockData(block.id, 'textColor', e.target.value)}
                                    className="w-full h-10 p-0 border-0 bg-transparent cursor-pointer"
                                />
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
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data Source</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => updateBlockData(block.id, 'source', 'manual')}
                                    className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${data.source !== 'dynamic' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Manual
                                </button>
                                {isContentTypeEnabled && (
                                    <button
                                        onClick={() => updateBlockData(block.id, 'source', 'dynamic')}
                                        className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${data.source === 'dynamic' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Dynamic
                                    </button>
                                )}
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
                                        <LucideIcons.Database className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900">Dynamic source</h4>
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
                                {['manual'].concat(isContentTypeEnabled ? ['dynamic'] : []).map(s => (
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
                                {['static'].concat(isContentTypeEnabled ? ['dynamic'] : []).map(m => (
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
            case 'megamenu': {
                const source = data.source || 'static';
                const menus = Array.isArray(data.menus) ? data.menus : [];
                const selectedType = contentTypes.find(ct => ct.slug === data.content_type);
                const fields = selectedType ? selectedType.fields : [];

                const moveItem = (arr, index, direction, fieldName) => {
                    const newArr = [...arr];
                    const targetIndex = index + direction;
                    if (targetIndex < 0 || targetIndex >= arr.length) return;
                    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
                    updateBlockData(block.id, fieldName, newArr);
                };

                return (
                    <div className="space-y-6">
                        {/* Source Toggle */}
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content Source</label>
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['static', 'dynamic'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateBlockData(block.id, 'source', s)}
                                        className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${source === s ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s === 'static' ? '✏️ Static' : '⚡ Dynamic'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── STATIC MODE: Menu items with columns ── */}
                        {source === 'static' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Menu Items</label>
                                    <button
                                        onClick={() => {
                                            const newMenus = [...menus, {
                                                id: generateId(),
                                                label: 'New Menu',
                                                icon: '',
                                                url: '#',
                                                columns: [{ id: generateId(), title: 'Column', links: [{ id: generateId(), label: 'Link', url: '#', description: '' }], image: '' }],
                                                featured_image: '',
                                                cta_label: '',
                                                cta_url: '',
                                                cta_description: ''
                                            }];
                                            updateBlockData(block.id, 'menus', newMenus);
                                        }}
                                        className="text-[10px] text-indigo-600 font-bold hover:underline"
                                    >+ ADD MENU</button>
                                </div>
                                {menus.map((menu, mIdx) => (
                                    <div key={menu.id} className="p-4 border border-gray-200 rounded-xl bg-white relative group">
                                        {/* Menu header controls */}
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button disabled={mIdx === 0} onClick={() => moveItem(menus, mIdx, -1, 'menus')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                                            <button disabled={mIdx === menus.length - 1} onClick={() => moveItem(menus, mIdx, 1, 'menus')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                                            <button onClick={() => updateBlockData(block.id, 'menus', menus.filter((_, i) => i !== mIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                        </div>

                                        {/* Menu label + icon */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <input type="text" value={menu.label || ''} onChange={(e) => { const newMenus = [...menus]; newMenus[mIdx] = { ...newMenus[mIdx], label: e.target.value }; updateBlockData(block.id, 'menus', newMenus); }} placeholder="Label" className="col-span-2 text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                            <input type="text" value={menu.icon || ''} onChange={(e) => { const newMenus = [...menus]; newMenus[mIdx] = { ...newMenus[mIdx], icon: e.target.value }; updateBlockData(block.id, 'menus', newMenus); }} placeholder="Icon" className="text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                        </div>

                                        {/* Columns */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Columns</span>
                                                <button
                                                    onClick={() => {
                                                        const newMenus = [...menus];
                                                        const cols = [...(newMenus[mIdx].columns || [])];
                                                        cols.push({ id: generateId(), title: 'Column', links: [{ id: generateId(), label: 'Link', url: '#', description: '' }], image: '' });
                                                        newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                        updateBlockData(block.id, 'menus', newMenus);
                                                    }}
                                                    className="text-[9px] text-indigo-600 font-bold hover:underline"
                                                >+ COLUMN</button>
                                            </div>
                                            {(menu.columns || []).map((col, cIdx) => (
                                                <div key={col.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 relative group/col">
                                                    <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover/col:opacity-100 transition-opacity z-10">
                                                        <button onClick={() => {
                                                            const newMenus = [...menus];
                                                            const cols = (newMenus[mIdx].columns || []).filter((_, i) => i !== cIdx);
                                                            newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                            updateBlockData(block.id, 'menus', newMenus);
                                                        }} className="p-0.5 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                                    </div>
                                                    <input type="text" value={col.title || ''} onChange={(e) => {
                                                        const newMenus = [...menus];
                                                        const cols = [...(newMenus[mIdx].columns || [])];
                                                        cols[cIdx] = { ...cols[cIdx], title: e.target.value };
                                                        newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                        updateBlockData(block.id, 'menus', newMenus);
                                                    }} placeholder="Column Title" className="w-full text-[10px] font-bold border-transparent bg-transparent focus:ring-0 p-0 mb-2 text-gray-700" />

                                                    {/* Column image */}
                                                    <div className="flex gap-2 mb-2">
                                                        <input type="text" value={col.image || ''} readOnly placeholder="Column image..." className="flex-1 text-[9px] border-gray-200 rounded bg-white h-6 px-1" />
                                                        <button onClick={() => openMediaPicker(block.id, `col_img_${mIdx}_${cIdx}`)} className="text-[9px] px-2 py-1 bg-indigo-50 text-indigo-600 rounded font-bold hover:bg-indigo-100">IMG</button>
                                                    </div>

                                                    {/* Links in column */}
                                                    <div className="space-y-1">
                                                        {(col.links || []).map((link, lIdx) => (
                                                            <div key={link.id} className="flex items-center gap-1 group/link">
                                                                <input type="text" value={link.label || ''} onChange={(e) => {
                                                                    const newMenus = [...menus];
                                                                    const cols = [...(newMenus[mIdx].columns || [])];
                                                                    const links = [...(cols[cIdx].links || [])];
                                                                    links[lIdx] = { ...links[lIdx], label: e.target.value };
                                                                    cols[cIdx] = { ...cols[cIdx], links };
                                                                    newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                                    updateBlockData(block.id, 'menus', newMenus);
                                                                }} placeholder="Label" className="flex-1 text-[10px] border-transparent bg-transparent focus:ring-0 p-0" />
                                                                <input type="text" value={link.url || ''} onChange={(e) => {
                                                                    const newMenus = [...menus];
                                                                    const cols = [...(newMenus[mIdx].columns || [])];
                                                                    const links = [...(cols[cIdx].links || [])];
                                                                    links[lIdx] = { ...links[lIdx], url: e.target.value };
                                                                    cols[cIdx] = { ...cols[cIdx], links };
                                                                    newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                                    updateBlockData(block.id, 'menus', newMenus);
                                                                }} placeholder="URL" className="w-20 text-[9px] border-transparent bg-transparent focus:ring-0 p-0 text-gray-400" />
                                                                <button onClick={() => {
                                                                    const newMenus = [...menus];
                                                                    const cols = [...(newMenus[mIdx].columns || [])];
                                                                    const links = (cols[cIdx].links || []).filter((_, i) => i !== lIdx);
                                                                    cols[cIdx] = { ...cols[cIdx], links };
                                                                    newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                                    updateBlockData(block.id, 'menus', newMenus);
                                                                }} className="p-0.5 text-gray-300 hover:text-red-500 opacity-0 group-hover/link:opacity-100"><X className="w-3 h-3" /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => {
                                                            const newMenus = [...menus];
                                                            const cols = [...(newMenus[mIdx].columns || [])];
                                                            const links = [...(cols[cIdx].links || []), { id: generateId(), label: 'New Link', url: '#', description: '' }];
                                                            cols[cIdx] = { ...cols[cIdx], links };
                                                            newMenus[mIdx] = { ...newMenus[mIdx], columns: cols };
                                                            updateBlockData(block.id, 'menus', newMenus);
                                                        }} className="text-[9px] text-indigo-500 font-bold hover:underline mt-1">+ link</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── DYNAMIC MODE: ContentType config ── */}
                        {source === 'dynamic' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Content Type</label>
                                        <select value={data.content_type || ''} onChange={e => updateBlockData(block.id, 'content_type', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                            <option value="">Select Content Type...</option>
                                            {contentTypes.map(ct => <option key={ct.id} value={ct.slug}>{ct.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Columns</label>
                                        <select value={data.columns_count || 4} onChange={e => updateBlockData(block.id, 'columns_count', parseInt(e.target.value))} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} columns</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Items</label>
                                        <input type="number" min="1" max="50" value={data.limit || 12} onChange={e => updateBlockData(block.id, 'limit', parseInt(e.target.value))} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
                                        <select value={data.sort_by || 'created_at'} onChange={e => updateBlockData(block.id, 'sort_by', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500">
                                            <option value="created_at">Created</option>
                                            <option value="updated_at">Updated</option>
                                            <option value="id">ID</option>
                                            {fields.map(f => { const fn = f.name.toLowerCase().replace(/ /g, '_'); return <option key={'sort_'+f.id} value={fn}>{f.name}</option>; })}
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
                                                    <label className="w-1/3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{slot}</label>
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

                                {/* Menu labels for dynamic mode */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu Labels</label>
                                        <button
                                            onClick={() => {
                                                const newMenus = [...menus, { id: generateId(), label: 'Menu', icon: '' }];
                                                updateBlockData(block.id, 'menus', newMenus);
                                            }}
                                            className="text-[10px] text-indigo-600 font-bold hover:underline"
                                        >+ ADD</button>
                                    </div>
                                    {menus.map((menu, mIdx) => (
                                        <div key={menu.id} className="flex items-center gap-2 group">
                                            <input type="text" value={menu.label || ''} onChange={(e) => { const newMenus = [...menus]; newMenus[mIdx] = { ...newMenus[mIdx], label: e.target.value }; updateBlockData(block.id, 'menus', newMenus); }} placeholder="Label" className="flex-1 text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                            <input type="text" value={menu.icon || ''} onChange={(e) => { const newMenus = [...menus]; newMenus[mIdx] = { ...newMenus[mIdx], icon: e.target.value }; updateBlockData(block.id, 'menus', newMenus); }} placeholder="Icon" className="w-20 text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                            <button onClick={() => updateBlockData(block.id, 'menus', menus.filter((_, i) => i !== mIdx))} className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Colors & Theme ── */}
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Colors & Theme</label>
                            <div className="space-y-3">
                                {[
                                    { key: 'bg_color', label: 'Background', def: '#ffffff' },
                                    { key: 'text_color', label: 'Text', def: '#111827' },
                                    { key: 'accent_color', label: 'Accent', def: '#4f46e5' },
                                    { key: 'hover_color', label: 'Hover BG', def: '#eef2ff' },
                                    { key: 'panel_bg', label: 'Panel BG', def: '#ffffff' }
                                ].map(c => (
                                    <div key={c.key} className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{c.label}</span>
                                        <input type="color" value={data[c.key] || c.def} onChange={e => updateBlockData(block.id, c.key, e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Logo & CTA ── */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Logo (Optional)</label>
                                <div className="flex gap-2">
                                    <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-100 text-gray-500" />
                                    <button onClick={() => openMediaPicker(block.id, 'logo')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 border border-indigo-200">Select</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CTA Button Label</label>
                                    <input type="text" value={data.cta_label || ''} onChange={e => updateBlockData(block.id, 'cta_label', e.target.value)} placeholder="e.g. Contact Us" className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">CTA URL</label>
                                    <input type="text" value={data.cta_url || ''} onChange={e => updateBlockData(block.id, 'cta_url', e.target.value)} placeholder="/contact" className="w-full text-xs border-gray-200 rounded focus:ring-indigo-500" />
                                </div>
                            </div>
                        </div>

                        {/* ── Toggles ── */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!data.sticky} onChange={e => updateBlockData(block.id, 'sticky', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Sticky Top</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!data.glass} onChange={e => updateBlockData(block.id, 'glass', e.target.checked)} className="rounded text-indigo-600" />
                                <span className="text-xs font-semibold text-gray-700">Glassmorphism</span>
                            </label>
                        </div>
                    </div>
                );
            }
            case 'video':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Video Source</label>
                            <div className="flex bg-gray-100 p-0.5 rounded-lg">
                                {['internal', 'external'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => updateBlockData(block.id, 'source', s)}
                                        className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${data.source === s ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                                {data.source === 'external' ? 'YouTube / Vimeo URL' : 'Internal / Streaming URL'}
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={data.url || ''} 
                                    onChange={e => updateBlockData(block.id, 'url', e.target.value)} 
                                    placeholder={data.source === 'external' ? 'https://www.youtube.com/watch?v=...' : 'https://.../stream.m3u8'}
                                    className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500 h-8 px-2" 
                                />
                                {data.source === 'internal' && (
                                    <button onClick={() => openMediaPicker(block.id, 'url')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 border border-indigo-200 uppercase tracking-tight">Browse</button>
                                )}
                            </div>
                            <p className="text-[9px] text-gray-400 mt-1">Supports MP4, HLS (.m3u8), and DASH (.mpd)</p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Poster Image (Thumbnail)</label>
                            <div className="flex gap-2">
                                <input type="text" value={data.poster || ''} readOnly placeholder="Select poster..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-100 text-gray-500 h-8 px-2" />
                                <button onClick={() => openMediaPicker(block.id, 'poster')} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 border border-indigo-200 uppercase tracking-tight">Select</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Title</label>
                                <input type="text" value={data.title || ''} onChange={e => updateBlockData(block.id, 'title', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 h-8 px-2" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
                                <input type="text" value={data.description || ''} onChange={e => updateBlockData(block.id, 'description', e.target.value)} className="w-full text-xs border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 h-8 px-2" />
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Playback Settings</label>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.autoplay} onChange={e => updateBlockData(block.id, 'autoplay', e.target.checked)} className="rounded text-indigo-600" />
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Autoplay</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.loop} onChange={e => updateBlockData(block.id, 'loop', e.target.checked)} className="rounded text-indigo-600" />
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Loop</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.muted} onChange={e => updateBlockData(block.id, 'muted', e.target.checked)} className="rounded text-indigo-600" />
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Muted</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.controls !== false} onChange={e => updateBlockData(block.id, 'controls', e.target.checked)} className="rounded text-indigo-600" />
                                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">Controls</span>
                                </label>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={data.is_paid} onChange={e => updateBlockData(block.id, 'is_paid', e.target.checked)} className="rounded text-amber-600 focus:ring-amber-500" />
                                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest flex items-center gap-1.5">
                                        <LucideIcons.Lock className="w-3 h-3" /> Paid Access
                                    </span>
                                </label>
                            </div>
                            {data.is_paid && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">Locked Title</label>
                                        <input 
                                            type="text" 
                                            value={data.locked_title || ''} 
                                            onChange={e => updateBlockData(block.id, 'locked_title', e.target.value)}
                                            className="w-full text-[10px] border-amber-200 rounded-lg bg-white focus:ring-amber-500 h-8 px-2"
                                            placeholder="Premium Content"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">Locked Message</label>
                                        <textarea 
                                            value={data.paid_message || ''} 
                                            onChange={e => updateBlockData(block.id, 'paid_message', e.target.value)}
                                            className="w-full text-[10px] border-amber-200 rounded-lg bg-white focus:ring-amber-500 focus:border-amber-500 px-2 py-1"
                                            rows="2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold text-amber-700 uppercase mb-1">Button Text</label>
                                        <input 
                                            type="text" 
                                            value={data.locked_button_text || ''} 
                                            onChange={e => updateBlockData(block.id, 'locked_button_text', e.target.value)}
                                            className="w-full text-[10px] border-amber-200 rounded-lg bg-white focus:ring-amber-500 h-8 px-2"
                                            placeholder="Log In to Watch"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
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

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Custom JavaScript (On Load)</label>
                                                <textarea
                                                    value={activeBlock.data?.customJs || ''}
                                                    onChange={e => updateBlockData(activeBlock.id, 'customJs', e.target.value)}
                                                    placeholder={`console.log('Block loaded', blockId);`}
                                                    rows="4"
                                                    className="w-full text-xs font-mono border-gray-200 rounded-lg bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                <p className="text-[10px] text-gray-400 mt-1">Runs once after the block is mounted.</p>
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
                blockTypes={DISPLAY_BLOCK_TYPES}
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
        zIndex: isDragging ? 50 : 1,
        position: 'relative',
        opacity: isDragging ? 0.4 : 1,
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

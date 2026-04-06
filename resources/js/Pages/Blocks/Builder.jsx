import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
    Layout, Type, Image as ImageIcon, Grid, 
    Save, ArrowLeft, X, Code, ShieldAlert
} from 'lucide-react';
import MediaPickerModal from '@/Components/MediaPickerModal';
import SocialIcon from '@/Components/SocialIcon';
import MarkdownToolbar from '@/Components/MarkdownToolbar';
import Summernote from '@/Components/Summernote';

export default function Builder({ block }) {
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

    const typeInfo = BLOCK_TYPES.find(t => t.id === block.type) || { id: block.type, name: block.type, icon: LucideIcons.LayoutGrid };

    // Data stores the block's internal payload (title, subtitle, etc.)
    const [data, setData] = useState(block.data || {});
    const [name, setName] = useState(block.name);
    
    const [saving, setSaving] = useState(false);
    const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
    const [mediaPickerTargetField, setMediaPickerTargetField] = useState(null);

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
            case 'text': {
                const isSummernoteEnabled = plugins.some(p => p.alias === 'editorsummernote' && p.enabled !== false);
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Content (Markdown supported)</label>
                            {isSummernoteEnabled ? (
                                <Summernote 
                                    value={data.content || ''} 
                                    onChange={val => updateData('content', val)}
                                    placeholder="Enter content..."
                                />
                            ) : (
                                <textarea value={data.content || ''} onChange={e => updateData('content', e.target.value)} rows="16" className="w-full text-sm border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm font-mono" />
                            )}
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
            }
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
            case 'navbar': {
                const composition = data.composition || ['logo', 'links', 'buttons', 'social_links'];
                const links = data.links || [];
                const buttons = data.buttons || [];
                const social_links = data.social_links || [];

                const renderSection = (key, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === composition.length - 1;

                    const moveItem = (arr, index, direction, fieldName) => {
                        const newArr = [...arr];
                        const targetIndex = index + direction;
                        if (targetIndex < 0 || targetIndex >= arr.length) return;
                        [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
                        updateData(fieldName, newArr);
                    };

                    const sectionHeader = (title, onAdd, addLabel) => (
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</label>
                                <div className="flex gap-1">
                                    <button disabled={isFirst} onClick={() => moveItem(composition, idx, -1, 'composition')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><LucideIcons.ChevronUp className="w-3.5 h-3.5" /></button>
                                    <button disabled={isLast} onClick={() => moveItem(composition, idx, 1, 'composition')} className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30"><LucideIcons.ChevronDown className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                            {onAdd && <button onClick={onAdd} className="text-[10px] text-indigo-600 font-bold hover:underline">{addLabel}</button>}
                        </div>
                    );

                    const cssInput = (key) => (
                        <div className="mt-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Section Style CSS</label>
                            <input 
                                type="text" 
                                value={data[`${key}_css`] || ''} 
                                onChange={e => updateData(`${key}_css`, e.target.value)} 
                                placeholder="e.g. flex: 1; justify-content: center;"
                                className="w-full text-xs border-gray-200 rounded-lg bg-gray-50/50 p-2 focus:ring-1 focus:ring-indigo-500 shadow-sm" 
                            />
                        </div>
                    );

                    switch (key) {
                        case 'logo':
                            return (
                                <div key="logo" className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    {sectionHeader('Navbar Logo', null, '')}
                                    <div className="flex gap-2">
                                        <input type="text" value={data.logo || ''} readOnly placeholder="Select logo..." className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
                                        <button onClick={() => openMediaPicker('logo')} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 border border-indigo-100 uppercase tracking-wider">Browse</button>
                                    </div>
                                    {cssInput('logo')}
                                </div>
                            );
                        case 'links':
                            const moveNestedItem = (arr, index, direction, parentPath = []) => {
                                const newLinks = [...(data.links || [])];
                                let targetArr = newLinks;
                                for (const segment of parentPath) { targetArr = targetArr[segment]; }
                                const targetIndex = index + direction;
                                if (targetIndex < 0 || targetIndex >= targetArr.length) return;
                                [targetArr[index], targetArr[targetIndex]] = [targetArr[targetIndex], targetArr[index]];
                                updateData('links', newLinks);
                            };

                            const renderNestedLinks = (currentLinks, parentPath = [], depth = 0) => {
                                if (depth > 2) return null; 

                                return (
                                    <div className={`space-y-4 ${depth > 0 ? 'ml-6 mt-4 pl-4 border-l-2 border-indigo-50 bg-indigo-50/5 rounded-br-2xl py-3' : ''}`}>
                                        {currentLinks.map((link, lIdx) => (
                                            <div key={link.id || lIdx} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm relative group hover:border-indigo-200 transition-all">
                                                {/* Actions Floating Menu */}
                                                <div className="absolute -top-3 -right-2 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                    <div className="flex items-center bg-white shadow-md border border-gray-100 rounded-lg p-1 gap-1">
                                                        <button 
                                                            disabled={lIdx === 0} 
                                                            onClick={() => moveNestedItem(currentLinks, lIdx, -1, parentPath)} 
                                                            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 rounded transition-colors"
                                                            title="Move Up"
                                                        >
                                                            <LucideIcons.ChevronUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            disabled={lIdx === currentLinks.length - 1} 
                                                            onClick={() => moveNestedItem(currentLinks, lIdx, 1, parentPath)} 
                                                            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-20 rounded transition-colors"
                                                            title="Move Down"
                                                        >
                                                            <LucideIcons.ChevronDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <div className="w-px h-4 bg-gray-100 mx-1" />
                                                        <button 
                                                            onClick={() => {
                                                                const newLinks = [...(data.links || [])];
                                                                let targetArr = newLinks;
                                                                for (const segment of parentPath) { targetArr = targetArr[segment]; }
                                                                targetArr.splice(lIdx, 1);
                                                                updateData('links', newLinks);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 mb-2">
                                                    <div className="flex flex-col">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Menu Label</label>
                                                        <input 
                                                            type="text" 
                                                            value={link.label || ''} 
                                                            onChange={(e) => {
                                                                const newLinks = [...(data.links || [])];
                                                                let targetArr = newLinks;
                                                                for (const segment of parentPath) { targetArr = targetArr[segment]; }
                                                                targetArr[lIdx] = { ...targetArr[lIdx], label: e.target.value };
                                                                updateData('links', newLinks);
                                                            }} 
                                                            placeholder="e.g. Services" 
                                                            className="w-full text-xs border-gray-100 rounded-xl bg-gray-50/50 focus:ring-indigo-500 focus:bg-white font-bold" 
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Redirect URL</label>
                                                        <input 
                                                            type="text" 
                                                            value={link.url || ''} 
                                                            onChange={(e) => {
                                                                const newLinks = [...(data.links || [])];
                                                                let targetArr = newLinks;
                                                                for (const segment of parentPath) { targetArr = targetArr[segment]; }
                                                                targetArr[lIdx] = { ...targetArr[lIdx], url: e.target.value };
                                                                updateData('links', newLinks);
                                                            }} 
                                                            placeholder="e.g. /services or #" 
                                                            className="w-full text-[11px] border-gray-100 rounded-xl bg-gray-50/50 focus:ring-indigo-500 focus:bg-white text-gray-500" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Add Sub Button at Bottom */}
                                                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                    <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">Level {depth + 1}</span>
                                                    {depth < 2 && (
                                                        <button 
                                                            onClick={() => {
                                                                const newLinks = [...(data.links || [])];
                                                                let targetArr = newLinks;
                                                                for (const segment of parentPath) { targetArr = targetArr[segment]; }
                                                                
                                                                const newSubLinks = Array.isArray(targetArr[lIdx].children) ? [...targetArr[lIdx].children] : [];
                                                                newSubLinks.push({ id: Math.random().toString(36).substr(2, 9), label: 'New Sub-link', url: '#' });
                                                                targetArr[lIdx] = { ...targetArr[lIdx], children: newSubLinks };
                                                                updateData('links', newLinks);
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm"
                                                        >
                                                            <LucideIcons.Plus className="w-3 h-3" />
                                                            Add Sub-Menu
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Sub-menus */}
                                                {link.children && link.children.length > 0 && renderNestedLinks(link.children, [...parentPath, lIdx, 'children'], depth + 1)}
                                            </div>
                                        ))}
                                    </div>
                                );
                            };

                            return (
                                <div key="links" className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    {sectionHeader('Menu Links & Navigation Hierarchy', () => updateData('links', [...links, { id: Math.random().toString(36).substr(2, 9), label: 'New Link', url: '#' }]), '+ ADD MAIN LINK')}
                                    {renderNestedLinks(links, [], 0)}
                                    {cssInput('links')}
                                </div>
                            );
                        case 'buttons':
                            return (
                                <div key="buttons" className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    {sectionHeader('CTA Buttons', () => updateData('buttons', [...buttons, { id: Math.random().toString(36).substr(2, 9), label: 'New Button', url: '#', style: 'primary' }]), '+ ADD BUTTON')}
                                    <div className="space-y-3">
                                        {buttons.map((btn, bIdx) => (
                                            <div key={btn.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => updateData('buttons', buttons.filter((_, i) => i !== bIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 mb-2">
                                                    <input type="text" value={btn.label || ''} onChange={(e) => { const arr = [...buttons]; arr[bIdx] = { ...arr[bIdx], label: e.target.value }; updateData('buttons', arr); }} placeholder="Label" className="text-xs border-none bg-transparent focus:ring-0 font-bold p-0" />
                                                    <select value={btn.style || 'primary'} onChange={(e) => { const arr = [...buttons]; arr[bIdx] = { ...arr[bIdx], style: e.target.value }; updateData('buttons', arr); }} className="text-[10px] border-none bg-transparent focus:ring-0 text-gray-400 p-0 uppercase tracking-wider font-bold">
                                                        <option value="primary">Primary</option>
                                                        <option value="ghost">Ghost</option>
                                                        <option value="outline">Outline</option>
                                                    </select>
                                                </div>
                                                <input type="text" value={btn.url || ''} onChange={(e) => { const arr = [...buttons]; arr[bIdx] = { ...arr[bIdx], url: e.target.value }; updateData('buttons', arr); }} placeholder="URL" className="w-full text-[10px] border-none bg-transparent focus:ring-0 text-gray-400 p-0" />
                                            </div>
                                        ))}
                                    </div>
                                    {cssInput('buttons')}
                                </div>
                            );
                        case 'social_links':
                            const iconOptions = ['Facebook', 'Instagram', 'Twitter', 'X', 'Linkedin', 'Youtube', 'Github', 'Tiktok', 'Globe', 'Mail'];
                            return (
                                <div key="social_links" className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                    {sectionHeader('Social Media', () => updateData('social_links', [...social_links, { id: Math.random().toString(36).substr(2, 9), icon: 'Facebook', url: '#' }]), '+ ADD SOCIAL')}
                                    <div className="space-y-3">
                                        {social_links.map((link, sIdx) => (
                                            <div key={link.id} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => updateData('social_links', social_links.filter((_, i) => i !== sIdx))} className="p-1 text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                                </div>
                                                <div className="flex gap-3 items-center">
                                                    <select
                                                        value={link.icon || 'Facebook'} 
                                                        onChange={(e) => { const arr = [...social_links]; arr[sIdx] = { ...arr[sIdx], icon: e.target.value }; updateData('social_links', arr); }}
                                                        className="text-xs border-gray-200 rounded p-1 bg-white focus:ring-1 focus:ring-indigo-500"
                                                    >
                                                        {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <input type="text" value={link.url || ''} onChange={(e) => { const arr = [...social_links]; arr[sIdx] = { ...arr[sIdx], url: e.target.value }; updateData('social_links', arr); }} placeholder="URL" className="flex-1 text-[10px] border-none bg-transparent focus:ring-0 text-gray-400 p-0" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {cssInput('social_links')}
                                </div>
                            );
                        default:
                            return null;
                    }
                };

                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 shadow-inner">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${data.sticky !== false ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.sticky !== false ? 'translate-x-5' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.sticky !== false} onChange={e => updateData('sticky', e.target.checked)} />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Sticky Navbar</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-10 h-5 rounded-full p-1 transition-colors ${data.glass !== false ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.glass !== false ? 'translate-x-5' : ''}`} />
                                </div>
                                <input type="checkbox" className="hidden" checked={data.glass !== false} onChange={e => updateData('glass', e.target.checked)} />
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Glassmorphism</span>
                            </label>
                        </div>
                        <div className="space-y-6">
                            {composition.map((key, idx) => renderSection(key, idx))}
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
            
            <div className="max-w-4xl mx-auto pt-0 pb-8 px-4 sm:px-6 lg:px-8">
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

                            <div className="mt-12 pt-8 border-t border-gray-100 italic font-mono text-[10px] text-gray-300 mb-4 uppercase tracking-[0.2em] text-center">Implementation Details / Advanced Settings</div>
                            
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                    <Code className="w-4 h-4 text-indigo-500" /> Advanced Settings & Callbacks
                                </h4>
                                
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Custom CSS Styling</label>
                                            <span className="text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase">Scoped to block</span>
                                        </div>
                                        <textarea
                                            value={data.customCss || ''}
                                            onChange={e => updateData('customCss', e.target.value)}
                                            placeholder={`.block-${block.id} {\n  /* write your custom css here */\n  background: linear-gradient(to right, #4f46e5, #06b6d4);\n}`}
                                            rows="6"
                                            className="w-full text-xs font-mono border-gray-100 rounded-2xl bg-gray-50/50 focus:ring-1 focus:ring-indigo-500 shadow-sm p-4"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Custom JS Initialization</label>
                                        <textarea
                                            value={data.customJs || ''}
                                            onChange={e => updateData('customJs', e.target.value)}
                                            placeholder="console.log('Block initialized:', blockId);"
                                            rows="5"
                                            className="w-full text-xs font-mono border-gray-100 rounded-2xl bg-gray-50/50 focus:ring-1 focus:ring-indigo-500 shadow-sm p-4"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Server-Side Logic (PHP)</label>
                                        </div>
                                        <textarea
                                            value={data.customPhp || ''}
                                            onChange={e => updateData('customPhp', e.target.value)}
                                            placeholder="// Use $data or $block for context"
                                            rows="4"
                                            className="w-full text-xs font-mono border-red-50 rounded-2xl bg-red-50/5 focus:ring-1 focus:ring-red-200 shadow-sm p-4 text-red-900"
                                        />
                                        <p className="mt-2 text-[9px] text-gray-400 leading-relaxed italic">Warning: PHP code is executed on the server before rendering. Use with caution.</p>
                                    </div>
                                </div>
                            </div>
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

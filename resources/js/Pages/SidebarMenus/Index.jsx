import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronRight, Menu, Save, X, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ menus, allMenus, parents }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [editingMenu, setEditingMenu] = useState(null);
    const [showFormModal, setShowFormModal] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState(new Set(menus.map(m => m.id)));

    const { delete: destroy, post, put, processing, data, setData, reset, errors } = useForm({
        name: '',
        route_name: '',
        icon: '',
        parent_id: '',
        permission_required: '',
        plugin_alias: '',
        order: 10,
        is_active: true
    });

    const toggleGroup = (id) => {
        const next = new Set(expandedGroups);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedGroups(next);
    };

    const handleCreateNew = () => {
        reset();
        setEditingMenu(null);
        setData(prev => ({
            ...prev,
            name: '',
            route_name: '',
            icon: 'LayoutGrid',
            parent_id: '',
            permission_required: '',
            plugin_alias: '',
            order: allMenus.length ? Math.max(...allMenus.map(m => m.order)) + 10 : 10,
            is_active: true
        }));
        setShowFormModal(true);
    };

    const handleEdit = (menu) => {
        setEditingMenu(menu);
        setData({
            name: menu.name,
            route_name: menu.route_name || '',
            icon: menu.icon || '',
            parent_id: menu.parent_id || '',
            permission_required: menu.permission_required || '',
            plugin_alias: menu.plugin_alias || '',
            order: menu.order,
            is_active: menu.is_active
        });
        setShowFormModal(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingMenu) {
            put(route('sidebar-menus.update', editingMenu.id), {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                }
            });
        } else {
            post(route('sidebar-menus.store'), {
                onSuccess: () => {
                    setShowFormModal(false);
                    reset();
                }
            });
        }
    };

    const confirmDelete = (menu) => {
        setMenuToDelete(menu);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (menuToDelete) {
            destroy(route('sidebar-menus.destroy', menuToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setMenuToDelete(null);
                },
            });
        }
    };

    const filterMenu = (item) => {
        return item.name.toLowerCase().includes(search.toLowerCase()) || 
            (item.route_name && item.route_name.toLowerCase().includes(search.toLowerCase()));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sidebar Menu Settings</h2>}
        >
            <Head title="Menu Management" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
                        <p className="text-gray-500 text-sm mt-1">Configure layout sidebar navigation tree, icons, permissions, and orders.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all"
                                placeholder="Search menus..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={handleCreateNew}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-semibold text-sm text-white hover:bg-indigo-700 hover:shadow-md transition-all duration-200"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Menu
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <div className="min-w-full divide-y divide-gray-100">
                            {/* Table Header */}
                            <div className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm flex items-center px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-150">
                                <div className="w-2/5">Menu Name & Icon</div>
                                <div className="w-1/4">Route Name</div>
                                <div className="w-1/6">Permission Key</div>
                                <div className="w-[80px] text-center">Order</div>
                                <div className="w-[80px] text-center">Active</div>
                                <div className="flex-1 text-right">Actions</div>
                            </div>

                            {/* Parent groups and items */}
                            <div className="divide-y divide-gray-100">
                                {menus.filter(parent => filterMenu(parent) || (parent.children && parent.children.some(filterMenu))).map((parent) => {
                                    const isExpanded = expandedGroups.has(parent.id);
                                    const hasChildren = parent.children && parent.children.length > 0;
                                    
                                    return (
                                        <div key={parent.id} className="flex flex-col">
                                            {/* Parent Row */}
                                            <div className="flex items-center px-6 py-4.5 hover:bg-gray-50/50 transition-colors group">
                                                <div className="w-2/5 flex items-center gap-3">
                                                    {hasChildren ? (
                                                        <button onClick={() => toggleGroup(parent.id)} className="p-1 hover:bg-gray-150 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors">
                                                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                        </button>
                                                    ) : (
                                                        <div className="w-6" />
                                                    )}
                                                    <span className="p-2 rounded-xl bg-indigo-50 border border-indigo-100/50 text-indigo-600">
                                                        <LayoutGrid size={16} />
                                                    </span>
                                                    <span className="font-bold text-gray-900 text-sm capitalize">{parent.name}</span>
                                                    {parent.plugin_alias && (
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-black uppercase tracking-wider scale-95">
                                                            {parent.plugin_alias}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-1/4 text-sm font-mono text-gray-500">{parent.route_name || '-'}</div>
                                                <div className="w-1/6 text-sm font-mono text-gray-400">{parent.permission_required || '-'}</div>
                                                <div className="w-[80px] text-center text-xs font-bold text-gray-500">{parent.order}</div>
                                                <div className="w-[80px] flex justify-center">
                                                    {parent.is_active ? (
                                                        <span className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full border border-emerald-100"><Eye size={14} /></span>
                                                    ) : (
                                                        <span className="text-gray-400 bg-gray-50 p-1.5 rounded-full border border-gray-150"><EyeOff size={14} /></span>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEdit(parent)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmDelete(parent)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Child rows */}
                                            {hasChildren && isExpanded && (
                                                <div className="bg-gray-50/20 divide-y divide-gray-100 border-t border-gray-50">
                                                    {parent.children.filter(filterMenu).map((child) => (
                                                        <div key={child.id} className="flex items-center px-6 py-4 hover:bg-gray-50/50 transition-colors group">
                                                            <div className="w-2/5 flex items-center gap-3 pl-8">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                                                <span className="font-semibold text-gray-700 text-sm">{child.name}</span>
                                                                {child.plugin_alias && (
                                                                    <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-black uppercase tracking-wider scale-95">
                                                                        {child.plugin_alias}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="w-1/4 text-sm font-mono text-gray-500">{child.route_name || '-'}</div>
                                                            <div className="w-1/6 text-sm font-mono text-gray-400">{child.permission_required || '-'}</div>
                                                            <div className="w-[80px] text-center text-xs font-bold text-gray-500">{child.order}</div>
                                                            <div className="w-[80px] flex justify-center">
                                                                {child.is_active ? (
                                                                    <span className="text-emerald-500 bg-emerald-50 p-1.5 rounded-full border border-emerald-100"><Eye size={14} /></span>
                                                                ) : (
                                                                    <span className="text-gray-400 bg-gray-50 p-1.5 rounded-full border border-gray-150"><EyeOff size={14} /></span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => handleEdit(child)}
                                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => confirmDelete(child)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {menus.length === 0 && (
                                    <div className="px-6 py-12 text-center text-gray-500">
                                        No menus configured yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <Menu className="text-indigo-600 w-5 h-5" />
                                {editingMenu ? 'Edit Menu Item' : 'New Menu Item'}
                            </h3>
                            <button onClick={() => setShowFormModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Menu Name (or translation key)</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500" 
                                    placeholder="e.g. settings"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Parent Menu</label>
                                    <select 
                                        value={data.parent_id || ''} 
                                        onChange={e => setData('parent_id', e.target.value)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold"
                                    >
                                        <option value="">-- No Parent (Root Group) --</option>
                                        {parents.filter(p => !editingMenu || p.id !== editingMenu.id).map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Icon (Lucide Icon name)</label>
                                    <input 
                                        type="text" 
                                        value={data.icon} 
                                        onChange={e => setData('icon', e.target.value)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono" 
                                        placeholder="e.g. Settings, Menu, Coins"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Route Name (Ziggy Name)</label>
                                    <input 
                                        type="text" 
                                        value={data.route_name} 
                                        onChange={e => setData('route_name', e.target.value)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono" 
                                        placeholder="e.g. pages.index"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Permission Required</label>
                                    <input 
                                        type="text" 
                                        value={data.permission_required} 
                                        onChange={e => setData('permission_required', e.target.value)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono" 
                                        placeholder="e.g. pages"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Associated Plugin</label>
                                    <input 
                                        type="text" 
                                        value={data.plugin_alias} 
                                        onChange={e => setData('plugin_alias', e.target.value)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500" 
                                        placeholder="e.g. Accounting"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sorting Order</label>
                                    <input 
                                        type="number" 
                                        value={data.order} 
                                        onChange={e => setData('order', parseInt(e.target.value) || 0)} 
                                        className="w-full text-sm border-gray-200 rounded-xl bg-gray-50 focus:ring-indigo-500/20 focus:border-indigo-500" 
                                        placeholder="10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${data.is_active ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.is_active ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <input type="checkbox" className="hidden" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} />
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Visible in Sidebar</span>
                                </label>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowFormModal(false)}
                                    className="px-5 py-2.5 bg-white hover:bg-gray-550 border border-gray-200 rounded-xl font-bold text-sm text-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Save Menu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Menu Item"
                message={`Are you sure you want to delete the menu item "${menuToDelete?.name}"? If this is a parent menu, its children will be detached to root level.`}
                processing={processing}
            />
        </AuthenticatedLayout>
    );
}

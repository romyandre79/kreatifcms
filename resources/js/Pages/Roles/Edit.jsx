import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft, Save, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Edit({ role, contentTypes, plugins = [] }) {
    const [activeTab, setActiveTab] = useState('Collection Types');

    const tabs = [
        'Collection Types',
        'Single Types',
        'Plugins',
        'Settings'
    ];

    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'PUBLISH'];

    // Initialize permissions state
    const initialPermissions = [];
    
    // Helper to check if role has permission
    const hasPermission = (contentType, action) => {
        return role.permissions?.some(p => p.content_type === contentType && p.action === action.toLowerCase() && p.enabled);
    };

    // Prepare initial state for collections and singles
    contentTypes.forEach(ct => {
        actions.forEach(action => {
            initialPermissions.push({
                name: ct.type === 'Collection' ? 'Collection Types' : 'Single Types',
                content_type: ct.slug,
                action: action.toLowerCase(),
                enabled: hasPermission(ct.slug, action)
            });
        });
    });

    // Add dynamic permissions for Plugins (including core subjects)
    const pluginSubjects = [
        { name: 'Permissions', slug: 'permissions' },
        { name: 'Roles', slug: 'roles' },
        { name: 'Users', slug: 'users' },
        { name: 'Pages', slug: 'pages' },
        { name: 'Media', slug: 'media' },
        ...plugins.map(p => ({ 
            name: p.name, 
            slug: p.alias 
        }))
    ];

    pluginSubjects.forEach(subject => {
        actions.forEach(action => {
            initialPermissions.push({
                name: 'Plugins',
                content_type: subject.slug,
                action: action.toLowerCase(),
                enabled: hasPermission(subject.slug, action)
            });
        });
    });

    const { data, setData, put, processing, errors } = useForm({
        name: role.name || '',
        description: role.description || '',
        permissions: initialPermissions
    });

    const togglePermission = (contentType, action) => {
        const newPermissions = data.permissions.map(p => {
            if (p.content_type === contentType && p.action === action.toLowerCase()) {
                return { ...p, enabled: !p.enabled };
            }
            return p;
        });
        setData('permissions', newPermissions);
    };

    const isPermissionEnabled = (contentType, action) => {
        return data.permissions.find(p => p.content_type === contentType && p.action === action.toLowerCase())?.enabled;
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    const currentContentTypes = contentTypes.filter(ct => {
        if (activeTab === 'Collection Types') return ct.type === 'collection' || !ct.type;
        if (activeTab === 'Single Types') return ct.type === 'single';
        return false;
    });

    const displaySubjects = activeTab === 'Plugins' ? pluginSubjects : [];

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Role - ${role.name}`} />

            <div className="py-2 pb-20">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <Link 
                            href={route('roles.index')}
                            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors gap-2 text-xs font-semibold"
                        >
                            <ChevronLeft size={14} />
                            Back
                        </Link>
                    </div>

                    <form onSubmit={submit}>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">Edit a role</h1>
                                <p className="text-gray-500">Define the rights given to the role</p>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                                <Check size={18} />
                                Save
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{data.name || 'New Role'}</h2>
                                    <p className="text-gray-500 text-sm mt-1">
                                        {role.users_count || 0} user{role.users_count !== 1 ? 's' : ''} with this role
                                    </p>
                                </div>
                                <div className="bg-gray-50 px-3 py-1 rounded text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">
                                    Role Details
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all text-sm"
                                        placeholder="e.g. Editor"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full bg-gray-50/50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all min-h-[44px] text-sm"
                                        placeholder="Describe the role's responsibilities"
                                        rows="1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="flex border-b border-gray-100 bg-gray-50/50">
                                {tabs.map(tab => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 py-4 text-sm font-semibold transition-all relative ${
                                            activeTab === tab 
                                            ? 'text-indigo-600 bg-white' 
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/30'
                                        }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-4 w-1/3"></th>
                                            {actions.map(action => (
                                                <th key={action} className="px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                    {action}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(activeTab === 'Collection Types' || activeTab === 'Single Types') && currentContentTypes.map(ct => (
                                            <tr key={ct.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox"
                                                            checked={actions.every(action => isPermissionEnabled(ct.slug, action))}
                                                            onChange={(e) => {
                                                                 const checked = e.target.checked;
                                                                 const newPermissions = data.permissions.map(p => {
                                                                     if (p.content_type === ct.slug) {
                                                                         return { ...p, enabled: checked };
                                                                     }
                                                                     return p;
                                                                 });
                                                                 setData('permissions', newPermissions);
                                                            }}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 transition-all h-4 w-4"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-700">{ct.name}</span>
                                                    </div>
                                                </td>
                                                {actions.map(action => (
                                                    <td key={action} className="px-4 py-4 text-center">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isPermissionEnabled(ct.slug, action)}
                                                            onChange={() => togglePermission(ct.slug, action)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 transition-all h-5 w-5 cursor-pointer"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}

                                        {activeTab === 'Plugins' && pluginSubjects.map(subject => (
                                            <tr key={subject.slug} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox"
                                                            checked={actions.every(action => isPermissionEnabled(subject.slug, action))}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const newPermissions = data.permissions.map(p => {
                                                                    if (p.content_type === subject.slug) {
                                                                        return { ...p, enabled: checked };
                                                                    }
                                                                    return p;
                                                                });
                                                                setData('permissions', newPermissions);
                                                            }}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 transition-all h-4 w-4"
                                                        />
                                                        <span className="text-sm font-semibold text-gray-700">{subject.name}</span>
                                                    </div>
                                                </td>
                                                {actions.map(action => (
                                                    <td key={action} className="px-4 py-4 text-center">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isPermissionEnabled(subject.slug, action)}
                                                            onChange={() => togglePermission(subject.slug, action)}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500/20 transition-all h-5 w-5 cursor-pointer"
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}

                                        {activeTab === 'Settings' && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-16 text-center">
                                                    <p className="text-gray-400 text-sm italic font-medium">
                                                        Settings permissions management will be implemented as plugin logic expands.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    Save, 
    ChevronLeft, 
    Plus, 
    Trash2, 
    Settings, 
    Code, 
    FileCode, 
    Shield, 
    Eye, 
    EyeOff,
    Search,
    AlignLeft,
    AlignCenter,
    AlignRight
} from 'lucide-react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Editor({ dataGrid, contentTypes, roles }) {
    const isEditing = !!dataGrid;

    const { data, setData, post, put, processing, errors } = useForm({
        name: dataGrid?.name || '',
        slug: dataGrid?.slug || '',
        content_type_id: dataGrid?.content_type_id || '',
        settings: dataGrid?.settings || { columns: [], pagination: { perPage: 15 } },
        buttons: dataGrid?.buttons || []
    });

    const [selectedContentType, setSelectedContentType] = useState(null);

    useEffect(() => {
        if (data.content_type_id) {
            const ct = contentTypes.find(c => c.id === parseInt(data.content_type_id));
            setSelectedContentType(ct);
            
            // If new or changed content type, initialize columns
            if (!isEditing || data.content_type_id !== dataGrid.content_type_id) {
                if (ct) {
                    const initialCols = ct.fields.map(f => ({
                        field: f.attribute_name,
                        label: f.name,
                        visible: true,
                        type: f.type
                    }));
                    // Add standard timestamp columns
                    initialCols.push({ field: 'created_at', label: 'Created At', visible: true, type: 'datetime' });
                    setData('settings', { ...data.settings, columns: initialCols });
                }
            }
        }
    }, [data.content_type_id]);

    const handleSave = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('datagrids.update', dataGrid.id));
        } else {
            post(route('datagrids.store'));
        }
    };

    const toggleColumnVisibility = (index) => {
        const newCols = [...data.settings.columns];
        newCols[index].visible = !newCols[index].visible;
        setData('settings', { ...data.settings, columns: newCols });
    };

    const updateColumnLabel = (index, label) => {
        const newCols = [...data.settings.columns];
        newCols[index].label = label;
        setData('settings', { ...data.settings, columns: newCols });
    };

    const updateColumnSummaryType = (index, type) => {
        const newCols = [...data.settings.columns];
        newCols[index].summary_type = type;
        setData('settings', { ...data.settings, columns: newCols });
    };

    const updateColumnAlignment = (index, align) => {
        const newCols = [...data.settings.columns];
        newCols[index].align = align;
        setData('settings', { ...data.settings, columns: newCols });
    };

    const addButton = () => {
        const newButtons = [...data.buttons, { 
            label: 'New Action', 
            icon: 'Settings', 
            css: 'text-indigo-600 hover:bg-indigo-50', 
            js: '', 
            php: '',
            action_id: '',
            roles: [] 
        }];
        setData('buttons', newButtons);
    };

    const updateButton = (index, field, value) => {
        const newButtons = [...data.buttons];
        newButtons[index][field] = value;
        setData('buttons', newButtons);
    };

    const removeButton = (index) => {
        const newButtons = data.buttons.filter((_, i) => i !== index);
        setData('buttons', newButtons);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href={route('datagrids.index')} className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow">
                            <ChevronLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            {isEditing ? `Edit Grid: ${dataGrid.name}` : 'Create New Datagrid'}
                        </h2>
                    </div>
                    <PrimaryButton onClick={handleSave} disabled={processing}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Grid Config
                    </PrimaryButton>
                </div>
            }
        >
            <Head title={isEditing ? 'Edit DataGrid' : 'Create DataGrid'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- Basic Config --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Settings className="w-5 h-5 mr-3 text-indigo-500" />
                            General Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <InputLabel htmlFor="name" value="Grid Name" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Sales Dashboard Table"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="slug" value="Grid Slug (Unique)" />
                                <TextInput
                                    id="slug"
                                    className="mt-1 block w-full"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="e.g., sales-table"
                                />
                                <InputError message={errors.slug} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="icon" value="Grid Icon (Lucide Name)" />
                                <TextInput
                                    id="icon"
                                    className="mt-1 block w-full font-mono text-xs"
                                    value={data.settings.icon || ''}
                                    onChange={(e) => setData('settings', { ...data.settings, icon: e.target.value })}
                                    placeholder="e.g., Users, LayoutGrid, Package"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="footer_text" value="Records Found Label" />
                                <TextInput
                                    id="footer_text"
                                    className="mt-1 block w-full"
                                    value={data.settings.footer_text || ''}
                                    onChange={(e) => setData('settings', { ...data.settings, footer_text: e.target.value })}
                                    placeholder="e.g., Records Found, Items Total"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="content_type_id" value="Source Content Type" />
                                <select
                                    id="content_type_id"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.content_type_id}
                                    onChange={(e) => setData('content_type_id', e.target.value)}
                                    disabled={isEditing}
                                >
                                    <option value="">Select a Content Type</option>
                                    {contentTypes.map(ct => (
                                        <option key={ct.id} value={ct.id}>{ct.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.content_type_id} className="mt-2" />
                            </div>
                        </div>
                    </div>

                    {/* --- Columns Config --- */}
                    {selectedContentType && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                <LayoutGrid className="w-5 h-5 mr-3 text-emerald-500" />
                                Column Management
                            </h3>
                            <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Field</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Display Label</th>
                                            <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Visible</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Summary</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Align</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                        {data.settings.columns.map((col, idx) => (
                                            <tr key={idx} className={col.visible ? '' : 'bg-gray-50/50'}>
                                                <td className="px-6 py-4 text-sm font-mono text-gray-600">{col.field}</td>
                                                <td className="px-6 py-4">
                                                    <TextInput 
                                                        value={col.label} 
                                                        onChange={(e) => updateColumnLabel(idx, e.target.value)}
                                                        className="w-full text-sm"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        type="button"
                                                        onClick={() => toggleColumnVisibility(idx)}
                                                        className={`p-2 rounded-lg transition-colors ${col.visible ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 bg-gray-100'}`}
                                                    >
                                                        {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{col.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                        value={col.summary_type || 'none'}
                                                        onChange={(e) => updateColumnSummaryType(idx, e.target.value)}
                                                    >
                                                        <option value="none">None</option>
                                                        <option value="sum">Sum</option>
                                                        <option value="avg">Avg</option>
                                                        <option value="count">Count</option>
                                                        <option value="min">Min</option>
                                                        <option value="max">Max</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
                                                        {[
                                                            { val: 'left', icon: AlignLeft },
                                                            { val: 'center', icon: AlignCenter },
                                                            { val: 'right', icon: AlignRight },
                                                        ].map(opt => (
                                                            <button
                                                                key={opt.val}
                                                                type="button"
                                                                onClick={() => updateColumnAlignment(idx, opt.val)}
                                                                className={`p-1.5 rounded-md transition-all ${(!col.align && opt.val === 'left') || col.align === opt.val ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                            >
                                                                <opt.icon size={14} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- Custom Buttons --- */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                <Plus className="w-5 h-5 mr-3 text-purple-500" />
                                Custom Interactive Buttons
                            </h3>
                            <button 
                                type="button"
                                onClick={addButton}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Button
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {data.buttons.map((btn, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-xl p-6 bg-gray-50/30 relative">
                                    <button 
                                        onClick={() => removeButton(idx)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div>
                                            <InputLabel value="Button Label" />
                                            <TextInput 
                                                value={btn.label} 
                                                onChange={(e) => updateButton(idx, 'label', e.target.value)}
                                                className="mt-1 w-full"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="CSS Classes" />
                                            <TextInput 
                                                value={btn.css} 
                                                onChange={(e) => updateButton(idx, 'css', e.target.value)}
                                                className="mt-1 w-full text-xs font-mono"
                                                placeholder="e.g., text-indigo-600 hover:bg-indigo-50"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Action Permission (Slug)" />
                                            <TextInput 
                                                value={btn.action_id} 
                                                onChange={(e) => updateButton(idx, 'action_id', e.target.value)}
                                                className="mt-1 w-full text-xs font-mono font-bold"
                                                placeholder="e.g., publish, delete, update"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <InputLabel className="flex items-center">
                                                <FileCode className="w-4 h-4 mr-2 text-indigo-400" />
                                                Client Javascript
                                            </InputLabel>
                                            <textarea 
                                                className="w-full bg-slate-900 text-indigo-300 p-4 rounded-lg font-mono text-xs border-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                                value={btn.js}
                                                onChange={(e) => updateButton(idx, 'js', e.target.value)}
                                                placeholder="alert('Clicked ' + item.id);"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <InputLabel className="flex items-center">
                                                <Code className="w-4 h-4 mr-2 text-rose-400" />
                                                Server PHP Logic
                                            </InputLabel>
                                            <textarea 
                                                className="w-full bg-slate-900 text-rose-200 p-4 rounded-lg font-mono text-xs border-none focus:ring-2 focus:ring-rose-500 min-h-[120px]"
                                                value={btn.php}
                                                onChange={(e) => updateButton(idx, 'php', e.target.value)}
                                                placeholder="Log::info('Deleted entry ' . $id); return ['status' => 'success'];"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <InputLabel className="flex items-center mb-2">
                                            <Shield className="w-4 h-4 mr-2 text-amber-400" />
                                            Target Roles (Authorized to see this button)
                                        </InputLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map(role => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = btn.roles || [];
                                                        const next = current.includes(role.id) 
                                                            ? current.filter(rid => rid !== role.id)
                                                            : [...current, role.id];
                                                        updateButton(idx, 'roles', next);
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                                                        (btn.roles || []).includes(role.id)
                                                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                            : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {role.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {data.buttons.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
                                    <p className="text-sm text-gray-400 italic">No buttons added yet. Click "Add Button" to create interactive actions.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

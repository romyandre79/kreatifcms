import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Layout, Database, BarChart3, Calculator, Palette } from 'lucide-react';

export default function WidgetEditor({ show, onClose, onSave, widget = null, contentTypes = [] }) {
    const [formData, setFormData] = useState({
        type: 'stats',
        content_type_id: '',
        aggregate_function: 'count',
        aggregate_field: '',
        group_by_field: '',
        width: 4,
        settings: {
            title: '',
            chartType: 'bar',
            color: '#6366f1'
        }
    });

    useEffect(() => {
        if (widget) {
            setFormData({
                ...widget,
                content_type_id: widget.content_type_id || '',
                settings: {
                    title: widget.settings?.title || '',
                    chartType: widget.settings?.chartType || 'bar',
                    color: widget.settings?.color || '#6366f1'
                }
            });
        } else {
            setFormData({
                type: 'stats',
                content_type_id: '',
                aggregate_function: 'count',
                aggregate_field: '',
                group_by_field: '',
                width: 4,
                settings: {
                    title: '',
                    chartType: 'bar',
                    color: '#6366f1'
                }
            });
        }
    }, [widget, show]);

    const selectedContentType = contentTypes.find(t => t.id == formData.content_type_id);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Layout className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {widget ? 'Edit Widget' : 'Add New Widget'}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium italic">Configure your dynamic data visualization</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <InputLabel value="Widget Title" />
                            <TextInput 
                                className="w-full"
                                value={formData.settings.title}
                                onChange={e => setFormData({
                                    ...formData, 
                                    settings: { ...formData.settings, title: e.target.value }
                                })}
                                placeholder="e.g. Total Customers"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <InputLabel value="Widget Type" />
                            <select 
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="stats">Stats Counter</option>
                                <option value="chart">Data Chart</option>
                            </select>
                        </div>
                    </div>

                    {/* Data Source */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-widest">
                            <Database className="w-3.5 h-3.5 text-indigo-500" />
                            Data Source
                        </div>
                        
                        <div className="space-y-1.5">
                            <InputLabel value="Select Content Type" />
                            <select 
                                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                value={formData.content_type_id}
                                onChange={e => setFormData({ ...formData, content_type_id: e.target.value })}
                                required
                            >
                                <option value="">Choose a type...</option>
                                {contentTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        {formData.type === 'stats' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <InputLabel value="Aggregation" />
                                    <select 
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={formData.aggregate_function}
                                        onChange={e => setFormData({ ...formData, aggregate_function: e.target.value })}
                                    >
                                        <option value="count">Count Entries</option>
                                        <option value="sum">Sum Values</option>
                                        <option value="avg">Average Value</option>
                                        <option value="min">Minimum Value</option>
                                        <option value="max">Maximum Value</option>
                                    </select>
                                </div>
                                {formData.aggregate_function !== 'count' && (
                                    <div className="space-y-1.5">
                                        <InputLabel value="Field to Calculate" />
                                        <select 
                                            className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                            value={formData.aggregate_field}
                                            onChange={e => setFormData({ ...formData, aggregate_field: e.target.value })}
                                            required
                                        >
                                            <option value="">Select field...</option>
                                            {selectedContentType?.fields?.map(f => (
                                                <option key={f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {formData.type === 'chart' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <InputLabel value="Chart Type" />
                                    <select 
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={formData.settings.chartType}
                                        onChange={e => setFormData({ 
                                            ...formData, 
                                            settings: { ...formData.settings, chartType: e.target.value }
                                        })}
                                    >
                                        <option value="bar">Bar Chart</option>
                                        <option value="line">Line Chart</option>
                                        <option value="pie">Pie Chart</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <InputLabel value="Group By (Subgroup)" />
                                    <select 
                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        value={formData.group_by_field}
                                        onChange={e => setFormData({ ...formData, group_by_field: e.target.value })}
                                    >
                                        <option value="">Date (Default)</option>
                                        {selectedContentType?.fields?.map(f => (
                                            <option key={f.id} value={f.name.toLowerCase().replace(/ /g, '_')}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Appearance */}
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-widest">
                            <Palette className="w-3.5 h-3.5 text-pink-500" />
                            Appearance (Layout)
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <InputLabel value="Widget Width (Grid)" />
                                <select 
                                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                    value={formData.width}
                                    onChange={e => setFormData({ ...formData, width: parseInt(e.target.value) })}
                                >
                                    <option value={3}>Small (1/4)</option>
                                    <option value={4}>Medium (1/3)</option>
                                    <option value={6}>Large (1/2)</option>
                                    <option value={12}>Full Width</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <InputLabel value="Theme Color" />
                                <input 
                                    type="color"
                                    className="w-full h-9 p-1 rounded-md border border-gray-300 bg-white"
                                    value={formData.settings.color}
                                    onChange={e => setFormData({
                                        ...formData, 
                                        settings: { ...formData.settings, color: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-3 border-t border-gray-100 pt-6">
                    <SecondaryButton onClick={onClose} type="button">
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton type="submit">
                        {widget ? 'Update Widget' : 'Create Widget'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}

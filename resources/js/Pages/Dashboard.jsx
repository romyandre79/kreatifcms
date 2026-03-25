import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, Layout } from 'lucide-react';
import axios from 'axios';
import DashboardGrid from '@/Components/Dashboard/DashboardGrid';
import WidgetEditor from '@/Components/Dashboard/WidgetEditor';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Dashboard() {
    const { contentTypes } = usePage().props;
    const [widgets, setWidgets] = useState([]);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Deletion Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [widgetToDelete, setWidgetToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchWidgets();
    }, []);

    const fetchWidgets = async () => {
        try {
            const response = await axios.get(route('dashboard.widgets.index'));
            setWidgets(response.data);
        } catch (error) {
            console.error('Failed to fetch widgets', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddWidget = () => {
        setEditingWidget(null);
        setIsEditorOpen(true);
    };

    const handleEditWidget = (widget) => {
        setEditingWidget(widget);
        setIsEditorOpen(true);
    };

    const handleSaveWidget = async (formData) => {
        try {
            if (editingWidget) {
                await axios.put(route('dashboard.widgets.update', editingWidget.id), formData);
            } else {
                await axios.post(route('dashboard.widgets.store'), formData);
            }
            setIsEditorOpen(false);
            fetchWidgets();
        } catch (error) {
            console.error('Failed to save widget', error);
        }
    };

    const confirmDeleteWidget = (id) => {
        setWidgetToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (widgetToDelete) {
            setIsDeleting(true);
            try {
                await axios.delete(route('dashboard.widgets.destroy', widgetToDelete));
                fetchWidgets();
                setShowDeleteModal(false);
                setWidgetToDelete(null);
            } catch (error) {
                console.error('Failed to delete widget', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleOrderChange = async (newOrder) => {
        // Optimistic update
        const orderedWidgets = [...widgets].sort((a, b) => 
            newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
        );
        setWidgets(orderedWidgets);

        try {
            // Bulk update order (simplified for now as individual updates)
            await Promise.all(newOrder.map((id, index) => 
                axios.put(route('dashboard.widgets.update', id), { order: index })
            ));
        } catch (error) {
            console.error('Failed to update widget order', error);
            fetchWidgets(); // Sync back on error
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Dynamic Dashboard
                    </h2>
                    <button
                        onClick={handleAddWidget}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 transition-all shadow-sm shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Widget
                    </button>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-gray-400 italic">Initializing your premium workspace...</p>
                        </div>
                    ) : widgets.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-24 text-center">
                            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Layout className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Your dashboard is empty</h3>
                            <p className="mt-2 text-gray-500 max-w-sm mx-auto italic font-medium">
                                Start by adding dynamic widgets to track your content types, aggregate data, and visualize trends!
                            </p>
                            <button
                                onClick={handleAddWidget}
                                className="mt-8 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Your First Widget
                            </button>
                        </div>
                    ) : (
                        <DashboardGrid 
                            widgets={widgets} 
                            onOrderChange={handleOrderChange}
                            onEdit={handleEditWidget}
                            onDelete={confirmDeleteWidget}
                        />
                    )}
                </div>
            </div>

            <WidgetEditor
                show={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={handleSaveWidget}
                widget={editingWidget}
                contentTypes={contentTypes}
            />

            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Remove Widget"
                message="Are you sure you want to remove this widget from your dashboard? This action will only remove the widget, not the underlying data."
                processing={isDeleting}
            />
        </AuthenticatedLayout>
    );
}

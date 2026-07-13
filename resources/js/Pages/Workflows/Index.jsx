import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Play, Trash2, Edit3, GitBranch, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle } from 'lucide-react';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';

export default function Index({ workflows }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [workflowToDelete, setWorkflowToDelete] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const activeWorkflowsCount = workflows.filter(w => w.is_active).length;

    const handleCreateWorkflow = (e) => {
        e.preventDefault();
        post(route('workflows.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const confirmDelete = (workflow) => {
        setWorkflowToDelete(workflow);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (workflowToDelete) {
            const form = useForm();
            form.delete(route('workflows.destroy', workflowToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setWorkflowToDelete(null);
                }
            });
        }
    };

    const toggleWorkflowStatus = (workflow) => {
        const form = useForm();
        form.put(route('workflows.update', workflow.id), {
            is_active: !workflow.is_active
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold leading-tight text-gray-900 flex items-center gap-2">
                            <GitBranch className="w-6 h-6 text-indigo-600" />
                            Workflows
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">Manage and automate processes with drag-and-drop actions</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-100 flex gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Create Workflow
                    </button>
                </div>
            }
        >
            <Head title="Workflows" />

            <div className="space-y-6">
                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Total Workflows</p>
                            <h3 className="text-2xl font-bold text-gray-900">{workflows.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Active Automated</p>
                            <h3 className="text-2xl font-bold text-gray-900">{activeWorkflowsCount}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Play className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-400">Status</p>
                            <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider">Engine Idle</h3>
                        </div>
                    </div>
                </div>

                {/* Workflow Cards List */}
                {workflows.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <GitBranch className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No workflows defined yet</h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto italic font-medium">
                            Create your first automation workflow. Drag components like Webhooks, conditions, and Slack/Email triggers.
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-8 inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Build Your First Workflow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => {
                            const nodeCount = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;
                            const connectionCount = Array.isArray(workflow.connections) ? workflow.connections.length : 0;

                            return (
                                <div key={workflow.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                                <GitBranch className="w-5 h-5" />
                                            </div>
                                            <button
                                                onClick={() => toggleWorkflowStatus(workflow)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                                                    workflow.is_active 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                                                        : 'bg-gray-100 text-gray-500 border border-gray-200/50'
                                                }`}
                                            >
                                                {workflow.is_active ? (
                                                    <>
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{workflow.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2 h-10">{workflow.description || 'No description provided.'}</p>
                                        
                                        <div className="flex gap-4 mb-6 text-xs font-semibold text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div>
                                                Nodes: <span className="text-gray-700 font-bold">{nodeCount}</span>
                                            </div>
                                            <div>
                                                Connections: <span className="text-gray-700 font-bold">{connectionCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-2">
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('workflows.edit', workflow.id)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Edit workflow builder"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => confirmDelete(workflow)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Delete workflow"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <Link
                                            href={route('workflows.edit', workflow.id)}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                                        >
                                            Open Builder
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsCreateModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                            <form onSubmit={handleCreateWorkflow}>
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                            <GitBranch className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Create Workflow</h3>
                                            <p className="text-xs text-gray-400 font-medium">Define a name and description to begin editing</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Workflow Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. User Welcome Sequence"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm text-gray-800 placeholder-gray-400 transition-all"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Describe the trigger and goals of this automation"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-sm text-gray-800 placeholder-gray-400 transition-all"
                                            ></textarea>
                                            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                                    >
                                        Create & Build
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <DeleteConfirmationModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Workflow"
                message={`Are you sure you want to delete the workflow "${workflowToDelete?.name}"? This action cannot be undone.`}
            />
        </AuthenticatedLayout>
    );
}

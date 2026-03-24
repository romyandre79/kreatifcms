import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { Activity, Play, Trash2, AlertCircle, CheckCircle2, Clock, Calendar, Plus, Edit2, Code } from 'lucide-react';

export default function Index({ auth, jobs, failedJobs, scheduledJobs }) {
    const [activeTab, setActiveTab] = useState('background');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    const { post, processing } = useForm();
    
    const { data, setData, post: postJob, put: putJob, delete: deleteJob, processing: processingJob, reset } = useForm({
        name: '',
        command_code: '',
        type: 'php',
        cron: '* * * * *',
        is_active: true,
    });

    const handleDispatch = () => {
        post(route('jobmanager.dispatch'));
    };

    const openCreateModal = () => {
        setEditingJob(null);
        reset();
        setIsModalOpen(true);
    };

    const openEditModal = (job) => {
        setEditingJob(job);
        setData({
            name: job.name,
            command_code: job.command_code,
            type: job.type,
            cron: job.cron,
            is_active: !!job.is_active,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingJob) {
            putJob(route('jobmanager.scheduled.update', editingJob.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            postJob(route('jobmanager.scheduled.store'), {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this scheduled task?')) {
            deleteJob(route('jobmanager.scheduled.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<div className="flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-600" /> <span>Job Manager</span></div>}
        >
            <Head title="Job Manager" />

            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('background')}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'background' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Background Jobs
                    </button>
                    <button
                        onClick={() => setActiveTab('scheduled')}
                        className={`pb-4 px-2 text-sm font-bold transition-all ${activeTab === 'scheduled' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Scheduled Tasks
                    </button>
                </div>

                {activeTab === 'background' ? (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Queue Management</h2>
                                <p className="text-sm text-gray-500 mt-1">Monitor and trigger background asynchronous tasks.</p>
                            </div>
                            <button
                                onClick={handleDispatch}
                                disabled={processing}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                {processing ? 'Dispatching...' : 'Trigger Sample Job'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Active Jobs Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                    <h3 className="font-bold text-gray-800">Pending Jobs ({jobs.length})</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Queue</th>
                                                <th className="px-6 py-4">Attempts</th>
                                                <th className="px-6 py-4 text-right">Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {jobs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No pending jobs in the queue.</td>
                                                </tr>
                                            ) : (
                                                jobs.map((job) => (
                                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{job.id}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <span className="px-2 py-1 bg-gray-100 rounded-md">{job.queue}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{job.attempts}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 text-right">{new Date(job.created_at * 1000).toLocaleString()}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Failed Jobs Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <h3 className="font-bold text-gray-800">Failed Jobs ({failedJobs.length})</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Connection</th>
                                                <th className="px-6 py-4">Failed At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {failedJobs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">No failed jobs recorded.</td>
                                                </tr>
                                            ) : (
                                                failedJobs.map((fjob) => (
                                                    <tr key={fjob.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-red-600">#{fjob.id}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{fjob.connection}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{fjob.failed_at}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Scheduled Tasks</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure recurring jobs and automated scripts.</p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Name</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Frequency (Cron)</th>
                                            <th className="px-6 py-4">Last Run</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {scheduledJobs.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">No scheduled tasks defined.</td>
                                            </tr>
                                        ) : (
                                            scheduledJobs.map((sjob) => (
                                                <tr key={sjob.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        {sjob.is_active ? (
                                                            <div className="flex items-center text-green-600 text-xs font-bold">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                                                                Active
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center text-gray-400 text-xs font-bold">
                                                                <div className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
                                                                Paused
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-bold text-gray-900">{sjob.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sjob.type === 'php' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
                                                            {sjob.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{sjob.cron}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {sjob.last_run_at ? new Date(sjob.last_run_at).toLocaleString() : 'Never'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => openEditModal(sjob)}
                                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(sjob.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Modals and Info Cards omit for brevity in replace_file_content if too long, else include */}
            </div>

            {/* Modal for Create/Edit Scheduled Task */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {editingJob ? 'Edit Scheduled Task' : 'Add New Scheduled Task'}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Task Name</label>
                            <input 
                                type="text"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full rounded-xl border-gray-200 focus:ring-indigo-500 focus:border-indigo-600"
                                placeholder="e.g. Daily Cleanup"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                <select 
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 focus:ring-indigo-500"
                                >
                                    <option value="php">Inline PHP Code</option>
                                    <option value="artisan">Artisan Command</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Cron Expression</label>
                                <input 
                                    type="text"
                                    value={data.cron}
                                    onChange={e => setData('cron', e.target.value)}
                                    className="w-full rounded-xl border-gray-200 font-mono text-sm"
                                    placeholder="* * * * *"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                {data.type === 'php' ? 'PHP Code (Strictly no <?php tag)' : 'Artisan Command'}
                            </label>
                            <div className="relative">
                                <textarea 
                                    value={data.command_code}
                                    onChange={e => setData('command_code', e.target.value)}
                                    rows="6"
                                    className="w-full rounded-xl border-gray-200 font-mono text-sm bg-gray-50 p-4"
                                    placeholder={data.type === 'php' ? "\\Illuminate\\Support\Facades\\Log::info('Hello from UI');" : "inspire"}
                                    required
                                />
                                <Code className="absolute top-3 right-3 w-4 h-4 text-gray-400" />
                            </div>
                            {data.type === 'php' && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Use fully qualified namespaces for classes. Errors will be logged.
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                id="is_active"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Enable this task</label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processingJob}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                        >
                            {processingJob ? 'Saving...' : (editingJob ? 'Update Task' : 'Save Task')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Global Info Card at Footer */}
            <div className="mt-8 bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900">Automation Engine Status</h4>
                    <p className="text-sm text-indigo-700 mt-1">
                        PHP and Artisan commands directly from the UI require your server cron to be active.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <code className="p-2 bg-indigo-900 text-indigo-100 rounded-lg text-xs font-mono">
                            php artisan queue:work
                        </code>
                        <code className="p-2 bg-indigo-900 text-indigo-100 rounded-lg text-xs font-mono">
                            php artisan schedule:work
                        </code>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

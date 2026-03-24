import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Activity, Play, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function Index({ auth, jobs, failedJobs }) {
    const { post, processing } = useForm();

    const handleDispatch = () => {
        post(route('jobmanager.dispatch'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<div className="flex items-center gap-2"><Activity className="w-6 h-6 text-indigo-600" /> <span>Job Manager</span></div>}
        >
            <Head title="Job Manager" />

            <div className="space-y-6">
                {/* Actions Header */}
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

                {/* Info Card */}
                <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-indigo-900">Queue Worker Status</h4>
                        <p className="text-sm text-indigo-700 mt-1">
                            Make sure your queue worker is running to process these jobs. On your server, run:
                        </p>
                        <code className="block mt-3 p-3 bg-indigo-900 text-indigo-100 rounded-xl text-xs font-mono">
                            php artisan queue:work
                        </code>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

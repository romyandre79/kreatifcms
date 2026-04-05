import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { RefreshCcw, Download, CheckCircle2, AlertCircle, Terminal, Clock, GitBranch, Hash } from 'lucide-react';

export default function Update({ info }) {
    const [log, setLog] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateInfo, setUpdateInfo] = useState(info);

    const checkUpdates = () => {
        setIsUpdating(true); // Re-use loading state
        axios.post(route('system.update.check')).then(res => {
            if (res.data.success) {
                setUpdateInfo(res.data.info);
            }
            setIsUpdating(false);
        }).catch(err => {
            console.error('Check Failed:', err);
            const errorMsg = err.response?.data?.error || err.message;
            const suggestion = err.response?.data?.suggestion;

            setLog(prev => [...prev, { 
                step: 'Network Check', 
                command: 'Checking GitHub Connection...', 
                output: suggestion ? `${errorMsg}\n\n💡 Suggestion: ${suggestion}` : errorMsg, 
                status: 'error' 
            }]);
            setIsUpdating(false);
        });
    };

    const runUpdate = () => {
        if (!confirm('Are you sure you want to run the update? Local changes might be overwritten.')) return;
        
        setIsUpdating(true);
        setLog([{ step: 'Initializing', command: 'Starting update process...', output: 'Please wait...', status: 'success' }]);

        axios.post(route('system.update.run')).then(res => {
            setLog(res.data.log);
            setUpdateInfo(res.data.info);
            setIsUpdating(false);
        }).catch(err => {
            setLog(prev => [...prev, { 
                step: 'Error', 
                command: 'System Update Failed', 
                output: err.response?.data?.error || err.message, 
                status: 'error' 
            }]);
            setIsUpdating(false);
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">System Update</h2>}
        >
            <Head title="System Update" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <GitBranch className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Branch</p>
                            <p className="text-lg font-bold text-gray-900">{updateInfo.current_branch || 'main'}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                            <Hash className="w-6 h-6" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Commit</p>
                            <p className="text-sm font-mono font-bold text-gray-900 truncate">{updateInfo.current_commit?.substring(0, 10)}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${updateInfo.is_up_to_date ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                            {updateInfo.is_up_to_date ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                            <p className="text-lg font-bold text-gray-900">
                                {updateInfo.is_up_to_date ? 'Up to Date' : `${updateInfo.behind_count} Commits Behind`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-[40px] p-8 shadow-2xl shadow-indigo-100/20 border border-indigo-50/50 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">KreatifCMS Core Update</h3>
                            <p className="text-gray-500 max-w-xl">
                                Keep your system secure and up-to-date with latest features and bug fixes from the official repository.
                            </p>
                            <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last Checked: {updateInfo.last_checked}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button
                                onClick={checkUpdates}
                                disabled={isUpdating}
                                className="px-6 py-3 bg-white border-2 border-indigo-100 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all flex items-center gap-2"
                            >
                                <RefreshCcw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                                Check
                            </button>
                            <button
                                onClick={runUpdate}
                                disabled={isUpdating || updateInfo.is_up_to_date}
                                className={`px-8 py-3 font-bold rounded-2xl shadow-xl transition-all flex items-center gap-2 ${
                                    updateInfo.is_up_to_date 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
                                }`}
                            >
                                <Download className="w-5 h-5" />
                                Update Now
                            </button>
                        </div>
                    </div>

                    {/* Gradient Decorations */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 opacity-[0.03] rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 opacity-[0.03] rounded-full blur-3xl -ml-32 -mb-32" />
                </div>

                {/* Log / Terminal Output */}
                {(log.length > 0 || isUpdating) && (
                    <div className="bg-gray-900 rounded-[40px] p-1 shadow-2xl overflow-hidden border-4 border-gray-800">
                        <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-indigo-400" />
                                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Update Process Console</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                                <div className="w-3 h-3 rounded-full bg-green-500/20" />
                            </div>
                        </div>
                        <div className="p-6 font-mono text-xs overflow-y-auto max-h-[400px]">
                            <div className="space-y-4">
                                {log.map((entry, idx) => (
                                    <div key={idx} className="group animate-in fade-in slide-in-from-left-4 duration-300">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                                entry.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                                {entry.step}
                                            </span>
                                            <span className="text-gray-500">{entry.command}</span>
                                        </div>
                                        <pre className={`whitespace-pre-wrap pl-6 border-l border-gray-800 ml-2 ${
                                            entry.status === 'success' ? 'text-gray-400' : 'text-red-400'
                                        }`}>
                                            {entry.output}
                                        </pre>
                                    </div>
                                ))}
                                {isUpdating && (
                                    <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                                        <span className="w-1 h-4 bg-indigo-400 animate-caret" />
                                        <span>Executing next step...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

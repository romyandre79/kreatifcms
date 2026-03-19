import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Database as DatabaseIcon, Download, RefreshCcw, AlertTriangle, FileArchive, Upload, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function Database() {
    const { post, processing } = useForm();
    const [restoreFile, setRestoreFile] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetStep, setResetStep] = useState(0);

    const handleBackup = (type) => {
        // We use window.location.href or a form post that returns a file download
        const url = route('settings.database.backup') + `?type=${type}`;
        window.location.href = url;
    };

    const handleRestore = (e) => {
        e.preventDefault();
        if (!restoreFile) return;

        const formData = new FormData();
        formData.append('backup_file', restoreFile);

        post(route('settings.database.restore'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                setRestoreFile(null);
                alert('Database restored successfully!');
            },
        });
    };

    const handleReset = () => {
        post(route('settings.database.reset'), {
            onSuccess: () => {
                setShowResetConfirm(false);
                setResetStep(0);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Database Management</h2>}
        >
            <Head title="Database Management" />

            <div className="flex flex-col h-[calc(100vh-160px)]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Database Tools</h1>
                        <p className="text-gray-500 text-sm mt-1">Backup, restore, and maintain your system's data integrity.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-6">
                    
                    {/* Backup Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Download className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Backup System</h3>
                                    <p className="text-sm text-gray-500 text-pretty max-w-2xl">
                                        Secure your data by creating a backup. Choose between backing up just the dynamic database content or a full archive including project source code.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleBackup('db')}
                                    className="group flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
                                >
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <DatabaseIcon className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                                    </div>
                                    <span className="text-base font-semibold text-gray-900">Backup Database Only</span>
                                    <span className="text-sm text-gray-500 mt-1">Export Content Types, Entries, and Audit Logs as JSON ZIP.</span>
                                </button>

                                <button
                                    onClick={() => handleBackup('full')}
                                    className="group flex flex-col items-start p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left"
                                >
                                    <div className="flex items-center justify-between w-full mb-4">
                                        <FileArchive className="w-8 h-8 text-indigo-500 group-hover:scale-110 transition-transform" />
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500" />
                                    </div>
                                    <span className="text-base font-semibold text-gray-900">Backup Everything (Code + DB)</span>
                                    <span className="text-sm text-gray-500 mt-1">Full snapshot of the project directory and database state.</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Restore Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 rounded-lg">
                                    <Upload className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Restore from Backup</h3>
                                    <p className="text-sm text-gray-500 text-pretty max-w-2xl">
                                        Upload a previously created ZIP backup to restore your CMS tables and content. Warning: This will overwrite existing data.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleRestore} className="max-w-xl">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="file"
                                        accept=".zip"
                                        onChange={e => setRestoreFile(e.target.files[0])}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-emerald-50 file:text-emerald-700
                                            hover:file:bg-emerald-100
                                        "
                                    />
                                    <button
                                        type="submit"
                                        disabled={!restoreFile || processing}
                                        className="inline-flex items-center px-4 py-2 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                        Restore
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Reset Section - Danger Zone */}
                    <div className="bg-white border text-red-900 rounded-xl overflow-hidden shadow-sm border-red-200">
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                                    <p className="text-sm text-red-600/80 text-pretty max-w-2xl">
                                        Permanently delete all content types, fields, and entries. This action is irreversible and should only be used for a clean start.
                                    </p>
                                </div>
                            </div>

                            {!showResetConfirm ? (
                                <button
                                    onClick={() => setShowResetConfirm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    Factory Reset Database
                                </button>
                            ) : (
                                <div className="bg-red-50 p-6 rounded-xl border border-red-200 animate-in fade-in slide-in-from-top-4">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                                            <AlertTriangle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-red-900">Final Confirmation Required</h4>
                                            <p className="text-sm text-red-800 mt-1">
                                                This will wipe EVERYTHING in the dynamic CMS. Are you absolutely sure?
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {resetStep === 0 ? (
                                            <button
                                                onClick={() => setResetStep(1)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-bold hover:bg-red-700 shadow-sm"
                                            >
                                                Step 1: I understand the risks
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleReset}
                                                disabled={processing}
                                                className="px-4 py-2 bg-red-900 text-white rounded-md text-sm font-bold hover:bg-black shadow-sm flex items-center gap-2"
                                            >
                                                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                                                Step 2: Wipe Database Now
                                            </button>
                                        )}
                                        <button
                                            onClick={() => { setShowResetConfirm(false); setResetStep(0); }}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

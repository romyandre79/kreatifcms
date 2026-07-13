import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Save, Puzzle, Folder, CheckCircle, ShieldAlert, Settings, FileCode, Server, List, Plus, Trash2, CloudLightning, Database, RotateCcw, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Index({ websites = [], modules = [], rawEnv = '' }) {
    const [activeTab, setActiveTab] = useState('local'); // 'local' or 'remote'

    // Local Cloner Form
    const localForm = useForm({
        target_path: '',
        selected_plugins: modules.filter(m => m.enabled).map(m => m.name),
        raw_env: rawEnv
    });

    // Remote Server Form
    const [showRemoteModal, setShowRemoteModal] = useState(false);
    const [editingWebsite, setEditingWebsite] = useState(null);
    const [websitesList, setWebsitesList] = useState(websites);

    const remoteForm = useForm({
        id: '',
        name: '',
        domain: '',
        deployment_type: 'vps_sftp',
        host: '',
        port: 22,
        username: '',
        password: '',
        private_key: '',
        target_path: '',
        db_host: '127.0.0.1',
        db_database: '',
        db_username: '',
        db_password: '',
        web_server_type: '',
        php_version: '8.3',
        setup_ssl: false,
        selected_plugins: modules.filter(m => m.enabled).map(m => m.name),
        env_variables: {}
    });

    // Env parsing helpers for Remote
    const [envText, setEnvText] = useState(rawEnv);

    // Global Operation State
    const [isProcessing, setIsProcessing] = useState(false);
    const [duplicationStatus, setDuplicationStatus] = useState(''); // 'success', 'error', 'processing'
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [progressData, setProgressData] = useState({ status: 'idle', step: '', progress: 0, error: null });

    // Backup & Restore states
    const [showBackupsModal, setShowBackupsModal] = useState(false);
    const [activeWebsiteForBackups, setActiveWebsiteForBackups] = useState(null);
    const [backupsList, setBackupsList] = useState([]);
    const [isBackupProcessing, setIsBackupProcessing] = useState(false);

    // Load Default Local Target Path
    useEffect(() => {
        // Set dynamic default path once axios/env is ready
        axios.get(route('projectmanager.status'))
            .then(res => {
                // heuristic guess path
                localForm.setData('target_path', 'C:\\lara\\www\\kreatif-cms-clone');
            }).catch(() => { });
    }, []);

    const toggleLocalPlugin = (name) => {
        localForm.setData('selected_plugins',
            localForm.data.selected_plugins.includes(name)
                ? localForm.data.selected_plugins.filter(p => p !== name)
                : [...localForm.data.selected_plugins, name]
        );
    };

    const toggleRemotePlugin = (name) => {
        remoteForm.setData('selected_plugins',
            remoteForm.data.selected_plugins.includes(name)
                ? remoteForm.data.selected_plugins.filter(p => p !== name)
                : [...remoteForm.data.selected_plugins, name]
        );
    };

    const handleLocalSubmit = async (e) => {
        e.preventDefault();
        setDuplicationStatus('processing');
        setIsProcessing(true);
        setSuccessMessage('');
        setErrorMessage('');
        setProgressData({ status: 'running', step: 'Initializing local duplication...', progress: 5, error: null });

        try {
            await axios.post(route('projectmanager.duplicate'), localForm.data);
            pollStatus();
        } catch (err) {
            setDuplicationStatus('error');
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || err.message || 'Failed to clone project.');
        }
    };

    const pollStatus = () => {
        const interval = setInterval(async () => {
            try {
                const statusRes = await axios.get(route('projectmanager.status') + '?t=' + new Date().getTime());
                const statusData = statusRes.data;
                setProgressData(statusData);

                if (statusData.status === 'completed') {
                    clearInterval(interval);
                    setDuplicationStatus('success');
                    setIsProcessing(false);
                    setSuccessMessage(statusData.step || 'Operation completed successfully!');
                    refreshWebsites();
                } else if (statusData.status === 'failed') {
                    clearInterval(interval);
                    setDuplicationStatus('error');
                    setIsProcessing(false);
                    setErrorMessage(statusData.error || 'Operation failed.');
                    refreshWebsites();
                }
            } catch (err) {
                // ignore and retry
            }
        }, 1500);
    };

    const refreshWebsites = async () => {
        try {
            const res = await axios.get(route('projectmanager.index'));
            if (res.data?.websites) {
                setWebsitesList(res.data.websites);
            }
        } catch (err) { }
    };

    // Remote CRUD actions
    const handleOpenCreateRemote = () => {
        setEditingWebsite(null);
        remoteForm.reset();
        setEnvText(rawEnv);
        setShowRemoteModal(true);
    };

    const handleOpenEditRemote = (web) => {
        setEditingWebsite(web);
        remoteForm.setData({
            name: web.name,
            domain: web.domain || '',
            deployment_type: web.deployment_type,
            host: web.host || '',
            port: web.port || 22,
            username: web.username || '',
            password: '', // Hidden for security
            private_key: web.private_key || '',
            target_path: web.target_path || '',
            db_host: web.db_host || '127.0.0.1',
            db_database: web.db_database || '',
            db_username: web.db_username || '',
            db_password: '', // Hidden for security
            web_server_type: web.web_server_type || '',
            php_version: web.php_version || '8.3',
            setup_ssl: !!web.setup_ssl,
            selected_plugins: web.selected_plugins || [],
            env_variables: web.env_variables || {}
        });

        // Convert env array variables back to plain text env representation
        let text = "";
        if (web.env_variables) {
            Object.entries(web.env_variables).forEach(([k, v]) => {
                text += `${k}=${v}\n`;
            });
        } else {
            text = rawEnv;
        }
        setEnvText(text);
        setShowRemoteModal(true);
    };

    const handleSaveRemote = async (e) => {
        e.preventDefault();

        // Parse raw env text area to json array
        const envLines = envText.split('\n');
        const envObj = {};
        envLines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.indexOf('=') !== -1) {
                const parts = trimmed.split('=');
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim();
                envObj[k] = v;
            }
        });

        const submissionData = {
            ...remoteForm.data,
            env_variables: envObj
        };

        try {
            if (editingWebsite) {
                const res = await axios.put(route('projectmanager.websites.update', editingWebsite.id), submissionData);
                // Update in local state array
                setWebsitesList(prev => prev.map(w => w.id === editingWebsite.id ? { ...w, ...submissionData } : w));
            } else {
                const res = await axios.post(route('projectmanager.websites.store'), submissionData);
                if (res.data?.website) {
                    setWebsitesList(prev => [res.data.website, ...prev]);
                }
            }
            setShowRemoteModal(false);
            refreshWebsites();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save remote website config.');
        }
    };

    const handleDeleteRemote = async (id) => {
        if (!confirm('Are you sure you want to remove this website configuration? Data on target server will not be deleted.')) return;
        try {
            await axios.delete(route('projectmanager.websites.delete', id));
            setWebsitesList(prev => prev.filter(w => w.id !== id));
            refreshWebsites();
        } catch (err) {
            alert('Failed to delete.');
        }
    };

    // Remote Actions
    const handleDeployWebsite = async (id, mode = 'update') => {
        if (mode === 'clean') {
            const confirmed = confirm("WARNING: Clean build will delete the existing remote folder contents and recreate both databases remote. Are you absolutely sure you want to proceed?");
            if (!confirmed) return;
        }

        setDuplicationStatus('processing');
        setIsProcessing(true);
        setSuccessMessage('');
        setErrorMessage('');
        setProgressData({ status: 'running', step: 'Initializing remote deployment engine...', progress: 5, error: null });

        try {
            await axios.post(route('projectmanager.websites.deploy', id), { mode: mode });
            pollStatus();
        } catch (err) {
            setDuplicationStatus('error');
            setIsProcessing(false);
            setErrorMessage(err.response?.data?.message || err.message || 'Failed to deploy.');
            refreshWebsites();
        }
    };

    const handleBackupDatabase = async (web) => {
        setIsBackupProcessing(true);
        try {
            const res = await axios.post(route('projectmanager.websites.backup', web.id));
            alert(res.data?.message || 'Backup created successfully!');
            if (showBackupsModal && activeWebsiteForBackups?.id === web.id) {
                fetchBackups(web.id);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Backup execution failed.');
        } finally {
            setIsBackupProcessing(false);
        }
    };

    const fetchBackups = async (webId) => {
        try {
            const res = await axios.get(route('projectmanager.websites.backups', webId));
            setBackupsList(res.data);
        } catch (err) { }
    };

    const handleOpenBackups = (web) => {
        setActiveWebsiteForBackups(web);
        fetchBackups(web.id);
        setShowBackupsModal(true);
    };

    const handleRestoreBackup = async (webId, backupId) => {
        if (!confirm('Are you sure you want to overwrite remote database with this backup? Current remote tables will be overwritten.')) return;
        setIsBackupProcessing(true);
        try {
            const res = await axios.post(route('projectmanager.websites.restore', webId), { backup_id: backupId });
            alert(res.data?.message || 'Database restored successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Restore failed.');
        } finally {
            setIsBackupProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <Puzzle className="w-6 h-6 text-indigo-600 animate-pulse" />
                            Multi-Server Deployment Manager
                        </h2>
                        <p className="text-xs text-gray-400 font-medium">Clone, deploy, and update KreatifCMS locally or remote across multiple VPS servers or general web hosting packages.</p>
                    </div>
                </div>
            }
        >
            <Head title="Multi-Server Deployment Manager" />

            {/* Interactive Progress Modal Overlay */}
            {duplicationStatus === 'processing' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md transition-all duration-300">
                    <div className="bg-white/95 p-8 rounded-3xl border border-white/20 shadow-2xl max-w-sm w-full mx-4 space-y-6 text-center relative overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-2xl animate-bounce">
                                <Puzzle className="w-8 h-8 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
                            </div>
                            <h3 className="text-md font-black text-gray-900">Processing Operation</h3>
                            <p className="text-xs text-gray-500 font-semibold px-4 min-h-[32px] flex items-center justify-center">
                                {progressData.step || 'Starting process...'}
                            </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200/50">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ width: `${progressData.progress || 5}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-extrabold text-gray-400">
                                <span>PROGRESS</span>
                                <span className="text-indigo-600">{progressData.progress || 5}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backups Modal Overlay */}
            {showBackupsModal && activeWebsiteForBackups && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white p-6 rounded-3xl max-w-lg w-full mx-4 shadow-2xl relative flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                <Database className="w-4 h-4 text-indigo-600" />
                                Database Backups — {activeWebsiteForBackups.name}
                            </h3>
                            <button onClick={() => setShowBackupsModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {isBackupProcessing && (
                            <div className="p-3 mb-4 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl text-xs flex items-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Restoring or generating database backup in progress...
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {backupsList.length === 0 ? (
                                <p className="text-center text-xs text-gray-400 py-6 font-medium">No backups created yet for this website.</p>
                            ) : (
                                backupsList.map(bk => (
                                    <div key={bk.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800 truncate max-w-[280px]">{bk.filename}</p>
                                            <div className="flex gap-3 text-[10px] font-medium text-gray-400 mt-1">
                                                <span>{(bk.size_bytes / 1024).toFixed(1)} KB</span>
                                                <span>•</span>
                                                <span>{new Date(bk.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRestoreBackup(activeWebsiteForBackups.id, bk.id)}
                                            disabled={isBackupProcessing}
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-50"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Restore
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                            <button
                                onClick={() => handleBackupDatabase(activeWebsiteForBackups)}
                                disabled={isBackupProcessing}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                            >
                                <Plus className="w-4 h-4" />
                                Create Backup Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remote Config Modal */}
            {showRemoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md overflow-y-auto">
                    <form onSubmit={handleSaveRemote} className="bg-white p-6 rounded-3xl max-w-4xl w-full mx-4 my-8 shadow-2xl relative grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[90vh] overflow-y-auto">
                        <div className="md:col-span-2 flex justify-between items-center border-b pb-3">
                            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                <Server className="w-4 h-4 text-indigo-600" />
                                {editingWebsite ? 'Edit Remote Website Configuration' : 'Register Remote VPS / Hosting Server'}
                            </h3>
                            <button type="button" onClick={() => setShowRemoteModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>

                        {/* Left Side: SSH/Server parameters */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">Server Connection</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">Website Name</label>
                                    <input type="text" required value={remoteForm.data.name} onChange={e => remoteForm.setData('name', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="My Client Portfolio" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">Target Domain</label>
                                    <input type="text" value={remoteForm.data.domain} onChange={e => remoteForm.setData('domain', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="portfolio.myclient.com" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-700">Deployment Type</label>
                                <select value={remoteForm.data.deployment_type} onChange={e => {
                                    remoteForm.setData('deployment_type', e.target.value);
                                    remoteForm.setData('port', e.target.value === 'vps_sftp' ? 22 : 21);
                                }} className="w-full text-xs p-2.5 border rounded-xl">
                                    <option value="vps_sftp">VPS Server (SFTP/SSH)</option>
                                    <option value="hosting_ftp">Shared Hosting (FTP)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">IP Host Address</label>
                                    <input type="text" required value={remoteForm.data.host} onChange={e => remoteForm.setData('host', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="103.24.51.98" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">Port</label>
                                    <input type="number" required value={remoteForm.data.port} onChange={e => remoteForm.setData('port', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">SSH/FTP Username</label>
                                    <input type="text" required value={remoteForm.data.username} onChange={e => remoteForm.setData('username', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="root" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">Password / Phrase</label>
                                    <input type="password" value={remoteForm.data.password} onChange={e => remoteForm.setData('password', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="••••••••" />
                                </div>
                            </div>

                            {remoteForm.data.deployment_type === 'vps_sftp' && (
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-bold text-gray-700">SSH Private Key (Optional)</label>
                                    <textarea value={remoteForm.data.private_key} onChange={e => remoteForm.setData('private_key', e.target.value)} className="w-full text-[10px] p-2.5 border rounded-xl font-mono" rows={3} placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..." />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="block text-[10px] font-bold text-gray-700">Target Path Directory</label>
                                <input type="text" required value={remoteForm.data.target_path} onChange={e => remoteForm.setData('target_path', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="/var/www/myclient" />
                            </div>

                            {/* Web Server Auto Config Section */}
                            <div className="border-t pt-3 space-y-3">
                                <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Web Server Auto-Registration</h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700">Server Type</label>
                                        <select value={remoteForm.data.web_server_type} onChange={e => remoteForm.setData('web_server_type', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl">
                                            <option value="">Do Not Configure</option>
                                            <option value="nginx">Nginx</option>
                                            <option value="apache">Apache</option>
                                        </select>
                                    </div>
                                    {remoteForm.data.web_server_type && (
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-gray-700">PHP-FPM Version</label>
                                            <input type="text" value={remoteForm.data.php_version} onChange={e => remoteForm.setData('php_version', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="8.3" />
                                        </div>
                                    )}
                                </div>
                                {remoteForm.data.web_server_type && remoteForm.data.domain && (
                                    <label className="flex items-center gap-2 p-1 cursor-pointer select-none text-[10px] font-bold text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={remoteForm.data.setup_ssl}
                                            onChange={e => remoteForm.setData('setup_ssl', e.target.checked)}
                                            className="w-4 h-4 text-indigo-600 border-gray-200 rounded focus:ring-indigo-500/20"
                                        />
                                        Setup Auto SSL (Certbot Let's Encrypt)
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Right Side: DB & Env */}
                        <div className="space-y-4 flex flex-col justify-between">
                            <div>
                                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Database Credentials (Remote)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700">DB Host</label>
                                        <input type="text" value={remoteForm.data.db_host} onChange={e => remoteForm.setData('db_host', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700">DB Name</label>
                                        <input type="text" value={remoteForm.data.db_database} onChange={e => remoteForm.setData('db_database', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="myclient_db" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700">DB Username</label>
                                        <input type="text" value={remoteForm.data.db_username} onChange={e => remoteForm.setData('db_username', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="myclient_user" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-bold text-gray-700">DB Password</label>
                                        <input type="password" value={remoteForm.data.db_password} onChange={e => remoteForm.setData('db_password', e.target.value)} className="w-full text-xs p-2.5 border rounded-xl" placeholder="••••••••" />
                                    </div>
                                </div>

                                <div className="space-y-1 mt-4">
                                    <label className="text-[10px] font-bold text-gray-700 flex items-center gap-1">
                                        <FileCode className="w-3.5 h-3.5" />
                                        Target Environment variables (.env)
                                    </label>
                                    <textarea value={envText} onChange={e => setEnvText(e.target.value)} rows={7} className="w-full text-[9px] p-2.5 border rounded-xl font-mono leading-tight bg-gray-50 resize-y" />
                                </div>

                                <div className="space-y-1 mt-4">
                                    <label className="text-[10px] font-bold text-gray-700 block mb-1">
                                        Select Plugin Modules to Deploy
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto border p-2.5 rounded-xl bg-gray-50">
                                        {modules.map(module => {
                                            const isChecked = remoteForm.data.selected_plugins.includes(module.name);
                                            return (
                                                <label
                                                    key={module.name}
                                                    className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-150 cursor-pointer select-none text-[10px]"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleRemotePlugin(module.name)}
                                                        className="w-3.5 h-3.5 text-indigo-600 border-gray-200 rounded focus:ring-indigo-500/20 mt-0.5"
                                                    />
                                                    <span className="font-semibold text-gray-700 truncate">{module.name}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <button type="button" onClick={() => setShowRemoteModal(false)} className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"><Save className="w-4 h-4" /> Save Website</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* View Layout Tabs */}
            <div className="mx-auto py-6 space-y-6">
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('local')}
                        className={`py-3 px-6 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${activeTab === 'local'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Folder className="w-4 h-4" />
                        Local Folder Duplicator
                    </button>
                    <button
                        onClick={() => setActiveTab('remote')}
                        className={`py-3 px-6 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${activeTab === 'remote'
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Server className="w-4 h-4" />
                        Remote Servers & Hosting Deployments
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">{websitesList.length}</span>
                    </button>
                </div>

                {/* Status Logs alerts */}
                {duplicationStatus === 'success' && (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-2xl flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-black">Success!</h4>
                            <p className="text-[11px] font-medium mt-0.5">{successMessage}</p>
                        </div>
                    </div>
                )}

                {duplicationStatus === 'error' && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-2xl flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-xs font-black">Error occurred</h4>
                            <p className="text-[11px] font-medium mt-0.5">{errorMessage}</p>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: LOCAL DUPLICATOR */}
                {activeTab === 'local' && (
                    <form onSubmit={handleLocalSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-5">
                                <h3 className="text-sm font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-indigo-600" />
                                    Target Local Directory
                                </h3>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-gray-700">Target Path Directory</label>
                                    <div className="relative">
                                        <Folder className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={localForm.data.target_path}
                                            onChange={e => localForm.setData('target_path', e.target.value)}
                                            className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-gray-700"
                                            placeholder="C:\lara\www\kreatif-cms-copy"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-400">Absolute server path that does not exist yet.</p>
                                </div>

                                <div className="space-y-1.5 border-t border-gray-100 pt-4">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1">
                                        <FileCode className="w-4 h-4 text-indigo-500" />
                                        Local Environment (.env)
                                    </label>
                                    <textarea
                                        value={localForm.data.raw_env}
                                        onChange={e => localForm.setData('raw_env', e.target.value)}
                                        rows={12}
                                        className="w-full text-[10px] p-3.5 border border-gray-200 rounded-xl font-mono text-gray-600 bg-gray-50 leading-relaxed overflow-x-auto whitespace-pre resize-y"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 gap-1.5"
                                >
                                    <Save className="w-4 h-4" />
                                    Clone & Install
                                </button>
                            </div>
                        </div>

                        {/* Modules Checklist */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                        <Puzzle className="w-4 h-4 text-indigo-600" />
                                        Select Plugin Modules
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modules.map(module => {
                                        const isChecked = localForm.data.selected_plugins.includes(module.name);
                                        return (
                                            <div
                                                key={module.name}
                                                onClick={() => toggleLocalPlugin(module.name)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${isChecked ? 'border-indigo-600 bg-indigo-50/10' : 'border-gray-150 hover:border-gray-200'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => { }}
                                                    className="w-4 h-4 text-indigo-600 border-gray-200 rounded focus:ring-indigo-500/20 mt-0.5"
                                                />
                                                <div>
                                                    <h4 className="text-xs font-bold text-gray-900">{module.name}</h4>
                                                    <p className="text-[10px] text-gray-400 mt-1 leading-snug line-clamp-2">{module.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* TAB CONTENT: REMOTE SERVER DEPLOYMENTS */}
                {activeTab === 'remote' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                <Server className="w-5 h-5 text-indigo-600" />
                                Registered Servers & Remote Targets
                            </h3>
                            <button
                                onClick={handleOpenCreateRemote}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-100"
                            >
                                <Plus className="w-4 h-4" />
                                Add Server Target
                            </button>
                        </div>

                        {websitesList.length === 0 ? (
                            <div className="bg-white p-12 text-center rounded-3xl border border-gray-150 shadow-sm flex flex-col items-center justify-center space-y-3">
                                <Server className="w-12 h-12 text-gray-300 animate-pulse" />
                                <h4 className="text-sm font-black text-gray-700">No Remote Websites Configured</h4>
                                <p className="text-xs text-gray-400 max-w-sm">Connect a VPS via SSH or shared Web Hosting via FTP to deploy KreatifCMS packages incrementally.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {websitesList.map(web => (
                                    <div key={web.id} className="bg-white rounded-md border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between">
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900">{web.name}</h4>
                                                    <a href={`http://${web.domain}`} target="_blank" className="text-[10px] font-bold text-indigo-600 hover:underline mt-1 block">
                                                        {web.domain || web.host}
                                                    </a>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${web.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        : (web.status === 'deploying' ? 'bg-indigo-50 text-indigo-700 animate-pulse' : 'bg-red-50 text-red-700')
                                                    }`}>
                                                    {web.status}
                                                </span>
                                            </div>

                                            {/* Connection specifications */}
                                            <div className="space-y-2 text-[10px] font-semibold text-gray-400 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                                <div className="flex justify-between">
                                                    <span>Driver Target</span>
                                                    <span className="text-gray-700 uppercase font-bold">{web.deployment_type === 'vps_sftp' ? 'VPS (SFTP/SSH)' : 'Hosting (FTP)'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Server Path</span>
                                                    <span className="text-gray-700 truncate max-w-[150px] font-bold">{web.target_path}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Last Update</span>
                                                    <span className="text-gray-700 font-bold">{web.last_deployed_at ? new Date(web.last_deployed_at).toLocaleString() : 'Never'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Database Name</span>
                                                    <span className="text-gray-700 font-bold">{web.db_database || 'None'}</span>
                                                </div>
                                                {web.web_server_type && (
                                                    <div className="flex justify-between">
                                                        <span>Web Server Config</span>
                                                        <span className="text-gray-700 font-bold uppercase">{web.web_server_type} {web.php_version ? `(PHP ${web.php_version})` : ''} {web.setup_ssl ? '🔐 SSL' : ''}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between gap-1.5 flex-nowrap overflow-x-auto">
                                            {/* Action buttons unified in a single row */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleDeployWebsite(web.id, 'update')}
                                                    className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                                                    title="Deploy Incremental Updates"
                                                >
                                                    <CloudLightning className="w-3.5 h-3.5" />
                                                    Deploy Update
                                                </button>
                                                <button
                                                    onClick={() => handleDeployWebsite(web.id, 'clean')}
                                                    className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                                                    title="Clean Build (Warning: Deletes existing directories & databases remote)"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    Clean Build
                                                </button>
                                                <button
                                                    onClick={() => handleOpenBackups(web)}
                                                    className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold flex items-center gap-1 whitespace-nowrap"
                                                    title="Manage Database Backups"
                                                >
                                                    <Database className="w-3.5 h-3.5" />
                                                    Backup
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => handleOpenEditRemote(web)}
                                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-[10px] font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRemote(web.id)}
                                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

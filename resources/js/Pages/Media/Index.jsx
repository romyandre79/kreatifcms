import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, X, Link as LinkIcon, Search } from 'lucide-react';

export default function Index({ media }) {
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (!e.target.files.length) return;
        
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => {
            formData.append('files[]', file);
        });

        setUploading(true);
        router.post(route('media.upload'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                setUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: () => setUploading(false),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this media?')) {
            router.delete(route('media.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedMedia?.id === id) setSelectedMedia(null);
                }
            });
        }
    };

    const copyToClipboard = (url) => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    const filteredMedia = media.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes'
        const k = 1024
        const dm = decimals < 0 ? 0 : decimals
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Media Library</h2>}>
            <Head title="Media Library" />

            <div className="flex h-[calc(100vh-160px)] gap-6">
                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header bar */}
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder="Search media..."
                                className="w-full pl-9 pr-4 py-2 bg-white border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                            >
                                <UploadCloud className="w-4 h-4" />
                                {uploading ? 'Uploading...' : 'Upload Files'}
                            </button>
                        </div>
                    </div>

                    {/* Media Grid */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                        {filteredMedia.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                                <p className="text-lg font-medium text-gray-500">No media found</p>
                                <p className="text-sm">Upload some files to see them here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {filteredMedia.map(item => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setSelectedMedia(item)}
                                        className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                                            selectedMedia?.id === item.id ? 'border-indigo-500 shadow-md scale-[0.98]' : 'border-transparent hover:border-gray-300'
                                        }`}
                                    >
                                        <img 
                                            src={`/storage/${item.path}`} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Details */}
                {selectedMedia && (
                    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Attachment Details</h3>
                            <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <img src={`/storage/${selectedMedia.path}`} alt={selectedMedia.name} className="w-full h-full object-contain" />
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">File Name</span>
                                    <span className="text-gray-900 break-all">{selectedMedia.name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">File Type</span>
                                    <span className="text-gray-900">{selectedMedia.mime_type}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">File Size</span>
                                    <span className="text-gray-900">{formatBytes(selectedMedia.size)}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Uploaded On</span>
                                    <span className="text-gray-900">{new Date(selectedMedia.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">File URL</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={`${window.location.origin}/storage/${selectedMedia.path}`}
                                            className="flex-1 text-xs border-gray-200 rounded-lg bg-gray-50 text-gray-500 focus:ring-0"
                                        />
                                        <button 
                                            onClick={() => copyToClipboard(`${window.location.origin}/storage/${selectedMedia.path}`)}
                                            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors"
                                            title="Copy URL"
                                        >
                                            <LinkIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <button 
                                onClick={() => handleDelete(selectedMedia.id)}
                                className="w-full py-2 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors border border-transparent hover:border-red-100"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

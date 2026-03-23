import React, { useState, useEffect } from 'react';
import { X, Search, Image as ImageIcon, Plus } from 'lucide-react';
import axios from 'axios';

class ModalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="fixed inset-0 z-[100] bg-red-50 p-8 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">MediaPickerModal Crashed!</h2>
                    <pre className="p-4 bg-white text-red-800 rounded shadow max-w-2xl overflow-auto text-xs">
                        {this.state.error?.stack || this.state.error?.message || 'Unknown error'}
                    </pre>
                    <button onClick={() => this.setState({hasError: false})} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">Retry</button>
                    <button onClick={this.props.onClose} className="mt-2 px-4 py-2 bg-gray-600 text-white rounded">Close</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('media.index'), {
                headers: { 'Accept': 'application/json' }
            });
            setMedia(response.data);
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }

        try {
            await axios.post(route('media.upload'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });
            await fetchMedia();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const filteredMedia = media.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <ModalErrorBoundary onClose={onClose}>
            <div className="fixed inset-0 z-50 overflow-y-auto w-full h-full">
                <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-900 opacity-75 backdrop-blur-sm" onClick={onClose}></div>
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
                            <h3 className="text-lg font-bold text-gray-900">Select Media</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleUpload}
                                    accept="image/*"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                            <span>UPLOADING...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            <span>UPLOAD</span>
                                        </>
                                    )}
                                </button>
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-500 bg-white border border-gray-200 rounded-lg p-2 shadow-sm transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : filteredMedia.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <ImageIcon className="w-12 h-12 mb-3 text-gray-300" />
                                    <p className="font-medium text-gray-500">No media found in library.</p>
                                    <p className="text-sm mb-4">You can upload images using the button above.</p>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:text-indigo-600 transition-all font-medium"
                                    >
                                        Click to Upload Media
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {filteredMedia.map(item => (
                                        <div 
                                            key={item.id} 
                                            onClick={() => {
                                                onSelect(`/storage/${item.path}`);
                                                onClose();
                                            }}
                                            className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-indigo-400 hover:shadow-lg transition-all"
                                        >
                                            <img 
                                                src={`/storage/${item.path}`} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-indigo-900/10 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ModalErrorBoundary>
    );
}

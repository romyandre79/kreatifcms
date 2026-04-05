import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePage, Link } from '@inertiajs/react';
import { X, Maximize2, Loader2, LayoutGrid, ChevronRight, Lock, ArrowRight } from 'lucide-react';
import BlockHeader from './BlockHeader';

const PhotoCard = ({ item, onClick, columns = 3 }) => {
    const { auth } = usePage().props;
    const isAllowed = !item.is_paid || !!auth.user;

    return (
        <div 
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            onClick={() => isAllowed && onClick(item)}
        >
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img 
                    src={item.image} 
                    alt={item.title || ''} 
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!isAllowed ? 'blur-sm grayscale' : ''}`}
                />
                
                {!isAllowed && (
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                        <Lock className="w-8 h-8 text-white/80 mb-3" />
                        <h4 className="text-white font-bold text-sm mb-1">{item.locked_title || 'Premium Content'}</h4>
                        <p className="text-white/60 text-[10px] line-clamp-2 mb-3">{item.paid_message || 'Log in to view'}</p>
                        <Link href="/login" className="px-4 py-1.5 bg-white text-gray-900 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors">
                            Log In
                        </Link>
                    </div>
                )}

                {isAllowed && (
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                            <Maximize2 className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                )}
            </div>

            {(item.title || item.description) && (
                <div className="p-4">
                    {item.title && <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>}
                    {item.description && <p className="text-gray-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">{item.description}</p>}
                </div>
            )}
        </div>
    );
};

const Lightbox = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={onClose}
        >
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="max-w-5xl w-full p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-full max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img 
                        src={item.image} 
                        alt={item.title || ''} 
                        className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500"
                    />
                </div>
                
                {(item.title || item.description) && (
                    <div className="mt-8 text-center max-w-2xl animate-in slide-in-from-bottom-4 duration-500">
                        {item.title && <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">{item.title}</h2>}
                        {item.description && <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

const PhotoGridBlock = ({ data = {} }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const source = data.source || 'manual';
    const columns = parseInt(data.columns) || 3;
    const items = Array.isArray(data.items) ? data.items : [];
    const mapping = data.mapping || {};
    const useLightbox = data.lightbox !== false;

    let displayItems = [];

    if (source === 'manual') {
        displayItems = items;
    } else {
        // Dynamic Source mapping
        displayItems = items.map(item => ({
            id: item.id,
            title: mapping.title ? item[mapping.title] : (item.title || item.name || 'Untitled'),
            description: mapping.description ? item[mapping.description] : item.description,
            image: mapping.image ? item[mapping.image] : item.image,
            is_paid: mapping.is_paid ? !!item[mapping.is_paid] : !!item.is_premium,
            locked_title: mapping.locked_title ? item[mapping.locked_title] : item.locked_title,
            paid_message: mapping.paid_message ? item[mapping.paid_message] : item.paid_message
        }));
    }

    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns] || 'grid-cols-1 md:grid-cols-3';

    return (
        <section className={`py-20 px-6 ${data.bg_color ? '' : 'bg-white'} overflow-hidden`} style={{ backgroundColor: data.bg_color }}>
            <div className="max-w-7xl mx-auto">
                <BlockHeader data={data} />

                {displayItems.length > 0 ? (
                    <div className={`grid ${gridClasses} gap-6 sm:gap-8`}>
                        {displayItems.map((item, idx) => (
                            <PhotoCard 
                                key={item.id || idx} 
                                item={item} 
                                columns={columns}
                                onClick={(p) => useLightbox && setSelectedPhoto(p)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-300 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <LayoutGrid className="w-8 h-8 text-gray-200" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest">No photos found in this grid.</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{source} Mode</p>
                    </div>
                )}
            </div>

            {useLightbox && selectedPhoto && (
                <Lightbox 
                    item={selectedPhoto} 
                    onClose={() => setSelectedPhoto(null)} 
                />
            )}
        </section>
    );
};

export default PhotoGridBlock;

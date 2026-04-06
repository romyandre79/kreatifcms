import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePage, Link } from '@inertiajs/react';
import { Lock, Play, Youtube, Video, LayoutGrid, ChevronRight, ArrowRight } from 'lucide-react';
import ReactPlayer from 'react-player';
import BlockHeader from './BlockHeader';

const VideoCard = ({ video, columns = 3 }) => {
    const { auth } = usePage().props;
    const isAllowed = !video.is_paid || !!auth.user;

    if (!isAllowed) {
        return (
            <div className="group relative flex flex-col bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-xl min-h-[320px] transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20">
                {/* Locked Card Background */}
                <div className="absolute inset-0 bg-cover bg-center opacity-20 grayscale blur-[2px] transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: video.poster ? `url(${video.poster})` : 'none' }}></div>
                
                <div className="relative z-10 p-8 flex flex-col items-center justify-center text-center h-full space-y-5">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 backdrop-blur-md border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <Lock className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2">
                            {video.locked_title || video.title || 'Premium Content'}
                        </h3>
                        <p className="text-gray-400 text-xs leading-relaxed max-w-[200px] mx-auto line-clamp-3">
                            {video.paid_message || 'This video is exclusive to registered members. Please log in to watch.'}
                        </p>
                    </div>

                    <div className="pt-2">
                        <Link href="/login" className="px-5 py-2 bg-white text-gray-900 rounded-full font-bold text-[10px] hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 shadow-md inline-flex items-center gap-1.5 uppercase tracking-wider">
                            <Play className="w-3 h-3 fill-current" /> {video.locked_button_text || 'Log In to Watch'}
                        </Link>
                    </div>
                </div>

                {/* Badge */}
                <div className="absolute top-4 right-4 px-2 py-1 bg-indigo-600/90 backdrop-blur-sm text-white text-[9px] font-black rounded-md flex items-center gap-1 shadow-xl uppercase tracking-tighter border border-indigo-400/30">
                    <Lock className="w-2.5 h-2.5" /> PRO
                </div>
            </div>
        );
    }

    const hasUrl = !!video.url && typeof video.url === 'string' && video.url.trim().length > 0;
    const sanitizedUrl = hasUrl ? video.url.trim() : '';

    // Convert YouTube URLs to Embed URLs
    const getEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` : url;
    };

    const isYouTube = sanitizedUrl.includes('youtube.com') || sanitizedUrl.includes('youtu.be');

    return (
        <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            {/* Thumbnail/Player Container with Aspect Ratio Fallback */}
            <div className="relative w-full pb-[56.25%] bg-gray-950 overflow-hidden group/player">
                {hasUrl ? (
                    <>
                        {isYouTube ? (
                            <iframe 
                                src={getEmbedUrl(sanitizedUrl)}
                                className="absolute inset-0 w-full h-full z-10 border-none"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <ReactPlayer
                                url={sanitizedUrl}
                                controls={true}
                                playing={false}
                                width="100%"
                                height="100%"
                                className="absolute inset-0 z-10"
                            />
                        )}
                        {/* DIAGNOSTIC OVERLAY - DELETE AFTER FIX */}
                        <div className="absolute bottom-2 left-2 z-20 bg-black/80 text-white text-[8px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover/player:opacity-100 transition-opacity whitespace-nowrap overflow-hidden max-w-[90%] border border-white/20">
                            URL: {sanitizedUrl}
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700 space-y-2">
                        <Video className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-30">No URL Provided</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {video.title || 'Untitled Video'}
                </h3>
                {video.description && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-4">
                        {video.description}
                    </p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                    {!isAllowed ? (
                        <Link href="/login" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            LOG IN TO WATCH <ChevronRight className="w-3 h-3" />
                        </Link>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Video className="w-3 h-3" /> Ready to Play
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const VideoGridBlock = ({ data = {}, contentTypes = [] }) => {
    const source = data.source || 'manual';
    const columns = parseInt(data.columns) || 3;
    const items = Array.isArray(data.items) ? data.items : [];
    const mapping = data.mapping || {};

    let displayItems = [];

    if (source === 'manual') {
        displayItems = items;
    } else {
        // Dynamic Source: Map fields using data.mapping
        displayItems = items.map(item => ({
            id: item.id,
            title: mapping.title ? item[mapping.title] : (item.title || item.name || 'Untitled Video'),
            description: mapping.description ? item[mapping.description] : item.description,
            url: mapping.url ? item[mapping.url] : item.video_url,
            poster: mapping.poster ? item[mapping.poster] : item.thumbnail,
            is_paid: mapping.is_paid ? !!item[mapping.is_paid] : !!item.is_premium,
            locked_title: mapping.locked_title ? item[mapping.locked_title] : item.locked_title,
            paid_message: mapping.paid_message ? item[mapping.paid_message] : item.paid_message,
            locked_button_text: item.locked_button_text
        }));
    }

    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns] || 'grid-cols-1 md:grid-cols-3';

    return (
        <section className={`py-20 px-6 overflow-hidden ${data.bg_color ? '' : 'bg-white'}`} style={{ backgroundColor: data.bg_color }}>
            <div className="max-w-7xl mx-auto">
                <BlockHeader data={data} />

                {displayItems.length > 0 ? (
                    <div className={`grid ${gridClasses} gap-8`}>
                        {displayItems.map((video, idx) => (
                            <VideoCard key={video.id || idx} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Video className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">No videos found in this grid.</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">{source} Mode</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default VideoGridBlock;

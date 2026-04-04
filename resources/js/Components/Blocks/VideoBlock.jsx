import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Lock, Play, Youtube, Video } from 'lucide-react';
import ReactPlayer from 'react-player';

const VideoBlock = ({ data = {} }) => {
    const { auth } = usePage().props;
    const isAllowed = !data.is_paid || !!auth.user;

    // ReactPlayer automatically handles HLS, Dash, mp4, YouTube, Vimeo, etc.
    
    if (!isAllowed) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-center p-8 shadow-2xl border border-gray-800 group">
                    <div className="absolute inset-0 bg-cover bg-center opacity-30 grayscale blur-sm transition-all group-hover:scale-110" style={{ backgroundImage: data.poster ? `url(${data.poster})` : 'none' }}></div>
                    <div className="relative z-10 space-y-6">
                        <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-md border border-indigo-500/30">
                            <Lock className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{data.locked_title || data.title || 'Premium Content'}</h3>
                            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed px-4">
                                {data.paid_message || 'This video is exclusive to registered members. Please log in to watch.'}
                            </p>
                        </div>
                        <div className="pt-4">
                            <a href="/login" className="px-8 py-3 bg-white text-gray-900 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all transform hover:scale-105 active:scale-95 shadow-lg inline-flex items-center gap-2">
                                {data.locked_button_text || 'Log In to Watch'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="space-y-6">
                {(data.title || data.description) && (
                    <div className="space-y-2 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {data.title && <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{data.title}</h2>}
                        {data.description && <p className="text-gray-500 text-lg leading-relaxed max-w-3xl">{data.description}</p>}
                    </div>
                )}
                
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black group border border-gray-200 animate-in zoom-in-95 duration-500">
                    <ReactPlayer
                        url={data.url}
                        controls={data.controls !== false}
                        playing={data.autoplay}
                        loop={data.loop}
                        muted={data.muted}
                        light={data.poster && !data.autoplay ? data.poster : false} // Only use light preview if poster is set and not auto-playing
                        width="100%"
                        height="100%"
                        className="absolute inset-0"
                        config={{
                            file: {
                                forceHLS: data.url?.endsWith('.m3u8'),
                                forceDASH: data.url?.endsWith('.mpd'),
                                attributes: {
                                    poster: data.poster
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoBlock;

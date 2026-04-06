import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import * as LucideIcons from 'lucide-react';
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
        <section className={`py-10 px-6 overflow-hidden ${data.bg_color ? '' : 'bg-white'}`} style={{ backgroundColor: data.bg_color }}>
            <div className="max-w-6xl mx-auto">
                {(data.title || data.subtitle || data.cta_text) && (
                    <div className={`mb-16 space-y-4 ${data.align === 'center' ? 'text-center' : data.align === 'right' ? 'text-right' : 'text-left'}`}>
                        {data.title && (
                            <h2
                                className="text-4xl font-black tracking-tight uppercase"
                                style={{ color: data.title_color || '#111827' }}
                            >
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p
                                className={`text-lg leading-relaxed ${data.align === 'center' ? 'max-w-2xl mx-auto' : data.align === 'right' ? 'ml-auto max-w-2xl' : 'mr-auto max-w-2xl'}`}
                                style={{ color: data.subtitle_color || '#6b7280' }}
                            >
                                {data.subtitle}
                            </p>
                        )}
                        {data.cta_text && data.cta_url && (
                            <div className="pt-2">
                                <a
                                    href={data.cta_url}
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-100 uppercase tracking-wider text-xs"
                                >
                                    {data.cta_text}
                                    <LucideIcons.ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </div>
                        )}
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
        </section>
    );
};

export default VideoBlock;

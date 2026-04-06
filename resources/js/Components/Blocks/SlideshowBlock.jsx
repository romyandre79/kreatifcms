import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactPlayer from 'react-player';
import BlockHeader from './BlockHeader';

const SlideshowBlock = ({ data = {} }) => {
    const items = Array.isArray(data.items) ? data.items : [];
    const config = data.config || { autoPlay: true, interval: 5000, showArrows: true, showDots: true };
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!config || !config.autoPlay || isPaused || !items || items.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, config.interval || 5000);

        return () => clearInterval(timer);
    }, [items?.length, config?.autoPlay, config?.interval, isPaused]);

    if (items.length === 0) {
        return (
            <div className="py-12 bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 m-4 rounded-2xl text-gray-400">
                <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm font-medium">Slideshow is empty</p>
            </div>
        );
    }

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));

    // Support dynamic mapping if it's a dynamic source
    const getSlideData = (item) => {
        if (!item) return { type: 'image', image: '', video_url: '', title: '', link: '#' };
        
        if (data.source === 'dynamic' && data.mapping) {
            return {
                type: 'image', // Dynamic currently only supports images
                image: (data.mapping.image && item[data.mapping.image]) ? item[data.mapping.image] : '',
                video_url: '',
                title: (data.mapping.title && item[data.mapping.title]) ? item[data.mapping.title] : '',
                link: (data.mapping.link && item[data.mapping.link]) ? item[data.mapping.link] : '#'
            };
        }
        return {
            type: item.type || 'image',
            image: item.image || '',
            video_url: item.video_url || '',
            title: item.title || '',
            link: item.link || '#'
        };
    };

    // Convert YouTube URLs to Embed URLs
    const getEmbedUrl = (url) => {
        if (!url) return '';
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        }
        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}` : url;
    };

    return (
        <section className={`py-20 px-6 overflow-hidden ${data.bg_color ? '' : 'bg-white'}`} style={{ backgroundColor: data.bg_color }}>
            <div className="max-w-7xl mx-auto">
                <BlockHeader data={data} />

                <div 
                    className="relative w-full overflow-hidden group rounded-3xl shadow-2xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    {data.customCss && <style dangerouslySetInnerHTML={{ __html: data.customCss }} />}
            
            <div className="relative aspect-[21/9] md:aspect-[3/1] w-full bg-gray-900">
                {items.map((item, idx) => {
                    const slide = getSlideData(item);
                    const isYouTube = slide.video_url?.includes('youtube.com') || slide.video_url?.includes('youtu.be');
                    
                    return (
                        <div 
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {slide.type === 'video' && slide.video_url ? (
                                <div className="w-full h-full relative">
                                    {isYouTube ? (
                                        <div className="w-full h-full relative pointer-events-none">
                                            <iframe 
                                                src={idx === currentIndex ? getEmbedUrl(slide.video_url) : ''}
                                                className="absolute inset-0 w-full h-full border-none pointer-events-none"
                                                style={{ objectFit: 'cover' }}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        </div>
                                    ) : (
                                        <ReactPlayer
                                            url={slide.video_url}
                                            light={slide.image || true}
                                            playing={idx === currentIndex && !isPaused}
                                            onStart={() => setIsPaused(true)}
                                            onPlay={() => setIsPaused(true)}
                                            onPause={() => setIsPaused(false)}
                                            loop={true}
                                            muted={true}
                                            width="100%"
                                            height="100%"
                                            playsinline={true}
                                            style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                            config={{
                                                youtube: { playerVars: { showinfo: 0, modestbranding: 1, controls: 1 } }
                                            }}
                                        />
                                    )}
                                </div>
                            ) : slide.image && (
                                <img 
                                    src={slide.image} 
                                    alt={slide.title || 'Slide'} 
                                    loading={idx === 0 ? "eager" : "lazy"}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {(slide.title || slide.link) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16 pointer-events-none">
                                    <div className={`max-w-4xl mx-auto w-full transition-all duration-700 transform pointer-events-auto ${idx === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                        {slide.title && (
                                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                                                {slide.title}
                                            </h2>
                                        )}
                                        {slide.link && slide.link !== '#' && (
                                            <a 
                                                href={slide.link}
                                                className="inline-flex items-center px-6 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-100 transition-all shadow-xl"
                                            >
                                                Learn More
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Navigation Arrows */}
                {config.showArrows && items.length > 1 && (
                    <>
                        <button 
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Dots Indicator */}
                {config.showDots && items.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
</section>
);
};

export default SlideshowBlock;

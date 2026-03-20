import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from '@inertiajs/react';
import { 
    ArrowRight, 
    CheckCircle2, 
    ChevronRight, 
    ChevronLeft,
    Image as ImageIcon,
    Menu, 
    X, 
    Globe, 
    ChevronDown,
    Grid
} from 'lucide-react';

// Block Components for Frontend Display

const NavBarBlock = ({ data = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const links = Array.isArray(data.links) ? data.links : [];
    const buttons = data.buttons !== undefined 
        ? (Array.isArray(data.buttons) ? data.buttons : [])
        : [
            { id: 'btn-1', label: 'Login', url: '/login', style: 'ghost' },
            { id: 'btn-2', label: 'Get Started', url: '#', style: 'primary' }
        ];

    return (
        <nav 
            className={`w-full z-50 transition-all duration-300 ${data.sticky !== false ? 'sticky top-0' : 'relative'} ${data.glass !== false ? 'bg-white/80 backdrop-blur-md border-b border-white/20' : 'bg-white border-b border-gray-100'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        {data.logo ? (
                            <Link href="/" aria-label="Home">
                                <img src={data.logo} alt="Logo" className="h-8 w-auto" />
                            </Link>
                        ) : (
                            <Link 
                                href="/" 
                                aria-label="Home"
                                className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer"
                            >
                                <Globe className="w-6 h-6 text-indigo-600" aria-hidden="true" />
                                <span>KreatifCMS</span>
                            </Link>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, i) => (
                            <div key={i} className="relative group">
                                <a 
                                    href={link.url} 
                                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                >
                                    {link.label}
                                    {link.dropdown && <ChevronDown className="w-3 h-3 text-gray-400" aria-hidden="true" />}
                                </a>
                            </div>
                        ))}
                        {buttons.length > 0 && (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                                {buttons.map((btn, i) => (
                                    <a 
                                        key={btn.id || i}
                                        href={btn.url || '#'} 
                                        className={btn.style === 'primary' 
                                            ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 hover:shadow-indigo-200 transition-all"
                                            : "text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        }
                                    >
                                        {btn.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                            {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isOpen ? 'block animate-in slide-in-from-top-2 duration-200' : 'hidden'} md:hidden bg-white border-t border-gray-100 overflow-hidden`}>
                <div className="pt-2 pb-3 space-y-1 px-4">
                    {links.map((link, i) => (
                        <a
                            key={i}
                            href={link.url}
                            className="block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            {link.label}
                        </a>
                    ))}
                    {buttons.length > 0 && (
                        <div className="pt-4 pb-4 border-t border-gray-100 mt-2 space-y-2">
                            {buttons.map((btn, i) => (
                                <a 
                                    key={btn.id || i}
                                    href={btn.url || '#'} 
                                    className={btn.style === 'primary'
                                        ? "block px-4 py-3 rounded-xl text-center text-base font-bold text-white bg-indigo-700 shadow-lg shadow-indigo-100"
                                        : "block px-3 py-3 rounded-xl text-base font-semibold text-gray-700 hover:bg-gray-50 uppercase tracking-widest text-[10px]"
                                    }
                                >
                                    {btn.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const HeroBlock = ({ data = {} }) => (
    <div className="relative overflow-hidden bg-gray-900 text-white min-h-[60vh] flex items-center justify-center">
        {data.bgImage && (
            <div className="absolute inset-0">
                <img src={data.bgImage} className="w-full h-full object-cover opacity-30" alt="Background" />
            </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                {data.title || ''}
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm">
                {data.subtitle || ''}
            </p>
            {data.buttonText && data.buttonLink && (
                <Link 
                    href={data.buttonLink} 
                    className="inline-flex px-8 py-4 text-lg font-bold rounded-full bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02] transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                    {data.buttonText}
                </Link>
            )}
        </div>
    </div>
);

const TextBlock = ({ data = {} }) => {
    const style = {
        backgroundColor: data.backgroundColor || 'transparent',
        color: data.textColor || 'inherit',
        paddingTop: data.paddingY ? `${data.paddingY}px` : '4rem',
        paddingBottom: data.paddingY ? `${data.paddingY}px` : '4rem',
        borderRadius: data.borderRadius ? `${data.borderRadius}px` : '0px',
    };

    return (
        <div style={style} className="w-full">
            <div className="max-w-4xl mx-auto px-4">
                <div className={`prose prose-lg md:prose-xl max-w-none text-${data.align || 'left'} ${!data.textColor ? 'prose-indigo' : ''} prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-700 hover:prose-a:text-indigo-600`}
                    style={{ color: data.textColor || 'inherit' }}
                >
                    <ReactMarkdown>{data.content || ''}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

const ImageBlock = ({ data = {} }) => (
    <div className="max-w-6xl mx-auto px-4 py-12">
        <figure className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-gray-200">
            {data.url ? (
                <img src={data.url} alt={data.caption || 'Image'} className="w-full h-auto object-cover" />
            ) : (
                <div className="w-full aspect-video flex items-center justify-center text-gray-400 bg-gray-50 font-mono text-sm border-2 border-dashed border-gray-200">Image Placeholder</div>
            )}
            {data.caption && (
                <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-900/80 to-transparent p-6 pt-12">
                    <p className="text-white text-sm font-medium">{data.caption}</p>
                </figcaption>
            )}
        </figure>
    </div>
);

const FeatureGridBlock = ({ data = {} }) => {
    const features = Array.isArray(data.features) ? data.features : [];
    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                {data.title && (
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16 tracking-tight">
                        {data.title}
                    </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, i) => (
                        <div key={feature.id || i} className="p-8 rounded-3xl bg-gray-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all group">
                            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SlideshowBlock = ({ data = {} }) => {
    const items = Array.isArray(data.items) ? data.items : [];
    const config = data.config || { autoPlay: true, interval: 5000, showArrows: true, showDots: true };
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!config.autoPlay || isPaused || items.length <= 1) return;
        
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, config.interval || 5000);

        return () => clearInterval(timer);
    }, [items.length, config.autoPlay, config.interval, isPaused, currentIndex]);

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
        if (data.source === 'dynamic' && data.mapping) {
            return {
                image: item[data.mapping.image] || '',
                title: item[data.mapping.title] || '',
                link: item[data.mapping.link] || '#'
            };
        }
        return item;
    };

    return (
        <section 
            className="relative w-full overflow-hidden group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {data.customCss && <style dangerouslySetInnerHTML={{ __html: data.customCss }} />}
            
            <div className="relative aspect-[21/9] md:aspect-[3/1] w-full bg-gray-900">
                {items.map((item, idx) => {
                    const slide = getSlideData(item);
                    return (
                        <div 
                            key={idx}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                        >
                            {slide.image && (
                                <img 
                                    src={slide.image} 
                                    alt={slide.title || 'Slide'} 
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {(slide.title || slide.link) && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16">
                                    <div className={`max-w-4xl mx-auto w-full transition-all duration-700 transform ${idx === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
        </section>
    );
};

// Component Mapper
// Dynamic Content List Block
const ContentListBlock = ({ data = {} }) => {
    const items = Array.isArray(data.items) ? data.items : [];
    const mapping = data.mapping || {};
    const layoutStyle = data.layout_style || 'grid';

    if (items.length === 0) {
        return (
            <section className="py-16 px-6 max-w-7xl mx-auto text-center">
                <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Globe className="w-10 h-10 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-gray-500 font-medium">No content items found.</p>
                    <p className="text-xs text-gray-400 mt-1">Add entries to your content type to see them here.</p>
                </div>
            </section>
        );
    }

    if (layoutStyle === 'list') {
        return (
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <div className="space-y-4">
                    {items.map((item, i) => (
                        <a
                            key={item.id || i}
                            href={`${mapping.link_prefix || '/content/'}${item.id}`}
                            className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                {mapping.image && item[mapping.image] && (
                                    <img src={item[mapping.image]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    {mapping.title && item[mapping.title] && (
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">{item[mapping.title]}</h3>
                                    )}
                                    {mapping.description && item[mapping.description] && (
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item[mapping.description]}</p>
                                    )}
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                            </div>
                        </a>
                    ))}
                </div>
            </section>
        );
    }

    // Grid layout
    return (
        <section className="py-16 px-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, i) => (
                    <a
                        key={item.id || i}
                        href={`${mapping.link_prefix || '/content/'}${item.id}`}
                        className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all"
                    >
                        {mapping.image && item[mapping.image] && (
                            <div className="aspect-video overflow-hidden">
                                <img src={item[mapping.image]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        )}
                        <div className="p-6">
                            {mapping.title && item[mapping.title] && (
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item[mapping.title]}</h3>
                            )}
                            {mapping.description && item[mapping.description] && (
                                <p className="text-sm text-gray-500 mt-2 line-clamp-3">{item[mapping.description]}</p>
                            )}
                            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
                                <span aria-label={`Read more about ${item[mapping.title] || 'this item'}`}>Read more</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
};

const BlockComponents = {
    navbar: NavBarBlock,
    hero: HeroBlock,
    text: TextBlock,
    image: ImageBlock,
    feature_grid: FeatureGridBlock,
    slideshow: SlideshowBlock,
    content_list: ContentListBlock
};

export default function DynamicPageRenderer({ blocks, reusableBlocks = [] }) {
    if (!blocks || blocks.length === 0) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-8">
                <p className="text-lg font-medium">This page currently has no content.</p>
            </div>
        );
    }

    return (
        <div className="dynamic-page-content font-sans antialiased text-gray-900 bg-white">
            {blocks.map((block) => {
                let actualType = block.type;
                let actualData = block.data;

                if (block.type === 'reusable_block') {
                    const savedBlock = reusableBlocks.find(b => b.id == block.data?.block_id);
                    if (savedBlock) {
                        actualType = savedBlock.type;
                        actualData = savedBlock.data;
                    } else {
                        return <div key={block.id} className="p-4 text-gray-500 bg-gray-50 border border-gray-200 m-4 rounded">Select a reusable block.</div>;
                    }
                }

                const Component = BlockComponents[actualType];
                if (!Component) {
                    return <div key={block.id} className="p-4 text-red-500 bg-red-50 border border-red-200 m-4 rounded">Unknown block type: {actualType}</div>;
                }
                return <Component key={block.id} data={actualData} />;
            })}
        </div>
    );
}

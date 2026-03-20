import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from '@inertiajs/react';
import { 
    ArrowRight, 
    CheckCircle2, 
    ChevronRight, 
    Menu, 
    X, 
    Globe, 
    ChevronDown 
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
                            <img src={data.logo} alt="Logo" className="h-8 w-auto" />
                        ) : (
                            <div className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer" onClick={() => window.location.href = '/'}>
                                <Globe className="w-6 h-6 text-indigo-600" />
                                <span>KreatifCMS</span>
                            </div>
                        )}
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link, i) => (
                            <div key={i} className="relative group">
                                <a 
                                    href={link.url} 
                                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                >
                                    {link.label}
                                    {link.dropdown && <ChevronDown className="w-3 h-3" />}
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
                                            ? "inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all"
                                            : "text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition-colors"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
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
                                        ? "block px-4 py-3 rounded-xl text-center text-base font-bold text-white bg-indigo-600 shadow-lg shadow-indigo-100"
                                        : "block px-3 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 uppercase tracking-widest text-[10px]"
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
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                {data.title || ''}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
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
                <div className={`prose prose-lg md:prose-xl max-w-none text-${data.align || 'left'} ${!data.textColor ? 'prose-indigo' : ''} prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-500`}
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
    <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center mb-16">
                <h2 className="text-base font-semibold leading-7 text-indigo-600 tracking-wide uppercase">{data.title || ''}</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Everything you need to succeed</p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                    {features.map((feature, idx) => (
                        <div key={idx} className="flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                            <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900">
                                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-500 transition-colors">
                                    <span className="text-white font-bold">{idx + 1}</span>
                                </div>
                                {feature.title}
                            </dt>
                            <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                <p className="flex-auto">{feature.desc}</p>
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </div>
    </div>
)};

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
                    <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No content items found.</p>
                    <p className="text-xs text-gray-300 mt-1">Add entries to your content type to see them here.</p>
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
                            <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                                <span>Read more</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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

import React from 'react';
import { Globe, ChevronRight, ArrowRight } from 'lucide-react';

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

    return (
        <section className={`py-10 px-6 overflow-hidden ${data.bg_color ? '' : 'bg-white'}`} style={{ backgroundColor: data.bg_color }}>
            <div className="max-w-7xl mx-auto">
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
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {layoutStyle === 'list' ? (
                    <div className="max-w-5xl mx-auto space-y-4">
                        {items.map((item, i) => (
                            <a
                                key={item.id || i}
                                href={`${mapping.link_prefix || '/content/'}${item.id}`}
                                className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all group"
                            >
                                <div className="flex items-center gap-6">
                                    {mapping.image && item[mapping.image] && (
                                        <img src={item[mapping.image]} alt="" loading="lazy" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
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
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((item, i) => (
                            <a
                                key={item.id || i}
                                href={`${mapping.link_prefix || '/content/'}${item.id}`}
                                className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all"
                            >
                                {mapping.image && item[mapping.image] && (
                                    <div className="aspect-video overflow-hidden bg-gray-100">
                                        <img src={item[mapping.image]} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                )}
            </div>
        </section>
    );
};

export default ContentListBlock;

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
        </section>
    );
};

export default ContentListBlock;

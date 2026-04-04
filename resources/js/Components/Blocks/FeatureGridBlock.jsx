import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const FeatureGridBlock = ({ data = {} }) => {
    const source = data.source || 'manual';
    const columns = data.columns || 3;
    const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.features) ? data.features : []);
    const mapping = data.mapping || {};

    let displayItems = [];

    if (source === 'manual') {
        displayItems = items;
    } else {
        // Dynamic Source: Map fields using data.mapping
        displayItems = items.map(item => ({
            id: item.id,
            title: mapping.title ? item[mapping.title] : (item.title || item.name || 'Untitled Feature'),
            desc: mapping.desc ? item[mapping.desc] : (item.desc || item.description),
            image: mapping.image ? item[mapping.image] : item.image,
            iconUrl: item.iconUrl
        }));
    }

    const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

    return (
        <section className="py-20 px-6 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {data.title && (
                    <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-16 tracking-tight">
                        {data.title}
                    </h2>
                )}
                <div className={`grid ${gridClasses} gap-10`}>
                    {displayItems.map((feature, i) => (
                        <div key={feature.id || i} className="p-8 rounded-3xl bg-gray-50 border border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 transition-all group overflow-hidden">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform overflow-hidden relative">
                                {feature.image ? (
                                    <img 
                                        src={feature.image} 
                                        alt={feature.title} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <CheckCircle2 className="w-8 h-8" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed line-clamp-3 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGridBlock;

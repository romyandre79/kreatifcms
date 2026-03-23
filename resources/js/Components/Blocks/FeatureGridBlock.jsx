import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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

export default FeatureGridBlock;

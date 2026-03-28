import React, { useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TimelineBlock = ({ data = {} }) => {
    const {
        layout = 'vertical', // 'vertical', 'horizontal'
        items = [],
        style = 'modern', // 'modern', 'minimal', 'glass'
        customCss = '',
        customJs = '',
        customPhp = '', // Handled by backend, but here for completeness
        alignment = 'alternating', // 'alternating', 'left', 'right' (for vertical)
    } = data;

    // Process custom JS
    useEffect(() => {
        if (customJs && typeof window !== 'undefined') {
            try {
                const script = document.createElement('script');
                script.innerHTML = `(function() { ${customJs} })();`;
                script.id = `timeline-js-${Math.random().toString(36).substr(2, 9)}`;
                document.body.appendChild(script);
                return () => {
                    const el = document.getElementById(script.id);
                    if (el) el.remove();
                };
            } catch (e) {
                console.error('Timeline Block Custom JS Error:', e);
            }
        }
    }, [customJs]);

    // Icon helper
    const IconRenderer = ({ name, className, color }) => {
        const Icon = LucideIcons[name] || LucideIcons.Circle;
        return <Icon className={className} style={{ color: color || 'currentColor' }} />;
    };

    const containerClasses = useMemo(() => {
        let base = "w-full py-12 px-4 md:px-8 overflow-hidden";
        if (style === 'glass') base += " backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl";
        if (style === 'minimal') base += " bg-transparent";
        return base;
    }, [style]);

    if (layout === 'horizontal') {
        return (
            <div className={containerClasses}>
                {customCss && <style>{customCss}</style>}
                <div className="flex overflow-x-auto pb-8 pt-4 gap-8 no-scrollbar scroll-smooth">
                    {items.map((item, index) => (
                        <div key={item.id || index} className="flex-shrink-0 w-72 relative">
                            {/* Horizontal Line */}
                            {index < items.length - 1 && (
                                <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
                            )}
                            
                             <div className="relative z-10 flex flex-col items-center text-center">
                                {/* Dot/Icon */}
                                <div 
                                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform hover:scale-110 mb-4`}
                                    style={{ backgroundColor: item.color || '#4f46e5' }}
                                >
                                    <IconRenderer name={item.icon || 'Clock'} className="w-5 h-5 text-white" />
                                </div>
                                
                                {item.image && (
                                    <div className="mb-4 w-full px-4">
                                        <div className="aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100">
                                            <img src={item.image} className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" alt={item.title} />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{item.date}</span>
                                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                    <div className="text-sm text-gray-600 prose prose-sm max-w-full italic">
                                        <ReactMarkdown>{item.content}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Vertical Layout
    return (
        <div className={containerClasses}>
            {customCss && <style>{customCss}</style>}
            <div className="relative max-w-5xl mx-auto">
                {/* Central Line */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

                <div className="space-y-12">
                    {items.map((item, index) => {
                        const isEven = index % 2 === 0;
                        const isLeft = alignment === 'left' || (alignment === 'alternating' && isEven);
                        
                        return (
                            <div 
                                key={item.id || index} 
                                className={`relative flex items-center ${alignment === 'left' ? 'flex-row' : (isLeft ? 'md:flex-row-reverse flex-row' : 'flex-row')}`}
                            >
                                {/* Dot/Icon in center/side */}
                                <div 
                                    className="absolute left-4 md:left-1/2 w-10 h-10 -ml-5 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md transition-all hover:scale-125 hover:rotate-12 cursor-pointer"
                                    style={{ backgroundColor: item.color || '#4f46e5' }}
                                >
                                    <IconRenderer name={item.icon || 'Clock'} className="w-4 h-4 text-white" />
                                </div>

                                {/* Content Card */}
                                <div className={`w-full md:w-1/2 ${alignment === 'left' ? 'pl-16' : (isLeft ? 'md:pr-12 pl-16 md:pl-0' : 'pl-16 md:pl-12')}`}>
                                    <div 
                                        className={`p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 ${style === 'glass' ? 'bg-white/40 backdrop-blur-md' : 'bg-white'}`}
                                    >
                                        {item.image && (
                                            <div className="mb-4 aspect-video rounded-xl overflow-hidden border border-gray-50">
                                                <img src={item.image} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt={item.title} />
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                            <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 rounded text-gray-500 uppercase tracking-wider">{item.date}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 prose prose-sm max-w-none">
                                            <ReactMarkdown>{item.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineBlock;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import * as LucideIcons from 'lucide-react';

const BlockHeader = ({ data = {} }) => {
    const {
        title,
        subtitle,
        cta_text,
        cta_url,
        align = 'left',
        title_color = '#111827',
        subtitle_color = '#6b7280',
    } = data;

    if (!title && !subtitle && !cta_text) return null;

    const alignmentClasses = {
        center: 'text-center items-center',
        right: 'text-right items-end',
        left: 'text-left items-start',
    }[align] || 'text-left items-start';

    const subtitleAlignmentClasses = {
        center: 'max-w-2xl mx-auto',
        right: 'ml-auto max-w-2xl',
        left: 'mr-auto max-w-2xl',
    }[align] || 'mr-auto max-w-2xl';

    return (
        <div className={`mb-16 space-y-4 flex flex-col ${alignmentClasses}`}>
            {title && (
                <h2 
                    className="text-4xl font-black tracking-tight uppercase"
                    style={{ color: title_color }}
                >
                    {title}
                </h2>
            )}
            {subtitle && (
                <div 
                    className={`text-lg leading-relaxed prose prose-sm max-w-none ${subtitleAlignmentClasses}`}
                    style={{ color: subtitle_color }}
                >
                    <ReactMarkdown>{subtitle}</ReactMarkdown>
                </div>
            )}
            {cta_text && cta_url && (
                <div className="pt-2">
                    <a 
                        href={cta_url}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-100 uppercase tracking-wider text-xs"
                    >
                        {cta_text}
                        <LucideIcons.ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                </div>
            )}
        </div>
    );
};

export default BlockHeader;

import React from 'react';
import * as LucideIcons from 'lucide-react';

const SocialMediaBlock = ({ data = {} }) => {
    const links = Array.isArray(data.links) ? data.links : [];
    const alignment = data.alignment || 'center';
    const size = data.size || 'md'; // sm, md, lg, xl
    const iconStyle = data.iconStyle || 'circular'; // minimal, circular, square, glass
    const backgroundColor = data.backgroundColor || '#ffffff';
    const textColor = data.textColor || '#111827';

    const getAlignmentClass = () => {
        if (alignment === 'left') return 'justify-start';
        if (alignment === 'right') return 'justify-end';
        return 'justify-center';
    };

    const getSizeClass = () => {
        if (size === 'sm') return 'w-8 h-8 p-1.5';
        if (size === 'lg') return 'w-12 h-12 p-3';
        if (size === 'xl') return 'w-16 h-16 p-4';
        return 'w-10 h-10 p-2.5'; // md
    };

    const getIconSize = () => {
        if (size === 'sm') return 16;
        if (size === 'lg') return 24;
        if (size === 'xl') return 32;
        return 20; // md
    };

    const getStyleClass = (customColor) => {
        const base = "flex items-center justify-center transition-all duration-300 hover:-translate-y-1";
        if (iconStyle === 'circular') return `${base} rounded-full shadow-sm hover:shadow-md border border-gray-100`;
        if (iconStyle === 'square') return `${base} rounded-xl shadow-sm hover:shadow-md border border-gray-100`;
        if (iconStyle === 'glass') return `${base} rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20`;
        return `${base}`; // minimal
    };

    if (links.length === 0 && typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
        return (
            <div className="py-12 flex items-center justify-center text-gray-400 bg-gray-50/50 border-y border-dashed border-gray-200">
                <div className="text-center">
                    <LucideIcons.Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium">Add social media links in settings</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="py-12 px-4" 
            style={{ backgroundColor: backgroundColor }}
        >
            <div className={`flex flex-wrap gap-4 ${getAlignmentClass()} max-w-7xl mx-auto`}>
                {links.map((link, idx) => {
                    const IconComponent = LucideIcons[link.icon] || LucideIcons.Link2;
                    return (
                        <a
                            key={link.id || idx}
                            href={link.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={getStyleClass()}
                            style={{ 
                                color: textColor,
                                backgroundColor: iconStyle === 'glass' ? undefined : (link.color || 'transparent')
                            }}
                            title={link.label || link.icon}
                        >
                            <IconComponent size={getIconSize()} strokeWidth={2} />
                        </a>
                    );
                })}
            </div>
        </div>
    );
};

export default SocialMediaBlock;

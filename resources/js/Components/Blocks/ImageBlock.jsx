import React from 'react';

const ImageBlock = ({ data = {} }) => (
    <div className="max-w-6xl mx-auto px-4 py-12">
        <figure className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 border border-gray-200">
            {data.url ? (
                <img src={data.url} alt={data.caption || 'Image'} loading="lazy" className="w-full h-auto object-cover" />
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

export default ImageBlock;

import React from 'react';
import { Link } from '@inertiajs/react';

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

export default HeroBlock;

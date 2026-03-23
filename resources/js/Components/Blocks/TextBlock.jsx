import React from 'react';
import ReactMarkdown from 'react-markdown';

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
                <div className={`prose prose-lg md:prose-xl max-w-none text-${data.align || 'left'} ${!data.textColor ? 'prose-indigo' : ''} prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-700 hover:prose-a:text-indigo-600`}
                    style={{ color: data.textColor || 'inherit' }}
                >
                    <ReactMarkdown>{data.content || ''}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};

export default TextBlock;

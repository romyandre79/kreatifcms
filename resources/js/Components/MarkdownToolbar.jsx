import React from 'react';
import { Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react';

export default function MarkdownToolbar({ onInsert }) {
    const tools = [
        { id: 'h1', icon: Heading1, title: 'Heading 1' },
        { id: 'h2', icon: Heading2, title: 'Heading 2' },
        { id: 'bold', icon: Bold, title: 'Bold' },
        { id: 'italic', icon: Italic, title: 'Italic' },
        { id: 'link', icon: LinkIcon, title: 'Insert Link' },
        { id: 'list', icon: List, title: 'Bulleted List' },
    ];

    return (
        <div className="flex items-center gap-0.5 p-1.5 bg-gray-100 border border-gray-200 rounded-t-xl overflow-x-auto no-scrollbar">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    type="button"
                    onClick={() => onInsert(tool.id)}
                    className="p-1.5 hover:bg-white hover:text-indigo-600 rounded-lg text-gray-500 transition-all flex-shrink-0"
                    title={tool.title}
                >
                    <tool.icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Settings, Trash2, Maximize2 } from 'lucide-react';

export default function WidgetCard({ id, widget, onEdit, onDelete, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        gridColumn: `span ${widget.width || 4} / span ${widget.width || 4}`,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full min-h-[250px]"
        >
            {/* Widget Header */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing transition-colors"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
                        {widget.settings?.title || 'Untitled Widget'}
                    </h3>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(widget)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Configure"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(widget.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Widget Content */}
            <div className="flex-1 p-5 overflow-hidden">
                {children}
            </div>
            
            {/* Widget Footer / Subtitle */}
            {widget.contentType && (
                <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-50 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Source: {widget.contentType.name}
                    </span>
                </div>
            )}
        </div>
    );
}

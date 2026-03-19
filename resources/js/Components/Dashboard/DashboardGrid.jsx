import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import WidgetCard from './WidgetCard';
import WidgetRenderer from './WidgetRenderer';

export default function DashboardGrid({ widgets, onOrderChange, onEdit, onDelete }) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = widgets.findIndex((w) => w.id === active.id);
            const newIndex = widgets.findIndex((w) => w.id === over.id);
            const newWidgets = arrayMove(widgets, oldIndex, newIndex);
            
            // Map back to IDs for persistence
            onOrderChange(newWidgets.map(w => w.id));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={widgets.map(w => w.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-12 gap-6 p-1">
                    {widgets.map((widget) => (
                        <WidgetCard
                            key={widget.id}
                            id={widget.id}
                            widget={widget}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        >
                            <WidgetRenderer widget={widget} />
                        </WidgetCard>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

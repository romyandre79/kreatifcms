import React, { useState, useEffect, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    rectIntersection,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    GripVertical, 
    ChevronDown, 
    ChevronRight, 
    ArrowUp, 
    ArrowDown, 
    Settings, 
    Columns, 
    LayoutGrid, 
    FileJson,
    Loader2,
    X,
    Layers,
    FileSpreadsheet,
    Printer,
    Download,
    Zap,
    Square,
    CheckSquare,
    Trash2,
    Info,
    Users,
    BarChart,
    ClipboardList,
    Package,
    Home,
    Globe,
    Shield,
    Activity,
    Database,
    Tag,
    Briefcase
} from 'lucide-react';

const iconMap = {
    GripVertical, ChevronDown, ChevronRight, ArrowUp, ArrowDown, 
    Settings, Columns, LayoutGrid, FileJson, Loader2, X, Layers, 
    FileSpreadsheet, Printer, Download, Zap, Square, CheckSquare, 
    Trash2, Info, Users, BarChart, ClipboardList, Package, Home, 
    Globe, Shield, Activity, Database, Tag, Briefcase
};

const DynamicIcon = ({ name, ...props }) => {
    const Icon = iconMap[name] || LayoutGrid;
    return <Icon {...props} />;
};


import axios from 'axios';

import { 
    useDroppable,
} from '@dnd-kit/core';


// --- Sortable Column Header Component ---
const SortableHeader = ({ id, label, isSorted, sortDesc, onSort, isGrouped, width, onResize, align = 'left' }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
        width: width || 'auto',
        minWidth: '100px'
    };

    return (
        <th
            ref={setNodeRef}
            style={style}
            className={`px-6 py-3 ${align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 relative group select-none ${isGrouped ? 'opacity-0 w-0 p-0 overflow-hidden' : ''}`}
        >
            <div className={`flex items-center space-x-2 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-600 transition-colors">
                    <GripVertical className="w-4 h-4" />
                </div>
                <div 
                    className="flex-1 cursor-pointer hover:text-indigo-600 transition-colors truncate"
                    onClick={() => onSort(id)}
                >
                    {label}
                    {isSorted && (
                        sortDesc ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />
                    )}
                </div>
                {/* Resize Handle Container (wider for easier clicking) */}
                <div 
                    onMouseDown={(e) => onResize(e, id)}
                    className="absolute right-0 top-0 bottom-0 w-4 cursor-col-resize z-20 group/resizer"
                >
                    {/* Visual Indicator Line */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gray-200 group-hover/resizer:bg-indigo-400 group-hover/resizer:h-full transition-all duration-200" />
                </div>
            </div>
        </th>
    );
};


// --- Droppable Grouping Zone ---
const GroupingZone = ({ groupBy, onRemove, config, compact = false }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'grouping-zone',
    });

    if (compact) {
        return (
            <div 
                ref={setNodeRef}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl transition-all duration-200 border-2 border-dashed w-full min-h-[52px] ${isOver ? 'bg-indigo-50 border-indigo-400 ring-4 ring-indigo-50' : 'bg-gray-50/50 border-gray-200 hover:border-indigo-200 hover:bg-white'}`}
            >
                <div className="flex items-center gap-1.5 shrink-0">
                    <Layers className={`w-3.5 h-3.5 ${isOver ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>
                
                <div className="flex flex-wrap gap-1.5 items-center">
                    {groupBy.length > 0 ? groupBy.map(f => {
                        const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === f || c.field === f));
                        return (
                            <span key={f} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black bg-white text-indigo-700 border border-indigo-100 shadow-sm">
                                {colDef?.label || f}
                                <X className="w-2.5 h-2.5 ml-1.5 cursor-pointer hover:text-red-500 transition-colors" onClick={() => onRemove(f)} />
                            </span>
                        );
                    }) : (
                        <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${isOver ? 'text-indigo-400' : 'text-gray-300'}`}>
                            {isOver ? 'Drop!' : 'Grouping'}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div 
            ref={setNodeRef}
            className={`px-6 py-3 border-b transition-all duration-200 flex items-center gap-3 ${isOver ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50/50 border-gray-100'}`}
            style={{ minHeight: '52px' }}
        >
            <div className="flex items-center gap-2">
                <LayoutGrid className={`w-4 h-4 ${isOver ? 'text-indigo-500' : 'text-gray-400'}`} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Group by:</span>
            </div>
            
            <div className="flex-1 flex flex-wrap gap-2 items-center">
                {groupBy.length > 0 ? groupBy.map(f => {
                    const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === f || c.field === f));
                    return (
                        <span key={f} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-100 shadow-sm animate-in fade-in zoom-in duration-200">
                             <Layers className="w-3 h-3 mr-1.5 opacity-50" />
                            {colDef?.label || f}
                            <X className="w-3 h-3 ml-2 cursor-pointer hover:text-red-500 transition-colors" onClick={() => onRemove(f)} />
                        </span>
                    );
                }) : (
                    <span className={`text-xs italic transition-colors ${isOver ? 'text-indigo-400 font-medium' : 'text-gray-300'}`}>
                        {isOver ? 'Drop to group!' : 'Drag column headers here to create groups...'}
                    </span>
                )}
            </div>
        </div>
    );
};

// --- Advanced DataGrid Component ---
export default function AdvancedDataGrid({ 
    slug, 
    config: initialConfig = {}, 
    initialData = [],
    onAction = null 
}) {
    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles?.map(r => r.name) || [];
    const config = initialConfig;

    const checkPermission = (btn) => {
        if (!btn.allowed_roles || btn.allowed_roles.length === 0) return true;
        return btn.allowed_roles.some(role => userRoles.includes(role));
    };

    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(!initialData.length);
    const [columns, setColumns] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [groupBy, setGroupBy] = useState([]);
    const [sort, setSort] = useState([]);
    const [columnWidths, setColumnWidths] = useState({});
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [density, setDensity] = useState('standard'); // 'standard' or 'compact'
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [total, setTotal] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);

    // --- Persistence ---
    useEffect(() => {
        const savedState = localStorage.getItem(`datagrid_state_${slug}`);
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.groupBy) setGroupBy(state.groupBy);
                if (state.visibleColumns) setVisibleColumns(state.visibleColumns);
                if (state.sort) setSort(state.sort);
                if (state.columnWidths) setColumnWidths(state.columnWidths);
                if (state.density) setDensity(state.density);
            } catch (e) {
                console.error("Failed to restore datagrid state", e);
            }
        }
    }, [slug]);

    useEffect(() => {
        const state = { groupBy, visibleColumns, sort, columnWidths, density };
        localStorage.setItem(`datagrid_state_${slug}`, JSON.stringify(state));
    }, [groupBy, visibleColumns, sort, columnWidths, density, slug]);

    // --- Data Fetching ---
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('datagrids.data', slug), {
                params: {
                    page,
                    perPage,
                    sort: JSON.stringify(sort),
                    group: groupBy[0] 
                }
            });
            setData(response.data.data);
            setTotal(response.data.total);
        } catch (err) {
            console.error("Failed to fetch datagrid data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page, perPage, sort, groupBy]);

    const handleExportCsv = () => {
        const url = route('datagrids.export.csv', { 
            slug, 
            columns: JSON.stringify(visibleColumns.map(val => {
                const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === val || c.field === val));
                return { key: val, label: colDef?.label || val };
            }))
        });
        window.open(url, '_blank');
    };

    const handleExportPrint = () => {
        const url = route('datagrids.export.print', { 
            slug, 
            columns: JSON.stringify(visibleColumns.map(val => {
                const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === val || c.field === val));
                return { key: val, label: colDef?.label || val };
            }))
        });
        window.open(url, '_blank');
    };

    // Initialize columns from config

    useEffect(() => {
        if (config && config.columns) {
            const cols = config.columns;
            setColumns(cols.map(c => c.key));
            if (visibleColumns.length === 0) {
                 setVisibleColumns(cols.filter(c => c.visible !== false).map(c => c.key));
            }
        } else if (config && config.settings && config.settings.columns) {
             const cols = config.settings.columns;
             setColumns(cols.map(c => c.field));
             if (visibleColumns.length === 0) {
                setVisibleColumns(cols.filter(c => c.visible !== false).map(c => c.field));
             }
        }
    }, [config]);

    // --- Reordering & Grouping Logic ---
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;

        if (over.id === 'grouping-zone') {
            if (!groupBy.includes(active.id)) {
                setGroupBy(prev => [...prev, active.id]);
            }
        } else if (active.id !== over.id) {
            setVisibleColumns((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- Resizing Logic ---
    const [isResizing, setIsResizing] = useState(false);

    const handleResize = (e, colId) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.pageX;
        const thElement = e.currentTarget.closest('th');
        if (!thElement) return;
        
        const startWidth = thElement.offsetWidth;
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        
        const onMouseMove = (moveEvent) => {
            const newWidth = Math.max(80, startWidth + (moveEvent.pageX - startX));
            setColumnWidths(prev => ({ ...prev, [colId]: newWidth }));
        };
        
        const onMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleRowClick = (item, actionId = null, btn = null) => {
        if (!config.broadcastClicks && !actionId) return;
        
        const event = new CustomEvent('kreatifcms:row-selected', { 
            detail: { 
                ...item, 
                action_id: actionId,
                action_label: btn?.label || null,
                target_display_mode: btn?.target_display_mode || null,
                content_type: config.content_type 
            } 
        });
        window.dispatchEvent(event);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === data.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data.map(item => item.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
        
        // Placeholder for bulk delete - can be extended later with a specific endpoint
        axios.post(route('datagrids.action.bulk', slug), { 
            action: 'delete',
            ids: selectedIds 
        })
        .then(res => {
            if (res.data.success) {
                setSelectedIds([]);
                fetchData();
            }
        })
        .catch(err => alert(err.response?.data?.error || "Bulk action failed"));
    };



    // --- Aggregation Logic ---
    const calculateSummaries = (items) => {
        const results = {};
        const cols = config.columns || config.settings?.columns || [];
        
        cols.forEach(col => {
            const type = col.summary_type;
            if (!type || type === 'none') return;
            
            const key = col.key || col.field;
            const values = items.map(item => {
                const val = item[key];
                return typeof val === 'number' ? val : parseFloat(val);
            }).filter(v => !isNaN(v));
            
            if (values.length === 0 && type !== 'count') return;
            
            let result = 0;
            switch (type) {
                case 'sum':
                    result = values.reduce((a, b) => a + b, 0);
                    break;
                case 'avg':
                    result = values.reduce((a, b) => a + b, 0) / values.length;
                    break;
                case 'min':
                    result = Math.min(...values);
                    break;
                case 'max':
                    result = Math.max(...values);
                    break;
                case 'count':
                    result = items.length;
                    break;
            }
            
            // Format result with thousand separators and precision
            const colDef = cols.find(c => c.key === key || c.field === key);
            const decimals = parseInt(colDef?.decimals || 0);
            
            results[key] = {
                type,
                value: typeof result === 'number' ? result.toLocaleString(undefined, {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                }) : result
            };
        });
        return results;
    };

    // --- Grouping Logic (Recursive) ---
    const groupItems = (items, groups) => {
        if (groups.length === 0) return items;
        const [currentGroup, ...remainingGroups] = groups;
        const grouped = {};
        
        items.forEach(item => {
            const val = item[currentGroup] || 'Unknown';
            if (!grouped[val]) grouped[val] = [];
            grouped[val].push(item);
        });

        return Object.entries(grouped).map(([key, groupItems]) => ({
            key,
            field: currentGroup,
            items: groupItems,
            nested: groupItems.length > 0 && remainingGroups.length > 0 ? groupItems : null,
            subGroups: groupItems.length > 0 && remainingGroups.length > 0 ? groupItems : []
        }));
    };

    const toggleGroup = (groupId) => {
        const next = new Set(expandedGroups);
        if (next.has(groupId)) next.delete(groupId);
        else next.add(groupId);
        setExpandedGroups(next);
    };

    const renderGroupedRows = (items, currentGroupBy, depth = 0) => {
        if (currentGroupBy.length === 0) {
            return items.map(item => renderRow(item, depth));
        }

        const [groupField, ...remaining] = currentGroupBy;
        const grouped = groupItems(items, [groupField]);

        return grouped.map(group => {
            const groupId = `${depth}-${group.key}`;
            const isExpanded = expandedGroups.has(groupId);
            
            const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === groupField || c.field === groupField));
            const label = colDef?.label || groupField;
            const groupSummaries = calculateSummaries(group.items);

            return (
                <React.Fragment key={groupId}>
                    <tr className="bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer group" onClick={() => toggleGroup(groupId)}>
                        <td className="w-0 p-0"></td>
                        {config.showSelection && <td className="px-6 py-2 border-b border-gray-100"></td>}
                        
                        {visibleColumns.map((col, idx) => (
                            <td key={col} className="px-6 py-2 border-b border-gray-100">
                                {idx === 0 ? (
                                    <div className="flex items-center text-sm font-semibold text-gray-700" style={{ paddingLeft: `${depth * 20}px` }}>
                                        {isExpanded ? <ChevronDown className="w-4 h-4 mr-2 text-indigo-500" /> : <ChevronRight className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-500" />}
                                        <span className="text-gray-400 font-normal mr-2">{label}:</span>
                                        {group.key}
                                        <span className="ml-2 text-[10px] text-gray-400 font-normal bg-white px-2 py-0.5 rounded-full border border-gray-100 group-hover:border-indigo-100 group-hover:text-indigo-500">
                                            {group.items.length} items
                                        </span>
                                    </div>
                                ) : (
                                    groupSummaries[col] && (
                                        <div className="text-right">
                                            <span className="text-[9px] text-gray-400 uppercase font-black mr-1.5">{groupSummaries[col].type}:</span>
                                            <span className="text-xs font-bold text-indigo-600">{groupSummaries[col].value}</span>
                                        </div>
                                    )
                                )}
                            </td>
                        ))}
                        <td className="px-6 py-2 border-b border-gray-100"></td>
                    </tr>
                    {isExpanded && (
                        remaining.length > 0 
                            ? renderGroupedRows(group.items, remaining, depth + 1)
                            : group.items.map(item => renderRow(item, depth + 1))
                    )}
                </React.Fragment>
            );
        });
    };

    const renderRow = (item, depth = 0) => {
        const isSelected = selectedIds.includes(item.id);
        
        return (
            <tr 
                key={item.id} 
                className={`hover:bg-indigo-50/40 transition-colors group cursor-default ${config.broadcastClicks ? 'cursor-pointer' : ''} ${isSelected ? 'bg-indigo-50/20' : ''}`}
                onClick={() => handleRowClick(item)}
            >
                <td className="w-0 p-0"></td> 
                {config.showSelection && (
                    <td className="px-6 py-4 whitespace-nowrap w-10">
                        <label className="flex items-center justify-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={(e) => { e.stopPropagation(); toggleSelectRow(item.id); }}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all cursor-pointer"
                            />
                        </label>
                    </td>
                )}
                {visibleColumns.map((col, idx) => {
                    const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === col || c.field === col));
                    const isNumber = colDef?.type === 'integer' || colDef?.type === 'number' || colDef?.type === 'decimal';
                    const align = colDef?.align || (isNumber ? 'right' : 'left');
                    
                    const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

                    return (
                        <td 
                            key={col} 
                            className={`${density === 'compact' ? 'px-4 py-2' : 'px-6 py-4'} whitespace-nowrap text-sm text-gray-900 ${alignClass}`} 
                            style={{ 
                                ...(idx === 0 ? { paddingLeft: `${depth * 20 + 24}px` } : {}),
                                width: columnWidths[col] || 'auto'
                            }}
                        >
                            {renderCell(item, col)}
                        </td>
                    );
                })}
                <td className={`${density === 'compact' ? 'px-4 py-2' : 'px-6 py-4'} whitespace-nowrap text-right text-sm font-medium`}>
                    <div className="flex justify-end gap-2">
                        {renderButtons(item)}
                    </div>
                </td>
            </tr>
        );
    };

    const renderCell = (item, col) => {
        const val = item[col];
        if (val === null || val === undefined) return <span className="text-gray-300">-</span>;
        
        const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === col || c.field === col));
        
        // Handle Images
        if (colDef?.type === 'image' && val) {
            return <img src={val} className="w-8 h-8 rounded shadow-sm object-cover" />;
        }

        // Handle Numbers with precision
        const num = parseFloat(val);
        const isNumericValue = !isNaN(num) && (typeof val === 'number' || (typeof val === 'string' && val.trim() !== '' && !isNaN(num)));
        const isNumeric = (colDef?.type === 'integer' || colDef?.type === 'number' || colDef?.type === 'decimal' || isNumericValue);
        
        if (isNumeric && typeof val !== 'boolean') {
            const decimals = parseInt(colDef?.decimals || 0);
            return num.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
        }
        
        return val.toString();
    };


    const renderIcon = (btn) => {
        if (btn.icon_image) {
            return <img src={btn.icon_image} className="w-3.5 h-3.5 object-contain mr-1.5 inline-block" alt="" />;
        }
        if (btn.icon_class) {
            return <i className={`${btn.icon_class} text-[11px] mr-1.5`}></i>;
        }
        return null;
    };

    const renderButtons = (item) => {
        if (!config.buttons) return null;
        
        const rowButtons = config.buttons.filter(btn => 
            (btn.placement === 'row' || !btn.placement) && checkPermission(btn)
        );

        if (rowButtons.length === 0) return null;

        return (
            <div className="flex justify-end space-x-2">
                {rowButtons.map((btn, idx) => {
                    const variantClasses = {
                        indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                        red: 'bg-red-50 text-red-700 hover:bg-red-100',
                        emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                        amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                        gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    };

                    const buttonClass = variantClasses[btn.variant] || 'text-gray-400 hover:text-indigo-600';

                    return (
                        <button
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:scale-105 active:scale-95 flex items-center ${buttonClass}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleButtonAction(btn, item, idx);
                            }}
                            title={btn.label}
                        >
                            {renderIcon(btn)}
                            {btn.label && <span>{btn.label}</span>}
                        </button>
                    )
                })}
            </div>
        );
    };

    const renderHeaderButtons = () => {
        if (!config.buttons) return null;

        const headerButtons = config.buttons.filter(btn => 
            btn.placement === 'header' && checkPermission(btn)
        );

        return headerButtons.map((btn, idx) => {
             const variantClasses = {
                indigo: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
                red: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
                emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
                amber: 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm',
                gray: 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm'
            };

            const buttonClass = variantClasses[btn.variant] || 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm';

            return (
                <button
                    key={`hbtn-${idx}`}
                    onClick={() => handleButtonAction(btn, null, idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 ${buttonClass}`}
                >
                    {renderIcon(btn)}
                    {btn.label && <span>{btn.label}</span>}
                </button>
            );
        });
    };

    const handleButtonAction = (btn, item, index) => {
        // Broadcast always if it's a row action (excluding simple redirects if they are intended to only move page, BUT usually even then broadcast is helpful)
        if (item) {
            handleRowClick(item, btn.action_id, btn);
        }

        if (btn.action_type === 'fill_and_redirect') {
            try {
                const transfer = {
                    content_type: config.content_type,
                    data: item,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('kreatifcms_grid_transfer', JSON.stringify(transfer));
                if (btn.redirect_url) {
                    window.location.href = btn.redirect_url;
                }
            } catch (e) {
                console.error('[AdvancedDataGrid] Redirect failed:', e);
            }
            return;
        }

        if (btn.js) {
            try {
                const runner = new Function('item', 'grid', btn.js);
                runner(item, { slug, config });
            } catch (e) {
                console.error("JS Action Error", e);
            }
        }

        if (btn.php) {
            axios.post(route('datagrids.action', { slug, buttonIndex: index }), { id: item.id })
                .then(res => {
                    if (res.data.success) {
                        fetchData();
                    }
                })
                .catch(err => alert(err.response?.data?.error || "Action failed"));
        }
    };

    const handleSort = (field) => {
        setSort(prev => {
            const current = prev.find(s => s.selector === field);
            if (!current) return [{ selector: field, desc: false }];
            if (!current.desc) return [{ selector: field, desc: true }];
            return [];
        });
    };

    return (
        <DndContext 
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="bg-white flex flex-col h-full relative">
                {/* --- Toolbar --- */}
                <div className="px-8 py-5 bg-white border-b border-gray-100 flex items-center gap-8">

                    <div className="flex-1 min-w-0">
                         <GroupingZone 
                            compact={true}
                            groupBy={groupBy} 
                            onRemove={(f) => setGroupBy(prev => prev.filter(x => x !== f))}
                            config={config}
                        />
                    </div>

                    <div className="flex-none flex items-center space-x-2">
                        {renderHeaderButtons()}
                        {/* Column Toggle dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => { setShowVisibilityMenu(!showVisibilityMenu); setShowSettingsMenu(false); }}
                                className={`p-2.5 rounded-xl transition-all border ${showVisibilityMenu ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                            >
                                <Columns className="w-5 h-5" />
                            </button>
                            {showVisibilityMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Toggle Columns</span>
                                        <button onClick={() => setVisibleColumns(columns)} className="text-[9px] font-bold text-indigo-600 hover:underline">Reset</button>
                                    </div>
                                    <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar">
                                        {columns.map(col => {
                                            const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === col || c.field === col));
                                            const isVisible = visibleColumns.includes(col);
                                            return (
                                                <label key={col} className="flex items-center group cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isVisible}
                                                        onChange={() => {
                                                            setVisibleColumns(prev => isVisible ? prev.filter(c => c !== col) : [...prev, col]);
                                                        }}
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <span className={`ml-3 text-xs font-medium ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>{colDef?.label || col}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Settings dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => { setShowSettingsMenu(!showSettingsMenu); setShowVisibilityMenu(false); }}
                                className={`p-2.5 rounded-xl transition-all border ${showSettingsMenu ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100'}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                            {showSettingsMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Display Settings</span>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 block mb-2 uppercase">Row Density</label>
                                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                                <button 
                                                    onClick={() => setDensity('standard')}
                                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase ${density === 'standard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Standard
                                                </button>
                                                <button 
                                                    onClick={() => setDensity('compact')}
                                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase ${density === 'compact' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                >
                                                    Compact
                                                </button>
                                            </div>
                                        </div>
                                        <div>

                                            <label className="text-[10px] font-bold text-gray-500 block mb-2 uppercase tracking-wider">Export Data</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <button 
                                                    onClick={handleExportCsv}
                                                    className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-indigo-100 shadow-sm"
                                                >
                                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                                    Export to Excel
                                                </button>
                                                <button 
                                                    onClick={handleExportPrint}
                                                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-emerald-100 shadow-sm"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                    Export to PDF
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* --- Grouping Zone removed from here --- */}

                {/* --- Grid Table --- */}
                <div className="flex-1 overflow-auto relative min-h-[100px]">
                    {loading && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-50">
                            <div className="bg-white p-4 rounded-xl shadow-2xl flex items-center space-x-3 border border-gray-100">
                                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                <span className="font-bold text-gray-700 tracking-tight">Syncing data...</span>
                            </div>
                        </div>
                    )}

                    <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
                            <SortableContext 
                                items={visibleColumns} 
                                strategy={horizontalListSortingStrategy}
                            >
                                <tr>
                                    <th className="w-0 p-0"></th>
                                    {config.showSelection && (
                                        <th className="px-6 py-4 text-left w-10 bg-gray-50 border-b border-gray-200">
                                            <label className="flex items-center justify-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={data.length > 0 && selectedIds.length === data.length}
                                                    onChange={toggleSelectAll}
                                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all cursor-pointer"
                                                />
                                            </label>
                                        </th>
                                    )}
                                    {visibleColumns.map((col) => {
                                        const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === col || c.field === col));
                                        const s = sort.find(x => x.selector === col);
                                        const isNumber = colDef?.type === 'integer' || colDef?.type === 'number' || colDef?.type === 'decimal';
                                        const align = colDef?.align || (isNumber ? 'right' : 'left');

                                        return (
                                            <SortableHeader 
                                                key={col} 
                                                id={col} 
                                                label={colDef?.label || col} 
                                                isSorted={!!s}
                                                sortDesc={s?.desc}
                                                onSort={handleSort}
                                                isGrouped={groupBy.includes(col)}
                                                width={columnWidths[col]}
                                                onResize={handleResize}
                                                align={align}
                                            />
                                        );
                                    })}
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-200">
                                        Actions
                                    </th>
                                </tr>
                            </SortableContext>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {renderGroupedRows(data, groupBy)}
                        </tbody>

                        {/* Global Summary Footer */}
                        {data.length > 0 && Object.keys(calculateSummaries(data)).length > 0 && (
                            <tfoot className="bg-gray-50/50 border-t border-gray-200">
                                <tr>
                                    <td className="w-0 p-0"></td>
                                    {config.showSelection && <td className="px-6 py-4"></td>}
                                    {visibleColumns.map((col, idx) => {
                                        const summaries = calculateSummaries(data);
                                        const colDef = (config.columns || config.settings?.columns || []).find(c => (c.key === col || c.field === col));
                                        const isNumber = colDef?.type === 'integer' || colDef?.type === 'number' || colDef?.type === 'decimal';
                                        const align = colDef?.align || (isNumber ? 'right' : 'left');
                                        const alignClass = align === 'right' ? 'items-end' : align === 'center' ? 'items-center' : 'items-start';

                                        return (
                                            <td key={col} className="px-6 py-4">
                                                {idx === 0 && <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">Total Page Summary</span>}
                                                {summaries[col] && (
                                                    <div className={`flex flex-col ${alignClass}`}>
                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{summaries[col].type}</span>
                                                        <span className="text-sm font-black text-indigo-700">{summaries[col].value}</span>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    {!loading && data.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <FileJson className="w-16 h-16 opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-700">No data found</h3>
                            <p className="text-sm">Try adjusting your filters or search terms</p>
                        </div>
                    )}

                    {/* --- Bulk Action Bar --- */}
                    {selectedIds.length > 0 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-gray-700 backdrop-blur-md bg-opacity-95">
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">
                                        {selectedIds.length}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Selected</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Pagination --- */}
                <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span className="text-xs font-medium text-gray-400">Rows:</span>
                            <select 
                                value={perPage} 
                                onChange={e => setPerPage(Number(e.target.value))}
                                className="bg-gray-50 border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-indigo-500 focus:border-indigo-100"
                            >
                                {[10, 15, 30, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="h-4 w-px bg-gray-100"></div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            {total} {config.settings?.footer_text || 'Records Found'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <div className="text-xs font-black text-gray-900 bg-gray-50 px-4 py-2 rounded-xl">
                            PAGE {page} <span className="text-gray-300 mx-1">/</span> {Math.ceil(total / perPage)}
                        </div>
                        <button 
                            disabled={page >= Math.ceil(total / perPage)}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-xl bg-white border border-gray-100 text-gray-400 disabled:opacity-30 hover:bg-gray-50 hover:text-indigo-600 transition-all shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <DragOverlay dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                        active: {
                            opacity: '0.4',
                        },
                    },
                }),
            }}>
                {activeId ? (
                    <div className="px-6 py-3 bg-white border border-indigo-200 rounded-xl shadow-2xl text-xs font-bold text-indigo-700 flex items-center gap-3 backdrop-blur-sm ring-4 ring-indigo-50/50">
                        <GripVertical className="w-4 h-4 text-indigo-400" />
                        {(config.columns || config.settings?.columns || []).find(c => (c.key === activeId || c.field === activeId))?.label || activeId}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

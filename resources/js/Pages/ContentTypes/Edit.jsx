import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2, GripVertical, Save, Type as TypeIcon, Hash, Calendar, CheckSquare, Code, FileText, Send, Image as ImageIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FIELD_TYPES = [
    { type: 'text', label: 'Short Text', icon: TypeIcon },
    { type: 'longtext', label: 'Long Text', icon: FileText },
    { type: 'integer', label: 'Number', icon: Hash },
    { type: 'boolean', label: 'Boolean', icon: CheckSquare },
    { type: 'date', label: 'Date', icon: Calendar },
    { type: 'json', label: 'JSON', icon: Code },
    { type: 'image', label: 'Image', icon: ImageIcon },
    { type: 'file', label: 'File', icon: FileText },
    { type: 'relation', label: 'Relation', icon: Plus },
];

function SortableField({ field, onRemove, onUpdate, isNew, allContentTypes }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(field.id) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const targetCt = allContentTypes?.find(ct => ct.id == field.options?.target_id);
    const targetFields = targetCt?.fields || [];

    return (
        <div ref={setNodeRef} style={style} className="p-4 mb-4 bg-white border border-gray-200 rounded-xl shadow-sm group hover:border-indigo-300 transition-all">
            <div className="flex items-center gap-4 mb-4">
                <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-indigo-600 transition-colors">
                    <GripVertical className="w-5 h-5" />
                </button>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Field Name</label>
                        <input
                            type="text"
                            placeholder="e.g. title, price"
                            value={field.name}
                            disabled={!isNew}
                            onChange={(e) => onUpdate(field.id, { name: e.target.value })}
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${!isNew ? 'bg-gray-50 text-gray-400' : ''}`}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Field Type</label>
                        <select
                            value={field.type}
                            disabled={!isNew && field.type !== 'text'}
                            onChange={(e) => onUpdate(field.id, { type: e.target.value, options: e.target.value === 'relation' ? { on_delete: 'restrict' } : {} })}
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${(!isNew && field.type !== 'text') ? 'bg-gray-50 text-gray-400' : ''}`}
                        >
                            {FIELD_TYPES.map((ft) => {
                                if (!isNew && field.type !== 'text' && ft.type !== field.type) return null;
                                if (!isNew && field.type === 'text' && ft.type !== 'text' && ft.type !== 'longtext') return null;
                                return <option key={ft.type} value={ft.type}>{ft.label}</option>;
                            })}
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                            {field.type === 'relation' ? 'Relation Config' : 'Field Description (Optional)'}
                        </label>
                        {field.type === 'relation' ? (
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={field.options?.target_id || ''}
                                    onChange={(e) => onUpdate(field.id, { options: { ...field.options, target_id: e.target.value, display_field: '' } })}
                                    className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Target Type...</option>
                                    {allContentTypes?.map(ct => (
                                        <option key={ct.id} value={ct.id}>{ct.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={field.options?.display_field || ''}
                                    disabled={!field.options?.target_id}
                                    onChange={(e) => onUpdate(field.id, { options: { ...field.options, display_field: e.target.value } })}
                                    className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Display Field...</option>
                                    {targetFields.filter(f => ['text', 'integer', 'date'].includes(f.type)).map(f => (
                                        <option key={f.id} value={f.name.toLowerCase().replace(/\s+/g, '_')}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder="Describe this field..."
                                value={field.description || ''}
                                onChange={(e) => onUpdate(field.id, { description: e.target.value })}
                                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Req</span>
                        <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Uniq</span>
                        <input
                            type="checkbox"
                            checked={field.is_unique || false}
                            onChange={(e) => onUpdate(field.id, { is_unique: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                    </div>
                    
                    {isNew && (
                        <button
                            type="button"
                            onClick={() => onRemove(field.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mt-4"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {field.type === 'relation' && (
                <div className="flex items-center gap-4 pt-4 border-t border-gray-50 px-9">
                    <div className="flex-1 flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500">On Delete:</span>
                        <select
                            value={field.options?.on_delete || 'restrict'}
                            onChange={(e) => onUpdate(field.id, { options: { ...field.options, on_delete: e.target.value } })}
                            className="flex-1 max-w-xs rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs py-1"
                        >
                            <option value="restrict">Restrict (Prevent parent deletion if children exist)</option>
                            <option value="cascade">Cascade (Delete children when parent is deleted)</option>
                        </select>
                    </div>
                    <p className="text-[11px] text-gray-400 italic">
                        Define what happens to related data when the target record is deleted.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function Edit({ contentType, allContentTypes }) {
    const { data, setData, put, processing, errors } = useForm({
        name: contentType.name,
        description: contentType.description || '',
        type: contentType.type || 'collection',
        events: contentType.events || {
            onSelect: '',
            onInsert: '',
            onUpdate: '',
            onDelete: ''
        },
        fields: contentType.fields.map(f => ({ ...f, isNew: false })),
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setData(prevData => {
                const oldIndex = prevData.fields.findIndex((f) => String(f.id) === String(active.id));
                const overIndex = prevData.fields.findIndex((f) => String(f.id) === String(over.id));

                if (oldIndex !== -1 && overIndex !== -1) {
                    return {
                        ...prevData,
                        fields: arrayMove(prevData.fields, oldIndex, overIndex)
                    };
                }
                return prevData;
            });
        }
    };

    const addField = () => {
        const newId = `new-${Date.now()}`;
        setData(prev => ({
            ...prev,
            fields: [
                ...prev.fields,
                { id: newId, name: '', type: 'text', required: false, is_unique: false, description: '', options: {}, isNew: true }
            ]
        }));
    };

    const removeField = (id) => {
        setData(prev => ({
            ...prev,
            fields: prev.fields.filter(f => f.id !== id)
        }));
    };

    const updateField = (id, updates) => {
        setData(prev => ({
            ...prev,
            fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('content-types.update', contentType.id));
    };

    const handlePush = () => {
        if (!confirm('Are you sure you want to push this schema to staging/production?')) return;
        
        axios.post(route('content-types.push', contentType.id))
            .then(res => alert('Success: ' + res.data.message))
            .catch(err => alert('Error: ' + (err.response?.data?.error || err.message)));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Content Type: {contentType.name}</h2>}
        >
            <Head title={`Edit ${contentType.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Note: Existing fields cannot be renamed or deleted once the schema is created to prevent data loss. You can add new fields.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="type" 
                                                value="collection"
                                                checked={data.type === 'collection'}
                                                onChange={e => setData('type', e.target.value)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className={`text-sm font-medium ${data.type === 'collection' ? 'text-indigo-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                Collection Type
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="type" 
                                                value="single"
                                                checked={data.type === 'single'}
                                                onChange={e => setData('type', e.target.value)}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                            />
                                            <span className={`text-sm font-medium ${data.type === 'single' ? 'text-indigo-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                Single Type
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500 italic">
                                        Note: Changing the type affects how the content is managed in the Data Manager.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">Fields Configuration</h3>
                                <button
                                    type="button"
                                    onClick={addField}
                                    className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Field
                                </button>
                            </div>

                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={data.fields.map(f => String(f.id))} strategy={verticalListSortingStrategy}>
                                    {data.fields.map((field) => (
                                        <SortableField
                                            key={field.id}
                                            field={field}
                                            isNew={field.isNew}
                                            onRemove={removeField}
                                            onUpdate={updateField}
                                            allContentTypes={allContentTypes}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>

                        {/* PHP Hooks Section */}
                        <div className="bg-white p-6 shadow sm:rounded-lg border-l-4 border-yellow-400">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 font-premium flex items-center gap-2">
                                    <Code className="w-5 h-5 text-yellow-500" />
                                    PHP Event Hooks (Advanced)
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Execute custom PHP code during the content entry lifecycle. 
                                    <strong> Use with extreme caution.</strong> Available variables: <code className="bg-gray-100 px-1 rounded text-pink-600">$data</code> (for writing hooks) and <code className="bg-gray-100 px-1 rounded text-pink-600">$entry</code> (for reading/updating existing).
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">onSelect</label>
                                    <p className="text-xs text-gray-500 mb-2">Runs after an entry is retrieved. Modify <code className="bg-gray-50 px-1 rounded">$entry</code> attributes.</p>
                                    <textarea
                                        value={data.events?.onSelect || ''}
                                        onChange={e => setData('events', { ...data.events, onSelect: e.target.value })}
                                        placeholder="// e.g. $entry->title = strtoupper($entry->title);"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">onInsert</label>
                                    <p className="text-xs text-gray-500 mb-2">Runs before a new entry is saved. Modify the <code className="bg-gray-50 px-1 rounded">$data</code> array.</p>
                                    <textarea
                                        value={data.events?.onInsert || ''}
                                        onChange={e => setData('events', { ...data.events, onInsert: e.target.value })}
                                        placeholder="// e.g. $data['slug'] = Str::slug($data['title']);"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">onUpdate</label>
                                    <p className="text-xs text-gray-500 mb-2">Runs before an existing entry is updated. Access <code className="bg-gray-50 px-1 rounded">$data</code> array and <code className="bg-gray-50 px-1 rounded">$entry</code> object.</p>
                                    <textarea
                                        value={data.events?.onUpdate || ''}
                                        onChange={e => setData('events', { ...data.events, onUpdate: e.target.value })}
                                        placeholder="// e.g. if (!isset($data['updated_by'])) $data['updated_by'] = auth()->id();"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">onDelete</label>
                                    <p className="text-xs text-gray-500 mb-2">Runs before an entry is deleted. Access <code className="bg-gray-50 px-1 rounded">$entry</code> object.</p>
                                    <textarea
                                        value={data.events?.onDelete || ''}
                                        onChange={e => setData('events', { ...data.events, onDelete: e.target.value })}
                                        placeholder="// e.g. Log::info('Deleting entry ' . $entry->id);"
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            {!contentType.isNew && (
                                <button
                                    type="button"
                                    onClick={handlePush}
                                    className="inline-flex items-center px-6 py-3 bg-white border border-indigo-600 rounded-md font-semibold text-sm text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <Send className="w-5 h-5 mr-2" />
                                    Push to Staging
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-md font-semibold text-sm text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Update Content Type
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

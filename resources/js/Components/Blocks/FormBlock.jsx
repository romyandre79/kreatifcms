import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import SearchableSelect from '@/Components/SearchableSelect';
import CaptchaWidget from '@/Components/CaptchaWidget';
import Modal from '@/Components/Modal';

const formatNumberByLocale = (value, locale) => {
    if (value === null || value === undefined || value === '') return '';
    const cleanValue = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanValue);
    if (isNaN(num)) return value;
    return new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(num);
};

const parseNumberByLocale = (value, locale) => {
    if (value === null || value === undefined || value === '') return '';
    if (locale === 'id') {
        return value.toString().replace(/\./g, '').replace(/,/g, '.');
    }
    return value.toString().replace(/,/g, '');
};


export default function FormBlock({ data, contentTypes = [] }) {
    const {
        mode = 'static',
        fields = [],
        content_type: contentTypeSlug = '',
        title = '',
        description = '',
        success_message = 'Thank you for your submission!',
        submit_button_text = 'Submit',
        align = 'left',
        onSuccessJs = '',
        field_config = {},
        syncWithGrid = false,
        display_mode = 'standard', // 'standard' or 'modal'
        trigger_action_id = ''
    } = data;
    const hasItems = data.has_items || false;
    const itemsConfig = data.items_config || null;

    const { localization } = usePage().props;
    const activeLocale = localization?.active_locale || 'en';

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [submitAction, setSubmitAction] = useState('save');
    const [subItemsOptions, setSubItemsOptions] = useState({});
    const [relationOptions, setRelationOptions] = useState({});

    // Determine fields to render
    let fieldsToRender = [];
    const contentType = (contentTypes || []).find(ct => ct.slug === contentTypeSlug);
    if (mode === 'dynamic' && contentTypeSlug && contentType && contentType.fields) {
        fieldsToRender = contentType.fields.map(f => {
            const slugName = f.name.toLowerCase().replace(/ /g, '_');
            const config = field_config[f.name] || field_config[slugName] || {};

            const targetCt = f.type === 'relation' && f.options?.target_id 
                ? (contentTypes || []).find(ct => String(ct.id) === String(f.options.target_id)) 
                : null;

            return {
                name: slugName,
                label: config.label || f.label || f.name,
                type: f.type === 'longtext' ? 'textarea' : (f.type === 'number' ? 'number' : (f.type === 'boolean' ? 'boolean' : (f.type === 'relation' ? 'relation' : ((f.type === 'date' || slugName.includes('date')) ? 'date' : 'text')))),
                placeholder: config.placeholder || f.options?.placeholder || '',
                required: f.required,
                disabled: config.disabled || false,
                readonly: config.readonly || false,
                target_slug: f.target_slug || targetCt?.slug || '',
                display_field: f.options?.display_field || '',
                display_fields: config.display_fields || ''
            };
        });
    } else {
        fieldsToRender = (fields || []).map(f => {
            const config = field_config[f.name] || {};
            const targetCt = f.type === 'relation' && f.options?.target_id 
                ? (contentTypes || []).find(ct => String(ct.id) === String(f.options.target_id)) 
                : null;

            return {
                name: f.name,
                label: f.label || f.name,
                type: f.type === 'longtext' ? 'textarea' : (f.type === 'number' ? 'number' : (f.type === 'boolean' ? 'boolean' : (f.type === 'relation' ? 'relation' : ((f.type === 'date' || f.name.includes('date')) ? 'date' : 'text')))),
                placeholder: f.placeholder || f.options?.placeholder || '',
                required: f.required,
                disabled: f.disabled || false,
                readonly: f.readonly || false,
                target_slug: f.target_slug || targetCt?.slug || '',
                display_field: f.options?.display_field || '',
                display_fields: config.display_fields || ''
            };
        });
    }

    // Fetch relationship options dynamically on load
    React.useEffect(() => {
        fieldsToRender.forEach(field => {
            if (field.type === 'relation' && field.target_slug) {
                const displayFields = field.display_fields || field.display_field || '';
                const url = `/content/${field.target_slug}/options` + (displayFields ? `?fields=${displayFields}` : '');
                axios.get(url)
                    .then(res => {
                        setRelationOptions(prev => ({ ...prev, [field.name]: res.data || [] }));
                    })
                    .catch(err => console.error(`[FormBlock] Failed to fetch relationship options for ${field.name}:`, err));
            }
        });
    }, [contentTypeSlug, mode, fieldsToRender.length]);

    // Fetch options dynamically for select options in sub-items
    React.useEffect(() => {
        if (hasItems && itemsConfig && itemsConfig.fields) {
            itemsConfig.fields.forEach(field => {
                if (field.options_url) {
                    axios.get(field.options_url)
                        .then(res => {
                            setSubItemsOptions(prev => ({ ...prev, [field.name]: res.data || [] }));
                        })
                        .catch(err => console.error(`[FormBlock] Failed to fetch options for sub-item field ${field.name}:`, err));
                }
            });
        }
    }, [hasItems, itemsConfig]);

    // Fetch sub-items if we are editing an existing entry
    React.useEffect(() => {
        const entryId = formData.id;
        if (hasItems && itemsConfig?.api_endpoint_fetch && entryId) {
            const url = itemsConfig.api_endpoint_fetch.replace('{id}', entryId);
            axios.get(url)
                .then(res => {
                    const items = (res.data || []).map(item => {
                        const formattedItem = { ...item };
                        itemsConfig.fields.forEach(f => {
                            if (f.type === 'currency' || f.type === 'number') {
                                formattedItem[f.name] = formatNumberByLocale(item[f.name], activeLocale);
                            }
                        });
                        return formattedItem;
                    });
                    setFormData(prev => ({ ...prev, items }));
                })
                .catch(err => console.error('[FormBlock] Failed to fetch sub-items:', err));
        }
    }, [formData.id, hasItems, itemsConfig, activeLocale]);

    // Initialize items for dynamic forms with sub-items if not set
    React.useEffect(() => {
        if (hasItems && itemsConfig && !formData.items) {
            if (itemsConfig.initial_rows) {
                setFormData(prev => ({
                    ...prev,
                    items: itemsConfig.initial_rows.map(row => ({ ...row }))
                }));
            } else {
                const newRow = {};
                itemsConfig.fields.forEach(f => {
                    newRow[f.name] = f.default_value !== undefined ? f.default_value : '';
                });
                setFormData(prev => ({
                    ...prev,
                    items: [{ ...newRow }, { ...newRow }]
                }));
            }
        }
    }, [hasItems, itemsConfig, formData.items]);

    // Fetch full record data when an ID is available (Synched or Session)
    React.useEffect(() => {
        const entryId = formData.id || formData.ID; // Handle casing
        if (!entryId || !contentTypeSlug || mode !== 'dynamic') return;

        // Skip if we already have many fields (heuristic: more than just metadata)
        // Or we could always fetch to be sure we have the latest/complete data
        const rowKeys = Object.keys(formData).filter(k => !k.startsWith('_'));
        if (rowKeys.length > 5) return; // If more than 5 fields, assume it's already "detailed enough" (optional)

        const fetchFullData = async () => {
            setIsFetching(true);
            try {
                // Using the new route we just added: /content/{slug}/{id}/data
                const response = await axios.get(`/content/${contentTypeSlug}/${entryId}/data`);
                if (response.data) {
                    setFormData(prev => ({ ...prev, ...response.data }));
                }
            } catch (err) {
                console.error('[FormBlock] Failed to fetch detailed data:', err);
                // Optionally show error or just fallback to what we have
            } finally {
                setIsFetching(false);
            }
        };

        fetchFullData();
    }, [formData.id, formData.ID, contentTypeSlug, mode]);


    // Cross-page data pre-filling (e.g. from sessionStorage after redirect)
    React.useEffect(() => {
        if (!syncWithGrid) return;

        try {
            const storedData = sessionStorage.getItem('kreatifcms_grid_transfer');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                // Check if this data is for this content type
                if (parsed.content_type === contentTypeSlug || !contentTypeSlug) {
                    setFormData(prev => ({ ...prev, ...parsed.data }));
                    sessionStorage.removeItem('kreatifcms_grid_transfer');
                }
            }
        } catch (e) {
            console.error('[FormBlock] Failed to parse stored data:', e);
        }
    }, [syncWithGrid, contentTypeSlug]);

    // Listen for cross-block events (e.g. from AdvancedDataGrid on same page)
    React.useEffect(() => {
        if (!syncWithGrid) return;

        const handleRowSelected = (event) => {
            const { action_id, action_label, content_type, ...rowData } = event.detail;

            // If it's a create action, we always handle it by resetting the form!
            if (action_id === 'create') {
                if (contentTypeSlug && content_type !== contentTypeSlug) {
                    return;
                }
                // Reset form fields
                const initialFormData = {
                    _action_id: 'create',
                    _action_label: action_label || 'Tambah Baru'
                };
                if (hasItems && itemsConfig) {
                    if (itemsConfig.initial_rows) {
                        initialFormData.items = itemsConfig.initial_rows.map(row => ({ ...row }));
                    } else {
                        const newRow = {};
                        itemsConfig.fields.forEach(f => {
                            newRow[f.name] = f.default_value !== undefined ? f.default_value : '';
                        });
                        initialFormData.items = [{ ...newRow }, { ...newRow }];
                    }
                }
                setFormData(initialFormData);

                // Open modal or scroll to form
                if (display_mode === 'modal' || event.detail.target_display_mode === 'modal') {
                    setIsOpen(true);
                } else {
                    const element = document.getElementById(`block-${data.id || 'form'}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                return;
            }

            // If a specific trigger ID is set, check if it matches
            if (trigger_action_id && action_id !== trigger_action_id) {
                return;
            }

            // If no trigger ID is set, we fallback to our content type check
            if (!trigger_action_id && contentTypeSlug && content_type !== contentTypeSlug) {
                return;
            }

            if (rowData) {
                // Pre-fill form data with row values and action metadata
                setFormData(prev => ({
                    ...prev,
                    ...rowData,
                    _action_id: action_id,
                    _action_label: action_label
                }));

                // If in modal mode, or forced modal from button, open it
                if (display_mode === 'modal' || event.detail.target_display_mode === 'modal') {
                    setIsOpen(true);
                } else {
                    // Scroll to form for better UX in standard mode
                    const element = document.getElementById(`block-${data.id || 'form'}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        };

        window.addEventListener('kreatifcms:row-selected', handleRowSelected);
        return () => window.removeEventListener('kreatifcms:row-selected', handleRowSelected);
    }, [syncWithGrid, display_mode, data.id, contentTypeSlug, trigger_action_id]);




    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Parse formatted numeric input values back into database-compatible numbers before sending
        const parsedData = { ...formData };
        fieldsToRender.forEach(field => {
            if (field.type === 'number' && parsedData[field.name]) {
                parsedData[field.name] = parseNumberByLocale(parsedData[field.name], activeLocale);
            }
        });

        // Dynamic items validation
        if (hasItems && itemsConfig) {
            const items = formData.items || [];
            if (items.length < 2) {
                setError(`Minimal harus mengalokasikan 2 baris item ${itemsConfig.title || 'detail'}!`);
                setLoading(false);
                return;
            }

            let hasInvalidAmount = false;
            const currencyFields = itemsConfig.fields.filter(f => f.type === 'currency' || f.type === 'number');

            const cleanItems = items.map(item => {
                const cleanedItem = { ...item };
                currencyFields.forEach(f => {
                    const parsedAmount = parseFloat(parseNumberByLocale(item[f.name], activeLocale) || '0');
                    if (parsedAmount <= 0) {
                        hasInvalidAmount = true;
                    }
                    cleanedItem[f.name] = parsedAmount;
                });
                return cleanedItem;
            });

            if (hasInvalidAmount) {
                setError('Nilai nominal/jumlah di setiap baris harus lebih besar dari 0!');
                setLoading(false);
                return;
            }

            // Balance check if configured
            const balanceCheck = itemsConfig.balance_check;
            if (balanceCheck?.enabled) {
                const balanceByField = balanceCheck.balance_by_field;
                const balanceValues = balanceCheck.balance_values;
                const valueField = balanceCheck.value_field;

                let firstSum = 0;
                let secondSum = 0;

                cleanItems.forEach(item => {
                    const val = item[valueField] || 0;
                    if (item[balanceByField] === balanceValues[0]) firstSum += val;
                    else if (item[balanceByField] === balanceValues[1]) secondSum += val;
                });

                if (Math.abs(firstSum - secondSum) > 0.001) {
                    setError(`Transaksi tidak seimbang! Total ${balanceValues[0].toUpperCase()} (${firstSum.toLocaleString(activeLocale === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2 })}) harus sama dengan Total ${balanceValues[1].toUpperCase()} (${secondSum.toLocaleString(activeLocale === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2 })})`);
                    setLoading(false);
                    return;
                }
            }

            parsedData.items = cleanItems;
        }

        try {
            const response = await axios.post('/api/form/submit', {
                mode,
                content_type: contentTypeSlug,
                fields: fieldsToRender, // Send fields definition for validation
                data: parsedData,
                submit_action: submitAction,
                success_message,
                form_name: title || 'Website Form',
                items_config: itemsConfig
            });

            if (response.data.success) {
                setSubmitted(true);
                // Execute custom success JS if provided
                if (onSuccessJs) {
                    try {
                        const fn = new Function('response', 'formData', onSuccessJs);
                        fn(response.data, formData);
                    } catch (err) {
                        console.error('[Form onSuccessJs] error:', err);
                    }
                }
            } else {
                setError(response.data.message || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Form submission error:', err);
            setError(err.response?.data?.message || 'There was an error submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    const isFormDisabled = formData.status === 'posted' || formData.status === 'approved';

    const isFieldDisabled = (field) => {
        return isFormDisabled || field.disabled || field.readonly;
    };

    const alignmentClass = align === 'center' ? 'text-center mx-auto' : (align === 'right' ? 'text-right ml-auto' : 'text-left');

    const formContent = (
        <div className={`flex flex-col ${display_mode === 'modal' ? 'h-[85vh] max-h-[85vh] py-0 px-0' : 'py-4 px-6 max-w-2xl'} ${alignmentClass} relative`}>
            {isFetching && (
                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-3xl animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Fetching Details...</span>
                    </div>
                </div>
            )}
            {(title || description) && (
                <div className={`mb-4 ${display_mode === 'modal' ? 'px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0 bg-white' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            {title && <h2 className="text-xl font-black text-gray-900 mb-1">{title}</h2>}
                            {description && <p className="text-xs text-gray-500">{description}</p>}
                        </div>
                        {formData.status && (
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                ['posted', 'approved', 'paid'].includes(formData.status.toLowerCase())
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                    : 'bg-amber-50 text-amber-700 border-amber-200/50'
                            }`}>
                                {formData.status}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className={`space-y-3 ${display_mode === 'modal' ? 'flex flex-col flex-1 min-h-0' : ''}`}>
                <div className={display_mode === 'modal' ? 'flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar min-h-0' : 'space-y-3'}>
                    {fieldsToRender.map((field, idx) => (
                        <div key={field.name || idx} className="text-left">
                            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-0.5">
                                {field.label} {field.required && <span className="text-red-500">*</span>}
                            </label>
                            {field.type === 'boolean' ? (
                                <div className="flex items-center py-1">
                                    <input
                                        type="checkbox"
                                        id={field.name}
                                        checked={!!formData[field.name]}
                                        onChange={e => handleChange(field.name, e.target.checked)}
                                        disabled={isFieldDisabled(field)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 transition-all cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor={field.name} className="ml-2 text-sm font-semibold text-gray-700 select-none cursor-pointer">
                                        Active
                                    </label>
                                </div>
                            ) : field.type === 'relation' ? (
                                <SearchableSelect
                                    value={formData[field.name] || ''}
                                    onChange={val => handleChange(field.name, val)}
                                    options={relationOptions[field.name] || []}
                                    placeholder={field.placeholder || `Select ${field.label}...`}
                                    disabled={isFieldDisabled(field)}
                                />
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    value={formData[field.name] || ''}
                                    onChange={e => handleChange(field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={isFieldDisabled(field)}
                                    rows="3"
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                />
                            ) : field.type === 'captcha' ? (
                                <CaptchaWidget
                                    onToken={(token) => handleChange('captcha_token', token)}
                                />
                            ) : field.type === 'date' ? (
                                <input
                                    type="date"
                                    value={formData[field.name] || ''}
                                    onChange={e => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    disabled={isFieldDisabled(field)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                />
                            ) : field.type === 'number' ? (
                                <input
                                    type="text"
                                    value={formData[field.name] || ''}
                                    onFocus={e => {
                                        if (isFieldDisabled(field)) return;
                                        // When entering edit, remove commas/dots so it's easy to edit
                                        const raw = parseNumberByLocale(e.target.value, activeLocale);
                                        handleChange(field.name, raw);
                                    }}
                                    onBlur={e => {
                                        if (isFieldDisabled(field)) return;
                                        // When leaving input, format with separators
                                        const formatted = formatNumberByLocale(e.target.value, activeLocale);
                                        handleChange(field.name, formatted);
                                    }}
                                    onChange={e => {
                                        const clean = e.target.value.replace(/[^0-9.,-]/g, '');
                                        handleChange(field.name, clean);
                                    }}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={isFieldDisabled(field)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                />
                            ) : (
                                <input
                                    type={field.type === 'email' ? 'email' : 'text'}
                                    value={formData[field.name] || ''}
                                    onChange={e => handleChange(field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={isFieldDisabled(field)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                                />
                            )
                            }
                        </div>
                    ))}

                    {/* Dynamic Sub-items / Lines Allocation Editor */}
                    {hasItems && itemsConfig && (
                        <div className="mt-4 border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                                    {itemsConfig.title || 'Baris Detail'}
                                </h3>
                                 {!isFormDisabled && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const currentItems = formData.items || [];
                                            const newRow = {};
                                            itemsConfig.fields.forEach(f => {
                                                newRow[f.name] = f.default_value !== undefined ? f.default_value : '';
                                            });
                                            setFormData(prev => ({
                                                ...prev,
                                                items: [...currentItems, newRow]
                                            }));
                                        }}
                                        className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Tambah Baris
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                {(formData.items || []).map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 border border-gray-100 rounded-xl shadow-sm">
                                        {itemsConfig.fields.map(field => {
                                            if (field.type === 'select') {
                                                const options = field.options || subItemsOptions[field.name] || [];
                                                return (
                                                    <div key={field.name} className={`${field.width_class || 'flex-1 w-full'} min-w-[200px]`}>
                                                        <select
                                                            value={item[field.name] || ''}
                                                            onChange={e => {
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx] = { ...newItems[idx], [field.name]: e.target.value };
                                                                setFormData(prev => ({ ...prev, items: newItems }));
                                                            }}
                                                            disabled={isFormDisabled}
                                                            required
                                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed"
                                                        >
                                                            <option value="">-- Pilih {field.label} --</option>
                                                            {options.map(opt => {
                                                                const val = opt.value !== undefined ? opt.value : opt.id;
                                                                let lbl = opt.label || opt.name;
                                                                if (field.options_label_key === 'code_name' && opt.code) {
                                                                    lbl = `${opt.code} - ${opt.name} (${opt.type || ''})`;
                                                                }
                                                                return (
                                                                    <option key={val} value={val}>
                                                                        {lbl}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                );
                                            }

                                            if (field.type === 'currency' || field.type === 'number') {
                                                return (
                                                    <div key={field.name} className={field.width_class || 'w-full sm:w-44'}>
                                                        <input
                                                            type="text"
                                                            value={item[field.name] || '0'}
                                                            onFocus={e => {
                                                                if (isFormDisabled) return;
                                                                const raw = parseNumberByLocale(e.target.value, activeLocale);
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx] = { ...newItems[idx], [field.name]: raw };
                                                                setFormData(prev => ({ ...prev, items: newItems }));
                                                            }}
                                                            onBlur={e => {
                                                                if (isFormDisabled) return;
                                                                const formatted = formatNumberByLocale(e.target.value, activeLocale);
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx] = { ...newItems[idx], [field.name]: formatted };
                                                                setFormData(prev => ({ ...prev, items: newItems }));
                                                            }}
                                                            onChange={e => {
                                                                const clean = e.target.value.replace(/[^0-9.,-]/g, '');
                                                                const newItems = [...(formData.items || [])];
                                                                newItems[idx] = { ...newItems[idx], [field.name]: clean };
                                                                setFormData(prev => ({ ...prev, items: newItems }));
                                                            }}
                                                            placeholder="0"
                                                            disabled={isFormDisabled}
                                                            required
                                                            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-right font-bold text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed"
                                                        />
                                                    </div>
                                                );
                                            }

                                            return (
                                                <div key={field.name} className={`${field.width_class || 'flex-1 w-full'} min-w-[200px]`}>
                                                    <input
                                                        type="text"
                                                        value={item[field.name] || ''}
                                                        onChange={e => {
                                                            const newItems = [...(formData.items || [])];
                                                            newItems[idx] = { ...newItems[idx], [field.name]: e.target.value };
                                                            setFormData(prev => ({ ...prev, items: newItems }));
                                                        }}
                                                        placeholder={field.placeholder || field.label}
                                                        required={field.required}
                                                        disabled={isFormDisabled}
                                                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            );
                                        })}
                                        {!isFormDisabled && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newItems = (formData.items || []).filter((_, i) => i !== idx);
                                                    setFormData(prev => ({ ...prev, items: newItems }));
                                                }}
                                                disabled={(formData.items || []).length <= 2}
                                                className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                                                title="Hapus Baris"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Real-time Summary & Balance Status */}
                            {(() => {
                                const balanceCheck = itemsConfig.balance_check;
                                if (!balanceCheck?.enabled) return null;

                                const items = formData.items || [];
                                const balanceByField = balanceCheck.balance_by_field;
                                const balanceValues = balanceCheck.balance_values;
                                const valueField = balanceCheck.value_field;

                                let firstSum = 0;
                                let secondSum = 0;

                                items.forEach(item => {
                                    const val = parseFloat(parseNumberByLocale(item[valueField], activeLocale) || '0');
                                    if (item[balanceByField] === balanceValues[0]) firstSum += val;
                                    else if (item[balanceByField] === balanceValues[1]) secondSum += val;
                                });

                                const isBalanced = Math.abs(firstSum - secondSum) <= 0.001 && items.length >= 2;

                                return (
                                    <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div className="flex gap-6 text-xs font-bold text-gray-600">
                                            <div>
                                                TOTAL {balanceValues[0].toUpperCase()}: <span className="text-gray-900 text-sm font-black">{firstSum.toLocaleString(activeLocale === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                            <div>
                                                TOTAL {balanceValues[1].toUpperCase()}: <span className="text-gray-900 text-sm font-black">{secondSum.toLocaleString(activeLocale === 'id' ? 'id-ID' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            </div>
                                        </div>
                                        <div>
                                            {isBalanced ? (
                                                <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Seimbang
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 shadow-sm">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Tidak Seimbang
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                            {error}
                        </div>
                    )}

                </div>

                <div className={`pt-4 flex justify-end gap-3 ${display_mode === 'modal' ? 'px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0' : ''}`}>
                    {isFormDisabled ? (
                        <div className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl font-bold text-sm select-none text-center">
                            Transaction Posted (Read-Only)
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                type="submit"
                                onClick={() => setSubmitAction('save')}
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                {loading && submitAction === 'save' ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (submit_button_text || 'Save Draft')}
                            </button>

                            {data.has_post_button && (
                                <button
                                    type="submit"
                                    onClick={() => setSubmitAction('post')}
                                    disabled={loading}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-1.5"
                                >
                                    {loading && submitAction === 'post' ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                            {data.post_button_text || 'Post'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                    {display_mode === 'modal' && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold transition-all text-sm"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );

    if (display_mode === 'modal') {
        return (
            <Modal show={isOpen} onClose={() => setIsOpen(false)} maxWidth="2xl">
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-5 right-6 text-gray-400 hover:text-gray-600 transition-colors z-50"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {formContent}
                </div>
            </Modal>
        );
    }

    return (
        <>
            {formContent}

            {/* Premium Success Modal */}
            {submitted && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
                        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full animate-bounce shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-600 mb-8 font-medium leading-relaxed">{success_message}</p>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({});
                                if (display_mode === 'modal') setIsOpen(false);
                            }}
                            className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 transform hover:-translate-y-0.5"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';
import CaptchaWidget from '@/Components/CaptchaWidget';
import Modal from '@/Components/Modal';


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

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [isOpen, setIsOpen] = useState(false);

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


    // Determine fields to render
    let fieldsToRender = [];
    const contentType = (contentTypes || []).find(ct => ct.slug === contentTypeSlug);
    if (mode === 'dynamic' && contentTypeSlug && contentType && contentType.fields) {
        fieldsToRender = contentType.fields.map(f => {
            const slugName = f.name.toLowerCase().replace(/ /g, '_');
            const config = field_config[f.name] || {};
            
            return {
                name: slugName,
                label: config.label || f.label || f.name,
                type: f.type === 'longtext' ? 'textarea' : (f.type === 'number' ? 'number' : 'text'),
                placeholder: config.placeholder || f.options?.placeholder || '',
                required: f.required
            };
        });
    } else {
        fieldsToRender = fields;
    }

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/form/submit', {
                mode,
                content_type: contentTypeSlug,
                fields: fieldsToRender, // Send fields definition for validation
                data: formData,
                success_message,
                form_name: title || 'Website Form'
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

    const alignmentClass = align === 'center' ? 'text-center mx-auto' : (align === 'right' ? 'text-right ml-auto' : 'text-left');

    const formContent = (
        <div className={`py-12 px-6 ${display_mode === 'modal' ? '' : 'max-w-2xl'} ${alignmentClass}`}>
            {(title || description) && (
                <div className="mb-8">
                    {title && <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{title}</h2>}
                    {description && <p className="text-lg text-gray-500">{description}</p>}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {fieldsToRender.map((field, idx) => (
                    <div key={field.name || idx} className="text-left">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        {field.type === 'textarea' ? (
                            <textarea
                                value={formData[field.name] || ''}
                                onChange={e => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                required={field.required}
                                rows="4"
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        ) : field.type === 'captcha' ? (
                            <CaptchaWidget 
                                onToken={(token) => handleChange('captcha_token', token)} 
                            />
                        ) : (
                            <input
                                type={field.type === 'number' ? 'number' : (field.type === 'email' ? 'email' : 'text')}
                                value={formData[field.name] || ''}
                                onChange={e => handleChange(field.name, e.target.value)}
                                placeholder={field.placeholder}
                                required={field.required}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        )}
                    </div>
                ))}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : submit_button_text}
                    </button>
                    {display_mode === 'modal' && (
                        <button 
                            type="button" 
                            onClick={() => setIsOpen(false)}
                            className="w-full sm:ml-3 sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-bold transition-all"
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
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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

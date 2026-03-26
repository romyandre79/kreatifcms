import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import axios from 'axios';

export default function FormBlock({ data, contentTypes = [] }) {
    const { 
        mode = 'static', 
        fields = [], 
        content_type: contentTypeSlug = '',
        title = '',
        description = '',
        success_message = 'Thank you for your submission!',
        submit_button_text = 'Submit',
        align = 'left'
    } = data;

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});

    // Determine fields to render
    let fieldsToRender = [];
    if (mode === 'dynamic' && contentTypeSlug) {
        const contentType = contentTypes.find(ct => ct.slug === contentTypeSlug);
        if (contentType && contentType.fields) {
            fieldsToRender = contentType.fields.map(f => ({
                name: f.name.toLowerCase().replace(/ /g, '_'),
                label: f.name,
                type: f.type === 'longtext' ? 'textarea' : (f.type === 'number' ? 'number' : 'text'),
                placeholder: f.options?.placeholder || '',
                required: f.required
            }));
        }
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
                data: formData,
                success_message,
                form_name: title || 'Website Form'
            });

            if (response.data.success) {
                setSubmitted(true);
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

    if (submitted) {
        return (
            <div className="py-12 px-6 max-w-xl mx-auto text-center animate-fade-in">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{success_message}</h3>
                <button 
                    onClick={() => { setSubmitted(false); setFormData({}); }}
                    className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                >
                    Back to form
                </button>
            </div>
        );
    }

    const alignmentClass = align === 'center' ? 'text-center mx-auto' : (align === 'right' ? 'text-right ml-auto' : 'text-left');

    return (
        <div className={`py-12 px-6 max-w-2xl ${alignmentClass}`}>
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
                </div>
            </form>
        </div>
    );
}

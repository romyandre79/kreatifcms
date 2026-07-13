import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function SearchableSelect({
    value,
    onChange,
    options = [],
    url = '',
    placeholder = 'Select option...',
    disabled = false,
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [localOptions, setLocalOptions] = useState(options);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);

    // Fetch options from URL if provided
    useEffect(() => {
        if (url) {
            setLoading(true);
            axios.get(url)
                .then(res => {
                    setLocalOptions(res.data || []);
                })
                .catch(err => {
                    console.error('[SearchableSelect] Failed to load options:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLocalOptions(options);
        }
    }, [url, options]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = localOptions.filter(opt => {
        const label = String(opt.label || '').toLowerCase();
        const id = String(opt.id || '').toLowerCase();
        const search = searchQuery.toLowerCase();
        return label.includes(search) || id.includes(search);
    });

    const selectedOption = localOptions.find(opt => String(opt.id) === String(value));

    const handleSelect = (opt) => {
        onChange(opt.id);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl cursor-pointer transition-all select-none
                    ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'}
                    ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}`}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                
                <div className="flex items-center gap-1.5 flex-shrink-0 text-gray-400">
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {value && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[999] p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Search Input */}
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Type to search..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-0 border-b border-gray-100 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    {/* Options List */}
                    <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.id) === String(value);
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between
                                            ${isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && (
                                            <svg className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-4 text-center text-xs text-gray-400">
                                No options found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

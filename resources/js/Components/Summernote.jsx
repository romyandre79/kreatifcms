import React, { useEffect, useRef } from 'react';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.css';
import 'summernote/dist/summernote-lite.js';

export default function Summernote({ value, onChange, placeholder = '', className = '' }) {
    const editorRef = useRef(null);
    const isInternalChange = useRef(false);
    const snInstance = useRef(null);

    useEffect(() => {
        // Ensure jQuery is global for Summernote's internal needs
        window.jQuery = window.$ = $;

        const $editor = $(editorRef.current);
        snInstance.current = $editor;

        $editor.summernote({
            placeholder: placeholder,
            tabsize: 2,
            height: 300,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            callbacks: {
                onChange: (contents) => {
                    isInternalChange.current = true;
                    onChange(contents);
                    setTimeout(() => {
                        isInternalChange.current = false;
                    }, 10);
                }
            }
        });

        if (value) {
            $editor.summernote('code', value);
        }

        return () => {
            if (snInstance.current && snInstance.current.summernote) {
                snInstance.current.summernote('destroy');
            }
        };
    }, []);

    useEffect(() => {
        if (!isInternalChange.current && snInstance.current) {
            const currentCode = snInstance.current.summernote('code');
            if (currentCode !== value) {
                snInstance.current.summernote('code', value || '');
            }
        }
    }, [value]);

    return (
        <div className={`summernote-editor-container ${className}`}>
            <textarea ref={editorRef} />
            <style dangerouslySetInnerHTML={{ __html: `
                .note-editor.note-frame {
                    border: 1px solid #e5e7eb !important;
                    border-radius: 0.5rem !important;
                    overflow: hidden;
                    background: white;
                    margin-top: 0.25rem;
                }
                .note-toolbar {
                    background-color: #f9fafb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    padding: 0.5rem !important;
                }
                .note-toolbar .note-btn {
                    background-color: white;
                    border: 1px solid #e5e7eb !important;
                    box-shadow: none !important;
                    padding: 0.25rem 0.5rem !important;
                    font-size: 0.75rem !important;
                    color: #374151 !important;
                    border-radius: 0.25rem !important;
                    line-height: 1.25 !important;
                }
                .note-toolbar .note-btn:hover {
                    background-color: #f3f4f6 !important;
                }
                /* Ensure color palette buttons are NOT affected by background overrides */
                .note-color-palette .note-btn {
                    padding: 0 !important;
                    border: none !important;
                    background-color: transparent;
                }
                .note-editable {
                    background-color: white !important;
                    color: #1f2937 !important;
                    padding: 1rem !important;
                    min-height: 200px !important;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif !important;
                }
                .note-placeholder {
                    padding: 1rem !important;
                    font-style: italic !important;
                    color: #9ca3af !important;
                }
                .note-status-output {
                    display: none !important;
                }
                /* Avoid conflicts with Tailwind */
                .note-editor * {
                    box-sizing: content-box;
                }
            `}} />
        </div>
    );
}

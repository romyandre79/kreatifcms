import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, BookOpen, Lightbulb } from 'lucide-react';
import { usePage } from '@inertiajs/react';

const DocumentationModal = ({ isOpen, onClose }) => {
    const { active_documentation, localization } = usePage().props;
    const locale = localization?.active_locale || 'en';

    if (!active_documentation) return null;

    const sections = active_documentation.sections || [];
    const title = active_documentation.title?.[locale] || active_documentation.title?.en || 'Documentation';

    // Helper to handle dynamic data placeholders
    const processContent = (content) => {
        if (!content) return '';
        let processed = content;
        const dynamicData = usePage().props; // Can access everything in the props

        // Simple regex to replace {{prop.path}}
        processed = processed.replace(/{{(.*?)}}/g, (match, path) => {
            const keys = path.trim().split('.');
            let value = dynamicData;
            for (const key of keys) {
                value = value?.[key];
            }
            return value || match;
        });

        return processed;
    };

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200">
                                {/* Header */}
                                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <BookOpen className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-bold text-slate-900">
                                                {title}
                                            </Dialog.Title>
                                            <p className="text-sm text-slate-500">
                                                {localization?.translations?.ui?.read_documentation || 'Documentation'}
                                            </p>
                                        </div>
                                    </div>
                                        <button
                                            type="button"
                                            className="rounded-lg p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-all"
                                            onClick={onClose}
                                        >
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                </div>

                                {/* Content */}
                                <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-8">
                                        {sections.map((section, idx) => (
                                            <div key={idx} className="relative pl-10">
                                                <div className="absolute left-0 top-0 mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100">
                                                    <Lightbulb className="h-4 w-4 text-indigo-600" />
                                                </div>
                                                <h4 className="text-base font-semibold leading-7 text-slate-900">
                                                    {section.title?.[locale] || section.title?.en}
                                                </h4>
                                                <div className="mt-2 text-sm leading-6 text-slate-600 prose prose-indigo max-w-none">
                                                    <p>{processContent(section.content?.[locale] || section.content?.en)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-200">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-200"
                                        onClick={onClose}
                                    >
                                        {localization?.translations?.ui?.got_it || 'Got it, thanks!'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
};

export default DocumentationModal;

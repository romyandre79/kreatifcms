import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { usePage, router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
    const { localization } = usePage().props;

    if (!localization || !localization.languages || localization.languages.length <= 1) {
        return null;
    }

    const { active_locale, languages } = localization;
    const currentLang = languages.find(l => l.code === active_locale) || languages[0];

    const switchLanguage = (code) => {
        if (code === active_locale) return;
        
        // Custom route for switching language in the LanguageSwitcher module
        // But since we might not have a route yet, let's just make a POST to a predictable endpoint
        router.post(route('languages.switch'), { locale: code }, {
            preserveScroll: true,
            onSuccess: () => {
                // The page will reload/refresh with new session locale
            }
        });
    };

    return (
        <Menu as="div" className="relative ml-3">
            <div>
                <Menu.Button className="flex items-center space-x-2 rounded-xl bg-white/50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white transition-all border border-slate-200 shadow-sm outline-none">
                    <span className="text-base leading-none">{currentLang.flag}</span>
                    <span className="hidden sm:inline-block">{currentLang.name}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-white py-1 shadow-2xl border border-slate-100 focus:outline-none ring-1 ring-black ring-opacity-5">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {localization?.translations?.ui?.change_language || 'Switch Language'}
                    </div>
                    {languages.map((lang) => (
                        <Menu.Item key={lang.id}>
                            {({ active }) => (
                                <button
                                    onClick={() => switchLanguage(lang.code)}
                                    className={`${
                                        active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'
                                    } ${
                                        active_locale === lang.code ? 'font-bold' : ''
                                    } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                >
                                    <span className="mr-3 text-lg leading-none">{lang.flag}</span>
                                    {lang.name}
                                    {active_locale === lang.code && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    )}
                                </button>
                            )}
                        </Menu.Item>
                    ))}
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default LanguageSwitcher;

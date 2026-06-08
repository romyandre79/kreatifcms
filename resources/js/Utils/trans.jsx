import { usePage } from '@inertiajs/react';

/**
 * Universal translation helper for KreatifCMS
 */
export const useTrans = () => {
    const { localization } = usePage().props;
    
    /**
     * Translate a key
     * @param {string} key - The translation key
     * @param {string} group - The translation group (default: ui)
     * @returns {string} - The translated string or the key if not found
     */
    /**
     * Translate a key with optional placeholder replacement
     * @param {string} key - The translation key
     * @param {string} group - The translation group
     * @param {object} replace - Object with key-value pairs for placeholders
     * @returns {string} - The translated string
     */
    const t = (key, group = 'ui', replace = {}) => {
        let targetKey = key;
        let targetGroup = group;

        if (key.includes('.')) {
            const parts = key.split('.');
            targetGroup = parts[0];
            targetKey = parts.slice(1).join('.');
        }

        let translation = localization?.translations?.[targetGroup]?.[targetKey] || key;

        // Simple placeholder replacement: :key -> value
        Object.keys(replace).forEach(k => {
            translation = translation.replace(`:${k}`, replace[k]);
        });

        return translation;
    };

    return { t };
};

/**
 * Static translate helper
 */
export const trans = (key, group = 'ui', replace = {}, localization = null) => {
    if (!localization) return key;
    
    let targetKey = key;
    let targetGroup = group;

    if (key.includes('.')) {
        const parts = key.split('.');
        targetGroup = parts[0];
        targetKey = parts.slice(1).join('.');
    }

    let translation = localization?.translations?.[targetGroup]?.[targetKey] || key;

    Object.keys(replace).forEach(k => {
        translation = translation.replace(`:${k}`, replace[k]);
    });

    return translation;
};

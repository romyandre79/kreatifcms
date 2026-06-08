import { useTrans } from '@/Utils/trans';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    const { t } = useTrans();
    
    const translatedChildren = typeof children === 'string'
        ? (t(children, 'general') !== children ? t(children, 'general') : t(children, 'ui'))
        : children;

    return (
        <button
            {...props}
            className={
                `inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-xl font-bold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 ` +
                className
            }
            disabled={disabled}
        >
            {translatedChildren}
        </button>
    );
}

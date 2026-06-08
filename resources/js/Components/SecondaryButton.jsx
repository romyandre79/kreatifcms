import { useTrans } from '@/Utils/trans';

export default function SecondaryButton({
    type = 'button',
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
            type={type}
            className={
                `inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-xs text-gray-600 uppercase tracking-widest hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-sm disabled:opacity-50 ` +
                className
            }
            disabled={disabled}
        >
            {translatedChildren}
        </button>
    );
}

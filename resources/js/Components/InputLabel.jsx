import { useTrans } from '@/Utils/trans';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    const { t } = useTrans();
    
    // Group logic: try to find in form group first, then general, then ui
    const translatedValue = typeof value === 'string' 
        ? (t(value, 'form') !== value ? t(value, 'form') : (t(value, 'general') !== value ? t(value, 'general') : t(value, 'ui')))
        : value;

    return (
        <label
            {...props}
            className={
                `block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2 ` +
                className
            }
        >
            {translatedValue ? translatedValue : children}
        </label>
    );
}

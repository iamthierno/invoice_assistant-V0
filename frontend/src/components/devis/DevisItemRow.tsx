import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { InvoiceItem } from '../../types'
import { formatCurrency, calculateItemTotals } from '../../utils'

interface DevisItemRowProps {
    item: InvoiceItem;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<InvoiceItem>) => void;
}

export const DevisItemRow = ({ item, onDelete, onUpdate }: DevisItemRowProps) => {
    const { subtotalHT } = calculateItemTotals(item);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus if the item is empty (newly added)
        if (!item.description && item.quantity === 0 && item.unitPrice === 0) {
            inputRef.current?.focus();
        }
    }, []);

    const handleChange = (field: keyof InvoiceItem, value: string | number) => {
        const newValue = typeof value === 'string' && ['quantity', 'unitPrice', 'tax', 'discount'].includes(field)
            ? parseFloat(value) || 0
            : value;

        onUpdate?.(item.id, { [field]: newValue });
    };

    // Same input style as client info
    const inputClass = "border border-slate-100 hover:border-blue-400 focus:border-blue-600 focus:outline-none rounded-md px-2 py-0.5 text-[13px] transition-colors bg-transparent";

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors"
        >
            {/* Description */}
            <td className="py-1.5 pr-4">
                <input
                    ref={inputRef}
                    className={`${inputClass} w-full`}
                    type="text"
                    placeholder="Description de l'article"
                    value={item.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </td>

            {/* Quantity */}
            <td className="py-1.5 px-2 w-20 text-center">
                <input
                    className={`${inputClass} w-full text-center font-mono`}
                    type="number"
                    placeholder="Qté"
                    min="0"
                    value={item.quantity || ''}
                    onChange={(e) => handleChange('quantity', e.target.value)}
                />
            </td>

            {/* Unit Price */}
            <td className="py-1.5 px-2 w-40 text-center">
                <input
                    className={`${inputClass} w-full text-center font-mono`}
                    type="number"
                    placeholder="Prix"
                    min="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => handleChange('unitPrice', e.target.value)}
                />
            </td>

            {/* Total + Delete */}
            <td className="py-1.5 text-right font-bold text-slate-900 text-[12px] relative">
                {formatCurrency(subtotalHT)}
                <button
                    onClick={() => onDelete(item.id)}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                >
                    <Trash2 size={12} />
                </button>
            </td>
        </motion.tr>
    )
}

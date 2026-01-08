import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { InvoiceItem } from '../../types'
import { formatCurrency, calculateItemTotals } from '../../utils'

interface DevisItemRowProps {
    item: InvoiceItem;
    onDelete: (id: string) => void;
    onUpdate?: (id: string, updates: Partial<InvoiceItem>) => void;
}

export const DevisItemRow = ({ item, onDelete, onUpdate }: DevisItemRowProps) => {
    const { subtotalHT } = calculateItemTotals(item);

    const handleChange = (field: keyof InvoiceItem, value: string | number) => {
        const newValue = typeof value === 'string' && ['quantity', 'unitPrice', 'tax', 'discount'].includes(field)
            ? parseFloat(value) || 0
            : value;

        onUpdate?.(item.id, { [field]: newValue });
    };

    // Same input style as client info
    const inputClass = "border border-slate-100 hover:border-blue-400 focus:border-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm transition-colors bg-transparent";

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors"
        >
            {/* Description */}
            <td className="py-3 pr-4">
                <input
                    className={`${inputClass} w-full`}
                    type="text"
                    placeholder="Description de l'article"
                    value={item.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                />
            </td>

            {/* Quantity */}
            <td className="py-3 px-2 w-24 text-center">
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
            <td className="py-3 px-2 w-32 text-center">
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
            <td className="py-3 text-right font-bold text-slate-900 relative">
                {formatCurrency(subtotalHT)}
                <button
                    onClick={() => onDelete(item.id)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </motion.tr>
    )
}

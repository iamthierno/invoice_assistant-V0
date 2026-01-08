import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import type { InvoiceItem } from '../../types'
import { formatCurrency, calculateItemTotals } from '../../utils'

interface DevisItemRowProps {
    item: InvoiceItem;
    onDelete: (id: string) => void;
}

export const DevisItemRow = ({ item, onDelete }: DevisItemRowProps) => {
    const { subtotalHT } = calculateItemTotals(item);

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-b border-slate-50 group hover:bg-slate-50/50 transition-colors"
        >
            <td className="py-4 font-medium pr-10">
                <p className="text-slate-900">{item.description}</p>
            </td>
            <td className="py-4 px-4 text-center font-mono text-slate-500">{item.quantity}</td>
            <td className="py-4 px-4 text-right font-mono text-slate-500">{formatCurrency(item.unitPrice)}</td>
            <td className="py-4 text-right font-bold text-slate-900 relative">
                {formatCurrency(subtotalHT)}
                <button
                    onClick={() => onDelete(item.id)}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </motion.tr>
    )
}

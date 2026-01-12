import { motion, AnimatePresence } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
    const [isFocused, setIsFocused] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const focusTimeoutRef = useRef<any>(null);

    const handleFocus = (field?: string) => {
        if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
        setIsFocused(true);
        if (typeof field === 'string') setFocusedField(field);
    };

    const handleBlur = () => {
        // Delay blur to allow clicking on the other fields within the same row
        focusTimeoutRef.current = setTimeout(() => {
            setIsFocused(false);
            setFocusedField(null);
        }, 150);
    };

    useEffect(() => {
        // Auto-focus if the item is empty (newly added)
        if (!item.description && item.quantity === 0 && item.unitPrice === 0) {
            inputRef.current?.focus();
        }
    }, []);

    const handleChange = (field: keyof InvoiceItem, value: string | number) => {
        let newValue: any = value;

        if (typeof value === 'string' && ['quantity', 'unitPrice', 'tax', 'discount'].includes(field)) {
            // Strip spaces for numeric fields
            const cleanValue = value.replace(/\s/g, '').replace(',', '.');
            newValue = parseFloat(cleanValue) || 0;
        }

        onUpdate?.(item.id, { [field]: newValue });
    };

    // Same input style as client info
    const inputClass = "border border-slate-100 hover:border-blue-400 focus:border-blue-600 focus:outline-none rounded-md px-2 py-0.5 text-[13px] transition-colors bg-transparent";

    return (
        <tbody className="group">
            <motion.tr
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                onFocus={() => handleFocus()}
                onBlur={handleBlur}
            >
                {/* Description */}
                <td className="py-1.5 pr-4 align-top">
                    <input
                        ref={inputRef}
                        className={`${inputClass} w-full`}
                        type="text"
                        placeholder="Description de l'article"
                        value={item.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        onFocus={() => handleFocus('description')}
                    />
                </td>

                {/* Quantity */}
                <td className="py-1.5 px-2 align-top">
                    <input
                        className={`${inputClass} w-full text-center font-mono`}
                        type="text"
                        placeholder="Qté"
                        value={focusedField === 'quantity' ? (item.quantity || '') : (item.quantity === 0 ? '' : formatCurrency(item.quantity))}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        onFocus={() => handleFocus('quantity')}
                        onBlur={handleBlur}
                    />
                </td>

                {/* Unit Price */}
                <td className="py-1.5 px-2 align-top">
                    <input
                        className={`${inputClass} w-full text-center font-mono`}
                        type="text"
                        placeholder="Prix"
                        value={focusedField === 'unitPrice' ? (item.unitPrice || '') : (item.unitPrice === 0 ? '' : formatCurrency(item.unitPrice))}
                        onChange={(e) => handleChange('unitPrice', e.target.value)}
                        onFocus={() => handleFocus('unitPrice')}
                        onBlur={handleBlur}
                    />
                </td>

                {/* Total + Delete */}
                <td className="py-1.5 text-right font-bold text-slate-900 text-[12px] relative align-top">
                    {formatCurrency(subtotalHT)}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault(); // Prevent focus shift
                        }}
                        className="absolute -right-6 top-1/2 -translate-y-1/2 p-2 text-rose-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                        title="Supprimer l'article"
                    >
                        <Trash2 size={12} />
                    </button>
                </td>
            </motion.tr>

            {/* Sub-row for Tax and Discount */}
            <AnimatePresence>
                {isFocused && (
                    <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-50/30"
                        onFocus={() => handleFocus()}
                        onBlur={handleBlur}
                    >
                        <td colSpan={4} className="py-2 px-1">
                            <div className="flex gap-4 items-center pl-2">
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={item.discountType === 'amount'}
                                        onChange={(e) => handleChange('discountType', e.target.checked ? 'amount' : 'percent')}
                                    />
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Remise:</span>
                                    <input
                                        className={`${inputClass} w-16 text-center font-mono !py-0`}
                                        type="number"
                                        min="0"
                                        value={item.discount || ''}
                                        onChange={(e) => handleChange('discount', e.target.value)}
                                    />
                                    <span className="text-[10px] text-slate-400">{item.discountType === 'amount' ? 'XOF' : '%'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={item.taxType === 'amount'}
                                        onChange={(e) => handleChange('taxType', e.target.checked ? 'amount' : 'percent')}
                                    />
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Taxe:</span>
                                    <input
                                        className={`${inputClass} w-16 text-center font-mono !py-0`}
                                        type="number"
                                        min="0"
                                        value={item.tax || ''}
                                        onChange={(e) => handleChange('tax', e.target.value)}
                                    />
                                    <span className="text-[10px] text-slate-400">{item.taxType === 'amount' ? 'XOF' : '%'}</span>
                                </div>
                            </div>
                        </td>
                    </motion.tr>
                )}
            </AnimatePresence>
        </tbody>
    )
}

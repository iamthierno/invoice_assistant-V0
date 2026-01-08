import type { InvoiceTotals } from '../../types'
import { formatCurrency } from '../../utils'

interface DevisTotalsProps {
    totals: InvoiceTotals;
    globalTax: number;
    globalDiscount: number;
}

export const DevisTotals = ({ totals, globalTax, globalDiscount }: DevisTotalsProps) => {
    return (
        <div className="mt-4 flex justify-end">
            <div className="w-80 space-y-1.5 mb-10">
                <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Total HT</span>
                    <span className="font-semibold text-slate-900 tabular-nums uppercase">{formatCurrency(totals.subtotal)} XOF</span>
                </div>
                {globalDiscount > 0 && (
                    <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Remise ({globalDiscount}%)</span>
                        <span className="font-semibold text-rose-500 tabular-nums">- {formatCurrency(totals.discountTotal)} XOF</span>
                    </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-500">
                    <span>TVA ({globalTax}%)</span>
                    <span className="font-semibold text-slate-900 tabular-nums">+{formatCurrency(totals.taxTotal)} XOF</span>
                </div>
                <div className="border-slate-900 flex justify-between items-center text-slate-900 py-1">
                    <span className="text-[12px] font-bold uppercase tracking-widest">TOTAL TTC</span>
                    <span className="text-sm font-bold tabular-nums">{formatCurrency(totals.total)} <span className="text-[11px] uppercase ml-1">XOF</span></span>
                </div>
            </div>
        </div>
    )
}

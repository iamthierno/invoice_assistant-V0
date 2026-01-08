import { motion, AnimatePresence } from 'framer-motion'
import { User, Phone } from 'lucide-react'
import type { ClientInfo, InvoiceItem, InvoiceTotals } from '../../types'
import { DevisItemRow } from './DevisItemRow'
import { DevisTotals } from './DevisTotals'
import { formatDate } from '../../utils'

interface DevisPreviewProps {
    items: InvoiceItem[];
    clientInfo: ClientInfo;
    totals: InvoiceTotals;
    globalTax: number;
    globalDiscount: number;
    onDeleteItem: (id: string) => void;
}

export const DevisPreview = ({ items, clientInfo, totals, globalTax, globalDiscount, onDeleteItem }: DevisPreviewProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="invoice-paper"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">

                <div className="text-left text-sm">
                    <p className="font-bold text-slate-900 uppercase">Artisan Pro Services</p>
                    <p className="text-slate-500">Prestation de Services</p>
                </div>
                <div className="text-right">
                    <div className="w-10 h-1 bg-blue-600 mb-4" />
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase italic line-height-none">DEVIS</h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">#DV-2026-001</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="flex justify-between items-center mb-2 border-y border-slate-100 py-3">
                <div className="flex-1 flex items-center">
                    <div className="w-[60%] flex items-center gap-2.5">
                        <button className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                            <User size={16} />
                        </button>
                        <input
                            className="hover:border-blue-600 border-slate-100 hover:border rounded-md ml-6 p-1 absolute "
                            type="text" placeholder="Client" value={clientInfo.name}
                        />
                    </div>
                    <div className="font-semibold w-[60%] flex items-center gap-2.5 text-slate-500">
                        <button className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                            <Phone size={16} />
                        </button>
                        <input
                            className="hover:border-blue-600 border-slate-100 hover:border rounded-md ml-6 p-1 absolute"
                            type="text" placeholder="Phone" value={clientInfo.phone}
                        />
                    </div>
                </div>
                <div className="text-right pl-8">
                    <p className="text-slate-900 font-semibold italic text-sm">{formatDate(new Date())}</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-hidden min-h-0 py-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-900 text-slate-900 text-[10px] font-bold uppercase tracking-widest">
                            <th className="py-4">Désignation</th>
                            <th className="py-4 px-4 text-center">Qté</th>
                            <th className="py-4 px-4 text-right">PU (XOF)</th>
                            <th className="py-4 text-right">Total HT (XOF)</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 overflow-y-auto max-h-full scrollbar-hide">
                        <AnimatePresence initial={false}>
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center opacity-40 italic text-[12px]"> En attente d'article ...</td>
                                </tr>
                            ) : (
                                items.map((item) => (
                                    <DevisItemRow key={item.id} item={item} onDelete={onDeleteItem} />
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <DevisTotals totals={totals} globalTax={globalTax} globalDiscount={globalDiscount} />

            {/* Footer */}
            <div className="mt-2 pt-1 border-t border-slate-200 flex justify-between items-end">
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-[9px] font-bold text-slate-600">INFOS SUR LE PAIEMENT</p>
                        <p className="text-[9px] text-slate-400 mt-1">Banque: UNITED BANK OF AFRICA UBA</p>
                        <p className="text-[9px] text-slate-400 mt-1">Numero de compte: 12345678901</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 mt-5">Adresse: Plateau, Bamako près de la gare</p>
                        <p className="text-[9px] text-slate-400 mt-1">RCCM: Ma.Bko.2024.B.10122 Du 31/10/2024|NIF: 087100080E</p>
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 mt-5">Numéro: +223 27 22 00 00</p>
                        <p className="text-[9px] text-slate-400 mt-1">Email: contact@artisansproservices.com</p>
                    </div>

                </div>

            </div>

        </motion.div>
    )
}

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
    onClientInfoChange?: (info: Partial<ClientInfo>) => void;
    onUpdateItem?: (id: string, updates: Partial<InvoiceItem>) => void;
}

export const DevisPreview = ({ items, clientInfo, totals, globalTax, globalDiscount, onDeleteItem, onClientInfoChange, onUpdateItem }: DevisPreviewProps) => {
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
                    <div className="font-semibold w-[60%] flex items-center gap-1.5 ">
                        <button className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                            <User size={16} />
                        </button>
                        <input
                            className="border border-slate-100 hover:border-blue-400 focus:border-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm flex-1 transition-colors"
                            type="text"
                            placeholder="Nom du client"
                            value={clientInfo.name}
                            onChange={(e) => onClientInfoChange?.({ name: e.target.value })}
                        />
                    </div>
                    <div className="font-semibold w-[60%] flex items-center ml-4 gap-1.5">
                        <button className="text-slate-400 hover:text-blue-600 transition-all hover:scale-110 active:scale-95">
                            <Phone size={16} />
                        </button>
                        <input
                            className="border border-slate-100 hover:border-blue-400 focus:border-blue-600 focus:outline-none rounded-md px-2 py-1 text-sm flex-1 transition-colors"
                            type="text"
                            placeholder="Téléphone"
                            value={clientInfo.phone}
                            onChange={(e) => onClientInfoChange?.({ phone: e.target.value })}
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
                            <th className="py-4 px-2 text-center w-24">Qté</th>
                            <th className="py-4 px-2 text-center w-32">PU (XOF)</th>
                            <th className="py-4 text-right">Montant HT (XOF)</th>
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
                                    <DevisItemRow key={item.id} item={item} onDelete={onDeleteItem} onUpdate={onUpdateItem} />
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

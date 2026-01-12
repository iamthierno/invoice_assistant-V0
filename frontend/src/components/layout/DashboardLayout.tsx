import type { ReactNode } from 'react'
import { Printer, Mail, Plus, CheckCircle } from 'lucide-react'
// ...
<button
    onClick={() => window.print()}
    className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:scale-110 active:scale-95"
    title="Imprimer"
>
    <Printer size={20} />
</button>
import { AnimatePresence, motion } from 'framer-motion'

interface DashboardLayoutProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    onAddItem?: () => void;
    onMailClick?: () => void;
    onWhatsAppClick?: () => void;
    showSuccess?: boolean;
}

export const DashboardLayout = ({ leftPanel, rightPanel, onAddItem, onMailClick, onWhatsAppClick, showSuccess }: DashboardLayoutProps) => {
    return (
        <div className="h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative">
            {/* Left Column: Control Panel */}
            <div className="w-[450px] flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-20">
                {leftPanel}
            </div>

            {/* Right Column: Live Preview */}
            <div className="flex-1 overflow-hidden py-6 px-12 flex items-center justify-center bg-slate-100/50 relative">
                <div className="w-full max-w-4xl h-full flex items-center justify-center">
                    {rightPanel}
                </div>

                {/* Floating Actions - Centered Vertically on the right edge */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-4 no-print z-30 flex flex-col items-center">
                    {/* Add Item Button - Blue */}
                    <button
                        onClick={onAddItem}
                        className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all border border-blue-200 hover:scale-110 active:scale-95"
                        title="Ajouter un article"
                    >
                        <Plus size={22} strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:scale-110 active:scale-95"
                        title="Imprimer"
                    >
                        <Printer size={20} />
                    </button>
                    <button
                        onClick={onWhatsAppClick}
                        className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-green-600 transition-all border border-slate-100 hover:scale-110 active:scale-95"
                        title="Envoyer par WhatsApp"
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                    </button>
                    <button
                        onClick={onMailClick}
                        className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 hover:scale-110 active:scale-95"
                    >
                        <Mail size={20} />
                    </button>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md border border-emerald-100 shadow-2xl rounded-2xl py-3 px-6 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Mail envoyé !</p>
                            <p className="text-xs text-slate-500">Le devis a été envoyé au client.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

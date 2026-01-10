import type { ReactNode } from 'react'
import { Download, Phone, Mail, Plus, CheckCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface DashboardLayoutProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
    onAddItem?: () => void;
    onMailClick?: () => void;
    showSuccess?: boolean;
}

export const DashboardLayout = ({ leftPanel, rightPanel, onAddItem, onMailClick, showSuccess }: DashboardLayoutProps) => {
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
                    <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:scale-110 active:scale-95">
                        <Download size={20} />
                    </button>
                    <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-green-600 transition-all border border-slate-100 hover:scale-110 active:scale-95">
                        <Phone size={20} />
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

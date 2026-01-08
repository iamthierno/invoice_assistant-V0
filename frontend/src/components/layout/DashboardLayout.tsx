import type { ReactNode } from 'react'
import { Download, Phone, Mail } from 'lucide-react'

interface DashboardLayoutProps {
    leftPanel: ReactNode;
    rightPanel: ReactNode;
}

export const DashboardLayout = ({ leftPanel, rightPanel }: DashboardLayoutProps) => {
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
                    <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:scale-110 active:scale-95">
                        <Download size={20} />
                    </button>
                    <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-green-600 transition-all border border-slate-100 hover:scale-110 active:scale-95">
                        <Phone size={20} />
                    </button>
                    <button className="w-12 h-12 bg-white shadow-xl rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 hover:scale-110 active:scale-95">
                        <Mail size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

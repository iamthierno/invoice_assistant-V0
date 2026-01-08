import { Mic } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

interface VoiceInputButtonProps {
    isListening: boolean;
    onClick: () => void;
}

export const VoiceInputButton = ({ isListening, onClick }: VoiceInputButtonProps) => {
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onClick}
                className={cn(
                    "p-4 rounded-2xl transition-all border",
                    isListening
                        ? "bg-rose-50 border-rose-100 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                        : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600 shadow-sm"
                )}
            >
                <Mic size={24} className={isListening ? "animate-pulse" : ""} />
            </button>

            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 24 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-center gap-1 mt-4 items-center"
                    >
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ height: [4, 16, 4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                className="w-1 bg-blue-500 rounded-full"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

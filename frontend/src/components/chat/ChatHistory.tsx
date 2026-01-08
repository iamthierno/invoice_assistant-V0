import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '../../types'
import { cn } from '../../utils'
import { useEffect, useRef } from 'react'

interface ChatHistoryProps {
    messages: ChatMessage[];
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
    const endRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    return (
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-6 scrollbar-hide">
            <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "flex flex-col gap-1.5",
                            msg.role === 'user' ? "items-end" : "items-start"
                        )}
                    >
                        <div className={cn(
                            "max-w-[85%] px-5 py-3.5 text-sm leading-relaxed",
                            msg.role === 'user'
                                ? "bg-blue-600 text-white shadow-md shadow-blue-100 rounded-2xl"
                                : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-2xl"
                        )}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={endRef} />
        </div>
    )
}

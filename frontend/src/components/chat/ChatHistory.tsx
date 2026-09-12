import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMessage } from '../../types'
import { cn } from '../../utils'
import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
                                : "bg-white border border-slate-100 text-slate-700 shadow-sm rounded-2xl prose prose-sm max-w-none prose-slate"
                        )}>
                            {msg.role === 'user' ? (
                                msg.content
                            ) : (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-200 border border-slate-200" {...props} /></div>,
                                        th: ({ node, ...props }) => <th className="px-3 py-2 bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b border-slate-200" {...props} />,
                                        td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-600 border-b border-slate-100" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            )}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div ref={endRef} />
        </div>
    )
}

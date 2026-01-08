import { Send } from 'lucide-react'
import { useState } from 'react'

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
    const [text, setText] = useState('')

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim())
            setText('')
        }
    }

    return (
        <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border border-slate-200 focus-within:border-blue-300 transition-all">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={disabled}
                placeholder="Ajoutez un article, une remise..."
                className="flex-1 bg-transparent px-4 py-2 outline-none text-slate-700 text-sm font-medium placeholder:text-slate-400 disabled:opacity-50"
            />
            <button
                onClick={handleSend}
                disabled={disabled || !text.trim()}
                className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
                <Send size={18} />
            </button>
        </div>
    )
}

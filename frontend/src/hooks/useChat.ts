import { useState, useCallback } from 'react';
import type { ChatMessage } from '../types';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: 'Bonjour. Je suis prêt à vous aider avec votre devis. Que souhaitez-vous ajouter ?',
            timestamp: new Date(),
        }
    ]);

    const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
        setMessages(prev => [...prev, { role, content, timestamp: new Date() }]);
    }, []);

    return { messages, addMessage };
};

import { useState, useCallback } from 'react';
import { agentService } from '../services/agent';
import { useInvoiceStore } from '../services/useInvoiceStore';

export const useAgent = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const invoiceId = useInvoiceStore(state => state.invoiceId);

    const processCommand = useCallback(async (command: string, onEvent: (event: any) => void) => {
        setIsProcessing(true);
        try {
            await agentService.sendCommand(command, (event) => {
                onEvent(event);
            }, invoiceId);
        } catch (error) {
            console.error('Failed to process command:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [invoiceId]);

    return { isProcessing, processCommand };
};

import { useState, useCallback } from 'react';
import { agentService } from '../services/agent';

export const useAgent = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const processCommand = useCallback(async (command: string, onEvent: (event: any) => void) => {
        setIsProcessing(true);
        try {
            await agentService.sendCommand(command, (event) => {
                onEvent(event);
            });
        } catch (error) {
            console.error('Failed to process command:', error);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    return { isProcessing, processCommand };
};

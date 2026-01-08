import { useState, useCallback } from 'react';

export const useVoiceInput = () => {
    const [isListening, setIsListening] = useState(false);

    const startListening = useCallback(() => {
        setIsListening(true);
        // Real implementation would use Web Speech API or Realtime API
        console.log('Recording started...');
    }, []);

    const stopListening = useCallback(() => {
        setIsListening(false);
        console.log('Recording stopped.');
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) stopListening();
        else startListening();
    }, [isListening, startListening, stopListening]);

    return { isListening, startListening, stopListening, toggleListening };
};

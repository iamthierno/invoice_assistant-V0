import { config } from '../config';

export const agentService = {
    async sendCommand(command: string, onChunk: (chunk: any) => void) {
        try {
            const response = await fetch(`${config.agentUrl}/agent/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command }),
            });

            if (!response.body) return;

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const event = JSON.parse(line);
                            onChunk(event);
                        } catch (e) {
                            // Fallback for non-JSON chunks if any
                            onChunk({ type: 'text', content: line });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Agent communication error:', error);
            throw error;
        }
    }
};

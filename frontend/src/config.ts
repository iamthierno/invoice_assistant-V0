export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
    agentUrl: import.meta.env.VITE_AGENT_URL || 'http://localhost:8000',
    isDev: import.meta.env.VITE_DEV_MODE === 'true',
};

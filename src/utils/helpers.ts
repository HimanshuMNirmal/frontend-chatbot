export const generateSessionId = (): string => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTimestamp = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

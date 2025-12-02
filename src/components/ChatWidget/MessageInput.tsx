import { useState, useEffect, useRef } from 'react';

interface MessageInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    sessionId?: string;
    onTyping?: (isTyping: boolean) => void;
}

function MessageInput({ onSend, disabled, sessionId, onTyping }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const typingTimeoutRef = useRef<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            // Stop typing indicator when message is sent
            if (onTyping && sessionId) {
                onTyping(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Emit typing indicator
        if (onTyping && sessionId && value.length > 0) {
            onTyping(true);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing indicator after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                onTyping(false);
            }, 2000);
        } else if (onTyping && sessionId && value.length === 0) {
            onTyping(false);
        }
    };

    useEffect(() => {
        // Cleanup timeout on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    return (
        <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={handleChange}
                    placeholder="Type your message..."
                    disabled={disabled}
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
                />
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    Send
                </button>
            </div>
        </form>
    );
}

export default MessageInput;

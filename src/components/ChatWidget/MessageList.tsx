import { useEffect, useRef } from 'react';
import { formatTimestamp } from '../../utils/helpers';

interface Message {
    id: string;
    message: string;
    senderType: 'user' | 'admin' | 'ai';
    timestamp: string;
}

interface MessageListProps {
    messages: Message[];
}

function MessageList({ messages }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[70%] rounded-lg p-3 ${msg.senderType === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                            {formatTimestamp(msg.timestamp)}
                        </p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;

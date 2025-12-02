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
    isAdminTyping?: boolean;
    isAiThinking?: boolean;
}

function MessageList({ messages, isAdminTyping, isAiThinking }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAdminTyping, isAiThinking]);

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
                                : msg.senderType === 'ai'
                                    ? 'bg-green-100 text-gray-800 border border-green-300'
                                    : 'bg-gray-200 text-gray-800'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {msg.senderType === 'ai' && (
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-semibold">
                                    AI
                                </span>
                            )}
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                            {formatTimestamp(msg.timestamp)}
                        </p>
                    </div>
                </div>
            ))}

            {isAdminTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">Admin is typing</span>
                            <div className="flex gap-1 ml-1">
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isAiThinking && (
                <div className="flex justify-start">
                    <div className="bg-green-100 text-gray-800 rounded-lg p-3 border border-green-300">
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-semibold">
                                AI
                            </span>
                            <span className="text-sm text-gray-600">is thinking</span>
                            <div className="flex gap-1 ml-1">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}

export default MessageList;

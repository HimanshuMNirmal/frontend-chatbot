import { useEffect, useState, useRef } from 'react';
import apiService from '../../services/api';
import socketService from '../../services/socket';
import { formatTimestamp } from '../../utils/helpers';

interface Message {
    id: string;
    sessionId: string;
    message: string;
    senderType: 'user' | 'admin' | 'ai';
    timestamp: string;
}

interface ConversationViewProps {
    sessionId: string;
}

function ConversationView({ sessionId }: ConversationViewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUserTyping, setIsUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        loadMessages();

        // Listen for new user messages in real-time
        socketService.on('user-message', (message: Message) => {
            if (message.sessionId === sessionId) {
                setMessages((prev) => [...prev, message]);
                setIsUserTyping(false); // Stop typing indicator when message arrives
            }
        });

        // Listen for user typing indicator
        socketService.on('user-typing', (data: { sessionId: string; isTyping: boolean }) => {
            if (data.sessionId === sessionId) {
                setIsUserTyping(data.isTyping);
            }
        });

        return () => {
            socketService.off('user-message');
            socketService.off('user-typing');
        };
    }, [sessionId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isUserTyping]);

    const loadMessages = async () => {
        try {
            const data = await apiService.get(`/api/messages/${sessionId}`);
            setMessages(data);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sessionId,
            message: newMessage.trim(),
            timestamp: new Date().toISOString(),
        };

        socketService.emit('admin-reply', messageData);

        // Stop typing indicator
        socketService.emit('admin-typing', {
            sessionId,
            isTyping: false,
        });

        setMessages((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                sessionId,
                message: newMessage.trim(),
                senderType: 'admin',
                timestamp: new Date().toISOString(),
            },
        ]);

        setNewMessage('');
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-50">
            <div className="p-4 bg-white border-b">
                <h3 className="font-semibold text-gray-800">
                    Session: {sessionId.substring(0, 30)}...
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${msg.senderType === 'user'
                                ? 'bg-gray-200 text-gray-800'
                                : msg.senderType === 'ai'
                                    ? 'bg-green-100 text-gray-800'
                                    : 'bg-blue-600 text-white'
                                }`}
                        >
                            <p className="text-sm">{msg.message}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs opacity-70">
                                    {formatTimestamp(msg.timestamp)}
                                </p>
                                {msg.senderType === 'ai' && (
                                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                                        AI
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isUserTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 rounded-lg p-3">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600">User is typing</span>
                                <div className="flex gap-1 ml-1">
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendReply} className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            const value = e.target.value;
                            setNewMessage(value);

                            // Emit typing indicator
                            if (value.length > 0) {
                                socketService.emit('admin-typing', {
                                    sessionId,
                                    isTyping: true,
                                });

                                // Clear existing timeout
                                if (typingTimeoutRef.current) {
                                    clearTimeout(typingTimeoutRef.current);
                                }

                                // Set timeout to stop typing indicator after 2 seconds
                                typingTimeoutRef.current = setTimeout(() => {
                                    socketService.emit('admin-typing', {
                                        sessionId,
                                        isTyping: false,
                                    });
                                }, 2000);
                            } else {
                                socketService.emit('admin-typing', {
                                    sessionId,
                                    isTyping: false,
                                });
                            }
                        }}
                        placeholder="Type your reply..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ConversationView;

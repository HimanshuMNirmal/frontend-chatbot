import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import socketService from '../../services/socket';
import { setSessionId, addMessage, setMessages } from '../../store/chatSlice';
import { generateSessionId } from '../../utils/helpers';
import apiService from '../../services/api';
import { RootState } from '../../store/store';

interface ChatWindowProps {
    onClose: () => void;
}

function ChatWindow({ onClose }: ChatWindowProps) {
    const dispatch = useDispatch();
    const { currentSessionId, messages } = useSelector((state: RootState) => state.chat);
    const [isConnected, setIsConnected] = useState(false);
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [handedOffToAdmin, setHandedOffToAdmin] = useState(false);
    const isCreatingSession = useRef(false);

    useEffect(() => {
        // Only connect socket and listen for messages
        // Session creation is deferred until first message is sent
        const initializeChat = async () => {
            const socket = socketService.connect();

            socket.on('connect', () => {
                setIsConnected(true);
            });

            socket.on('disconnect', () => {
                setIsConnected(false);
            });

            socket.on('connect_error', () => {
                setIsConnected(false);
            });

            // Listen for admin replies in real-time
            socketService.on('admin-reply', (message) => {
                dispatch(addMessage(message));
                setIsAdminTyping(false); // Stop typing indicator when message arrives
                setHandedOffToAdmin(true); // Mark as handed off when admin replies
            });

            // Listen for AI replies in real-time
            socketService.on('ai-reply', (message) => {
                dispatch(addMessage(message));
                setIsAiThinking(false); // Stop thinking indicator when AI message arrives
                // Check if this is a handoff message
                if (message.message.includes('Connecting you to our support team')) {
                    setHandedOffToAdmin(true);
                }
            });

            // Listen for admin typing indicator
            socketService.on('admin-typing', (data: { sessionId: string; isTyping: boolean }) => {
                if (data.sessionId === currentSessionId) {
                    setIsAdminTyping(data.isTyping);
                }
            });

            // Listen for AI thinking indicator
            socketService.on('ai-thinking', (data: { sessionId: string; isThinking: boolean }) => {
                if (data.sessionId === currentSessionId) {
                    setIsAiThinking(data.isThinking);
                }
            });

            // If session already exists, load messages and join room
            if (currentSessionId) {
                socket.emit('user-connected', {
                    sessionId: currentSessionId,
                    ipAddress: '127.0.0.1',
                });

                // Only load messages if we didn't just create the session locally
                if (!isCreatingSession.current) {
                    // Load existing messages from API
                    const response = await apiService.get(`/api/messages/${currentSessionId}`);
                    const existingMessages = Array.isArray(response) ? response : [];

                    if (!Array.isArray(response)) {
                        console.error('Expected array of messages but got:', response);
                    }

                    dispatch(setMessages(existingMessages));

                    // Check if any admin messages exist (means already handed off)
                    const hasAdminMessage = existingMessages.some((msg: any) => msg.senderType === 'admin');
                    if (hasAdminMessage) {
                        setHandedOffToAdmin(true);
                    }
                } else {
                    isCreatingSession.current = false;
                }
            }
        };

        initializeChat();

        return () => {
            socketService.disconnect();
        };
    }, [currentSessionId, dispatch]);

    const handleSendMessage = async (message: string) => {
        let sessionId = currentSessionId;
        // Create session on first message
        if (!sessionId) {
            try {
                isCreatingSession.current = true;
                sessionId = generateSessionId();

                // Create session in database
                await apiService.post('/api/chats', {
                    sessionId,
                    ipAddress: '127.0.0.1',
                });

                dispatch(setSessionId(sessionId));

                // Emit user-connected event to join room
                const socket = socketService.getSocket();
                if (socket) {
                    socket.emit('user-connected', {
                        sessionId,
                        ipAddress: '127.0.0.1',
                    });
                }
            } catch (error) {
                console.error('Failed to create session:', error);
                isCreatingSession.current = false;
                // Don't proceed with sending message if session creation failed
                return;
            }
        }

        const messageData = {
            sessionId,
            message,
            timestamp: new Date().toISOString(),
        };

        socketService.emit('user-message', messageData);

        dispatch(addMessage({
            id: Date.now().toString(),
            sessionId,
            message,
            senderType: 'user',
            timestamp: new Date().toISOString(),
            isRead: false,
        }));
    };

    const handleTyping = (isTyping: boolean) => {
        if (currentSessionId) {
            socketService.emit('user-typing', {
                sessionId: currentSessionId,
                isTyping,
            });
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-40">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">Chat Support</h3>
                <div className="flex items-center gap-2">
                    {!handedOffToAdmin && (
                        <button
                            onClick={() => handleSendMessage('I would like to talk to a human agent')}
                            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
                            title="Request human support"
                            disabled={!isConnected}
                        >
                            👤 Human
                        </button>
                    )}
                    <button onClick={onClose} className="hover:bg-blue-700 rounded p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {!isConnected && (
                <div className="bg-red-500 text-white text-xs p-1 text-center font-medium">
                    Connection lost. Reconnecting...
                </div>
            )}

            <MessageList messages={messages} isAdminTyping={isAdminTyping} isAiThinking={isAiThinking} />
            <MessageInput
                onSend={handleSendMessage}
                disabled={!isConnected}
                sessionId={currentSessionId || undefined}
                onTyping={handleTyping}
            />
        </div>
    );
}

export default ChatWindow;

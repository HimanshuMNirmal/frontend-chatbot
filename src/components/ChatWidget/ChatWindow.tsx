import { useEffect, useState } from 'react';
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

    useEffect(() => {
        // Initialize session and socket connection
        const initializeChat = async () => {
            let sessionId = currentSessionId;

            if (!sessionId) {
                sessionId = generateSessionId();
                dispatch(setSessionId(sessionId));

                await apiService.post('/api/chats', {
                    sessionId,
                    ipAddress: '127.0.0.1',
                });
            }

            const socket = socketService.connect();
            setIsConnected(true);

            socket.emit('user-connected', {
                sessionId,
                ipAddress: '127.0.0.1',
            });

            // Load existing messages from API
            const existingMessages = await apiService.get(`/api/messages/${sessionId}`);
            dispatch(setMessages(existingMessages));

            // Listen for admin replies in real-time
            socketService.on('admin-reply', (message) => {
                dispatch(addMessage(message));
            });
        };

        initializeChat();

        return () => {
            socketService.disconnect();
        };
    }, [currentSessionId, dispatch]);

    const handleSendMessage = (message: string) => {
        if (!currentSessionId) return;

        const messageData = {
            sessionId: currentSessionId,
            message,
            timestamp: new Date().toISOString(),
        };

        socketService.emit('user-message', messageData);

        dispatch(addMessage({
            id: Date.now().toString(),
            sessionId: currentSessionId,
            message,
            senderType: 'user',
            timestamp: new Date().toISOString(),
            isRead: false,
        }));
    };

    return (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-40">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-semibold">Chat Support</h3>
                <button onClick={onClose} className="hover:bg-blue-700 rounded p-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <MessageList messages={messages} />
            <MessageInput onSend={handleSendMessage} disabled={!isConnected} />
        </div>
    );
}

export default ChatWindow;

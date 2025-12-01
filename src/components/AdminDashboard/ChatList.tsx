import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import socketService from '../../services/socket';
import { formatTimestamp } from '../../utils/helpers';

interface ChatSession {
    id: string;
    sessionId: string;
    lastActive: string;
    messages: Array<{
        message: string;
        timestamp: string;
    }>;
}

interface ChatListProps {
    onSelectChat: (sessionId: string) => void;
    selectedSessionId: string | null;
}

function ChatList({ onSelectChat, selectedSessionId }: ChatListProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const navigate = useNavigate();

    const loadSessions = async () => {
        try {
            const data = await apiService.get('/api/chats');
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
            navigate('/admin');
        }
    };

    useEffect(() => {
        loadSessions();

        socketService.connect();

        // Refresh chat list when new messages arrive or admin sends reply
        socketService.on('user-message', loadSessions);
        socketService.on('chat-list-update', loadSessions);

        return () => {
            socketService.off('user-message');
            socketService.off('chat-list-update');
        };
    }, []);

    return (
        <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Chat Sessions</h2>
            </div>

            <div className="divide-y">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => onSelectChat(session.sessionId)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSessionId === session.sessionId ? 'bg-blue-50' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm text-gray-800">
                                {session.sessionId.substring(0, 20)}...
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTimestamp(session.lastActive)}
                            </span>
                        </div>
                        {session.messages[0] && (
                            <p className="text-sm text-gray-600 truncate">
                                {session.messages[0].message}
                            </p>
                        )}
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No chat sessions yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatList;

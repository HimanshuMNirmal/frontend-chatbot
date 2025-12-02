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
    const [handoffRequests, setHandoffRequests] = useState<Set<string>>(new Set());
    const [unreadSessions, setUnreadSessions] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    const loadSessions = async () => {
        try {
            const data = await apiService.get('/api/chats');
            if (Array.isArray(data)) {
                setSessions(data);
            } else {
                console.error('Expected array of sessions but got:', data);
                setSessions([]);
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
            navigate('/admin');
        }
    };

    useEffect(() => {
        loadSessions();

        socketService.connect();

        // Mark session as unread when new user message arrives
        socketService.on('user-message', (message: any) => {
            // Only mark as unread if not currently viewing this session
            if (message.sessionId !== selectedSessionId) {
                setUnreadSessions(prev => new Set(prev).add(message.sessionId));
            }
            loadSessions();
        });

        socketService.on('chat-list-update', loadSessions);

        // Listen for handoff requests
        socketService.on('handoff-requested', (data: { sessionId: string }) => {
            setHandoffRequests(prev => new Set(prev).add(data.sessionId));
            loadSessions();
        });

        return () => {
            socketService.off('user-message');
            socketService.off('chat-list-update');
            socketService.off('handoff-requested');
        };
    }, [selectedSessionId]);

    return (
        <div className="w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Chat Sessions</h2>
            </div>

            <div className="divide-y">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        onClick={() => {
                            onSelectChat(session.sessionId);
                            setHandoffRequests(prev => {
                                const next = new Set(prev);
                                next.delete(session.sessionId);
                                return next;
                            });
                            setUnreadSessions(prev => {
                                const next = new Set(prev);
                                next.delete(session.sessionId);
                                return next;
                            });
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSessionId === session.sessionId ? 'bg-blue-50' : ''
                            } ${handoffRequests.has(session.sessionId) ? 'border-l-4 border-red-500' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-800">
                                    {session.sessionId.substring(0, 20)}...
                                </span>
                                {handoffRequests.has(session.sessionId) && (
                                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                                        Needs Help
                                    </span>
                                )}
                                {unreadSessions.has(session.sessionId) && (
                                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        New
                                    </span>
                                )}
                            </div>
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

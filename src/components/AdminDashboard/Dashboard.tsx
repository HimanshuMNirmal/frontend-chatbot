import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ConversationView from './ConversationView';

function Dashboard() {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin');
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition-colors"
                >
                    Logout
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <ChatList
                    onSelectChat={setSelectedSessionId}
                    selectedSessionId={selectedSessionId}
                />

                {selectedSessionId ? (
                    <ConversationView sessionId={selectedSessionId} />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <p className="text-gray-500">Select a chat to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

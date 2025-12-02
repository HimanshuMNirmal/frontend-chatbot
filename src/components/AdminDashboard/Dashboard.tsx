import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ConversationView from './ConversationView';
import AISettings from './AISettings';

function Dashboard() {
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chats' | 'ai-settings'>('chats');
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

            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('chats')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'chats'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        💬 Chats
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-settings')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'ai-settings'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        🤖 AI Settings
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'chats' ? (
                    <div className="flex h-full">
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
                ) : (
                    <div className="h-full overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-3xl mx-auto">
                            <AISettings />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;

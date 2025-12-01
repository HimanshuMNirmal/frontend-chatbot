import ChatWidget from './components/ChatWidget/ChatWidget';

function App() {
    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Chatbot System
                    </h1>
                    <p className="text-gray-600">
                        Real-time chat application
                    </p>
                </div>
            </div>
            <ChatWidget />
        </div>
    );
}

export default App;

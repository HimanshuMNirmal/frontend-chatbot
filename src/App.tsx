import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChatWidget from './components/ChatWidget/ChatWidget';
import Login from './components/AdminDashboard/Login';
import Dashboard from './components/AdminDashboard/Dashboard';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
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
                } />
                <Route path="/admin" element={<Login />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

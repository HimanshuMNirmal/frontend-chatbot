import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
    id: string;
    sessionId: string;
    message: string;
    senderType: 'user' | 'admin' | 'ai';
    timestamp: string;
    isRead: boolean;
}

interface ChatSession {
    id: string;
    sessionId: string;
    lastActive: string;
    messages: Message[];
}

interface ChatState {
    currentSessionId: string | null;
    messages: Message[];
    sessions: ChatSession[];
    isTyping: boolean;
    isAdminTyping: boolean;
}

const initialState: ChatState = {
    currentSessionId: null,
    messages: [],
    sessions: [],
    isTyping: false,
    isAdminTyping: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setSessionId: (state, action: PayloadAction<string>) => {
            state.currentSessionId = action.payload;
        },
        addMessage: (state, action: PayloadAction<Message>) => {
            state.messages.push(action.payload);
        },
        setMessages: (state, action: PayloadAction<Message[]>) => {
            state.messages = action.payload;
        },
        setSessions: (state, action: PayloadAction<ChatSession[]>) => {
            state.sessions = action.payload;
        },
        setTyping: (state, action: PayloadAction<boolean>) => {
            state.isTyping = action.payload;
        },
        setAdminTyping: (state, action: PayloadAction<boolean>) => {
            state.isAdminTyping = action.payload;
        },
    },
});

export const {
    setSessionId,
    addMessage,
    setMessages,
    setSessions,
    setTyping,
    setAdminTyping,
} = chatSlice.actions;

export default chatSlice.reducer;

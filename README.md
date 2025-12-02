# Frontend - Real-Time Chatbot Interface

This is the customer-facing chat widget and admin dashboard for the chatbot system. Built with React and Socket.IO for real-time messaging.

## What's Inside

**Tech I Used:**
- React 18 with TypeScript (using Vite for blazing fast dev experience)
- TailwindCSS for styling (makes responsive design so much easier)
- Socket.IO client for real-time bidirectional messaging
- Redux Toolkit for state management (honestly overkill for this, but good practice)
- React Router for navigation between chat widget and admin dashboard

## Getting It Running

### Prerequisites

You'll need:
- Node.js v18 or newer
- The backend server running (see backend-chatbot README)
- npm or yarn (I used npm)

### Setup

1. Install everything:
```bash
npm install
```

2. Configure your environment:
```bash
# Create a .env file with these variables:
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# If you deployed the backend, use those URLs instead
```

### Running Locally

Start the dev server:
```bash
npm run dev
```

Open http://localhost:5173 in your browser. The chat widget should appear in the bottom-right corner.

For production build:
```bash
npm run build
npm run preview
```

## How to Use It

### Customer Chat Widget

The main page (`/`) shows the chat widget. Here's what users can do:

- Click the floating button in the bottom-right to open the chat
- Type messages and hit Enter or click Send
- See real-time responses from admins or AI
- Messages persist even if you refresh (stored in the database)
- Typing indicators show when admin/AI is responding

**Technical note:** Each user gets a unique session ID stored in localStorage. This way they can close and reopen the chat without losing their conversation.

### Admin Dashboard

Navigate to `/admin` to access the admin panel.

**Login credentials:**
- Email: admin@aimbrill.com
- Password: admin123

Once logged in, you'll see:

1. **Chat List** - All active and past conversations
   - Shows last message preview
   - Timestamp of last activity
   - Click any chat to view the full conversation

2. **Conversation View** - Full chat history with a specific user
   - Color-coded messages (blue for user, green for admin, purple for AI)
   - Real-time updates when new messages arrive
   - Reply directly from this view

3. **AI Settings** (bonus feature!)
   - Toggle AI auto-responses on/off
   - Configure AI provider (OpenAI or OpenRouter)
   - Adjust model, temperature, and system prompt
   - Test AI responses before enabling

## Project Structure

I organized the components into two main sections:

```
src/
├── components/
│   ├── ChatWidget/
│   │   ├── ChatWidget.tsx        # Floating button
│   │   ├── ChatWindow.tsx        # Main chat interface
│   │   ├── MessageList.tsx       # Message display with auto-scroll
│   │   └── MessageInput.tsx      # Input field with typing indicator
│   └── AdminDashboard/
│       ├── Login.tsx             # Admin authentication
│       ├── Dashboard.tsx         # Main dashboard layout
│       ├── ChatList.tsx          # List of all conversations
│       ├── ConversationView.tsx  # Individual chat view
│       └── AISettings.tsx        # AI configuration panel
├── services/
│   ├── socket.ts                 # Socket.IO client wrapper
│   └── api.ts                    # HTTP API calls
├── store/
│   ├── chatSlice.ts              # Redux slice for chat state
│   └── store.ts                  # Redux store configuration
├── utils/
│   └── helpers.ts                # Utility functions
├── App.tsx                       # Main app with routing
└── main.tsx                      # Entry point
```

## Key Features

**Real-Time Communication:**
- Socket.IO handles all real-time messaging
- Messages appear instantly without page refresh
- Typing indicators for better UX
- Connection status handling (reconnects automatically)

**State Management:**
- Redux Toolkit manages chat state
- Messages, sessions, and UI state all in one place
- Makes it easy to sync state across components

**Responsive Design:**
- Works on desktop, tablet, and mobile
- Chat widget adapts to screen size
- Admin dashboard is fully responsive

**Session Management:**
- Unique session ID per user (generated on first visit)
- Stored in localStorage for persistence
- Backend tracks IP address and user agent

## Socket Events

The app listens for and emits these Socket.IO events:

**Emitted by this app:**
- `user-connected` - When user opens chat
- `user-message` - When user sends a message
- `admin-reply` - When admin responds (admin dashboard only)
- `user-typing` / `admin-typing` - Typing indicators

**Received from server:**
- `admin-reply` - Admin's response to user
- `ai-reply` - AI-generated response
- `user-message` - User message (admin dashboard only)
- `chat-list-update` - Trigger to refresh chat list
- `ai-thinking` - Show/hide AI thinking indicator
- `message-received` - Confirmation message was saved

## Development Notes

**Auto-scroll:** The message list automatically scrolls to the bottom when new messages arrive. This was trickier than expected - had to use `useEffect` with a ref to the messages container.

**Typing Indicators:** There's a 500ms debounce on typing events to avoid spamming the server. The indicator disappears after 3 seconds of inactivity.

**Authentication:** JWT token is stored in localStorage after login. The `authMiddleware` on the backend verifies it for protected routes.

**Color Coding:** Messages are color-coded by sender type:
- User messages: Blue background
- Admin messages: Green background  
- AI messages: Purple background with robot icon

## Styling

I used TailwindCSS utility classes throughout. Some custom styles in `index.css` for:
- Smooth animations on chat widget open/close
- Custom scrollbar styling
- Gradient backgrounds

The color scheme is:
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- AI: Purple (#8b5cf6)
- Background: Gray (#f3f4f6)

## Things I'd Improve

If I had more time, I'd add:
- File upload support (images, documents)
- Emoji picker
- Message search
- Dark mode toggle
- Sound notifications for new messages
- Better error handling UI
- Loading skeletons instead of spinners

## Troubleshooting

**Chat widget not appearing?**
- Check if the backend is running on port 5000
- Verify VITE_SOCKET_URL in your .env file
- Check browser console for errors

**Messages not sending?**
- Make sure Socket.IO connection is established (check console)
- Verify backend CORS settings allow your frontend URL
- Check network tab for failed requests

**Admin login not working?**
- Double-check credentials (admin@aimbrill.com / admin123)
- Ensure backend JWT_SECRET is set
- Clear localStorage and try again

---

Built with ⚛️ React and lots of coffee ☕

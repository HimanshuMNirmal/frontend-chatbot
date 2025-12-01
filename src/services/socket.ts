import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        this.socket = io(SOCKET_URL);
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event: string) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    getSocket() {
        return this.socket;
    }
}

export default new SocketService();

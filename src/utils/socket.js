import { io } from 'socket.io-client'

let socket;

export const getSocket = () => socket;

export const connectSocket = () => {
    if (!socket) {
        socket = io(import.meta.env.VITE_APP_BACKEND_SOCKET, {
            path: '/socket.io',
            withCredentials: true,
            autoConnect: false,
        });

        socket.on('connect', () => {});

        socket.on('disconnect', () => {});
    }
    
    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
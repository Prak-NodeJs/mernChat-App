
import io from 'socket.io-client';

const ENDPOINT = `${import.meta.env.VITE_BASE_URL}`;
let socket;

export const initializeSocket = () => {
    socket = io(ENDPOINT);
};

export const getSocket = () => {
    if (!socket) {
        initializeSocket();
    }
    return socket;
};

export const closeSocket = () => {
    if (socket) {
        socket.close();
    }
};

//socket.js
import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  socket = io(socketUrl, {
    transports: ['websocket'],
    upgrade: false,
  });
}

export const getIO = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};

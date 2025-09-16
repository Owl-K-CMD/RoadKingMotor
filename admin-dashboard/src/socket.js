import { io } from 'socket.io-client';
import userAct from './userAxios.js'


let socket;

export const initSocket = () => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  const token ='admin';
  const userName='Road King Motor Support';
  
  socket = io(socketUrl, {
    auth: {
      userId: '68437f46357ee88b6d9b492d',
      token: token,
    },
    transports: ['websocket'],
    withCredentials: true,
  });
}

export const getIO = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initSocket first.");
  }
  return socket;
};

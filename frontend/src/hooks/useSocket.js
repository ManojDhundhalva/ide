import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import config from '../config';

export const useSocket = ({ sessionToken, projectId }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket only in browser
    if (typeof window === 'undefined') return;

    console.log('Initializing socket connection...');
    const socketInstance = io(config.WORKSPACE_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { sessionToken, projectId }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    return () => {
      console.log('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

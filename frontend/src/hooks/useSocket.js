import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useFileStore } from '../store/fileStore';
import { useProjectStore } from '../store/projectStore';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const sessionToken = window.localStorage.getItem("session-token");
  
  const project = useProjectStore((s) => s.project);
  const projectId = project._id;
  
  const ec2_ip = useFileStore((s) => s.ec2_ip);
  const workspace_url = `${ec2_ip}:9000`

  useEffect(() => {
    // Initialize socket only in browser
    if (typeof window === 'undefined') return;

    console.log('Initializing socket connection...');
    const socketInstance = io(workspace_url, {
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

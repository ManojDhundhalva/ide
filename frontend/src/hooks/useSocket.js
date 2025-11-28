import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useFileStore } from '../store/fileStore';
import { useProjectStore } from '../store/projectStore';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const sessionToken = window.localStorage.getItem("session-token");

  const project = useProjectStore((s) => s.project);
  // be defensive: project may be undefined initially
  const projectId = project?._id || null;

  const ec2_ip = useFileStore((s) => s.ec2_ip);
  const workspace_url = `${ec2_ip}:9000`

  useEffect(() => {
    // Initialize socket only in browser and only when we have both the server
    // address and a projectId to send in the auth handshake. The backend immediately
    // disconnects clients that don't provide a projectId, so wait until it's set.
    if (typeof window === 'undefined') return;
    if (!workspace_url) return;
    if (!projectId) return;

    console.log('Initializing socket connection...', workspace_url, projectId);

    const socketInstance = io(workspace_url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: { sessionToken, projectId }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket connected successfully', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason, details) => {
      console.log('Socket disconnected', reason);
      console.log(details.message);
      console.log(details.description);
      console.log(details.context);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error && error.message ? error.message : error);
    });

    return () => {
      console.log('Cleaning up socket connection');
      try { socketInstance.disconnect(); } catch (e) { /* ignore */ }
    };
    // re-run when workspace_url or projectId changes
  }, [workspace_url, projectId]);

  return socket;
};

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

/**
 * Wraps the app with a Socket.IO connection.
 * Reconnects with exponential backoff automatically.
 */
export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
      setConnected(true);
    });
    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
      setConnected(false);
    });
    socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message);
    });

    socketRef.current = socket;
    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, clientCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

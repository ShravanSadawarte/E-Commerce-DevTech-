import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    // WebSockets are not supported on Vercel Serverless Functions
    // Only connect in development or when a custom socket URL is provided
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl && import.meta.env.PROD) {
      // In production without a dedicated socket server, return a no-op proxy
      console.warn('[Socket] WebSocket not available in serverless production. Chat features are disabled.');
      return createNoopSocket();
    }
    socket = io(socketUrl || window.location.origin, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// No-op socket that silently swallows events — prevents crashes in production
function createNoopSocket() {
  return {
    on: () => {},
    off: () => {},
    emit: () => {},
    connect: () => {},
    disconnect: () => {},
    connected: false,
    id: null,
  };
}

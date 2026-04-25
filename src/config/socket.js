// src/config/socket.js
export const socketConfig = {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
    allowEIO3: true,
    transports: ['websocket', 'polling'],
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.WS_PING_INTERVAL) || 25000,
};
import { useEffect, useRef, useCallback } from 'react';

const WS_URL = 'wss://pizzastore-backend-cfpe.onrender.com';
const MAX_RETRIES = 8;

/**
 * useWebSocket
 * Manages a single authenticated WebSocket connection.
 *
 * @param {string|null} token  – JWT from AuthContext (null if logged out)
 * @param {function}    onMessage – callback(parsedData) for incoming server messages
 */
const useWebSocket = (token, onMessage) => {
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const retryTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const connectRef = useRef();

  const scheduleReconnect = useCallback(() => {
    if (retriesRef.current >= MAX_RETRIES) {
      console.warn('[WS] Max reconnection attempts reached.');
      return;
    }
    const delay = Math.min(1000 * 2 ** retriesRef.current, 30000); // exponential back-off, max 30 s
    retriesRef.current += 1;
    console.log(`[WS] Reconnecting in ${delay / 1000}s (attempt ${retriesRef.current})…`);
    retryTimerRef.current = setTimeout(() => connectRef.current?.(), delay);
  }, []);

  const connect = useCallback(() => {
    if (!token || !mountedRef.current) return;

    // Don't open a second socket if one is already open/connecting
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN ||
                           wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      retriesRef.current = 0;
      // Authenticate immediately after connecting
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'auth_success') {
          onMessage && onMessage(data);
        }
      } catch (err) {
        console.error('[WS] Failed to parse message:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WS] Disconnected (code=${event.code})`);
      if (!mountedRef.current || event.code === 4001) return; // Auth failure – don't retry
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }, [token, onMessage, scheduleReconnect]);


  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      clearTimeout(retryTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);
};

export default useWebSocket;

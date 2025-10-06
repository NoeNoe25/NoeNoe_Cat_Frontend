// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(url, onMessage, onOpen, onClose) {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onOpen?.();
    };

    ws.onmessage = (event) => onMessage?.(event);

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      onClose?.();
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      ws.close();
    };
  }, [url, onMessage, onOpen, onClose]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(msg);
    } else {
      console.warn("WebSocket not connected");
    }
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, sendMessage, connect, disconnect };
}

// src/hooks/useVoskTranscription.js
import { useState, useRef, useCallback } from "react";

export function useVoskTranscription(onTranscriptUpdate) {
  const [finalTranscript, setFinalTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  const connectVosk = useCallback(() => {
    if (wsRef.current) return;
    const ws = new WebSocket("ws://localhost:2700");
    ws.binaryType = "arraybuffer";

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
    };
    ws.onerror = (err) => console.error("Vosk error:", err);
    ws.onmessage = (event) => {
      const result = JSON.parse(event.data);
      if (result.partial) {
        setPartialTranscript(result.partial);
        onTranscriptUpdate?.(finalTranscript, result.partial);
      }
      if (result.text) {
        setFinalTranscript((prev) => `${prev} ${result.text}`.trim());
        setPartialTranscript("");
        onTranscriptUpdate?.(`${finalTranscript} ${result.text}`.trim(), "");
      }
    };

    wsRef.current = ws;
  }, [onTranscriptUpdate, finalTranscript]);

  const disconnectVosk = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendToVosk = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setFinalTranscript("");
    setPartialTranscript("");
  }, []);

  return {
    finalTranscript,
    partialTranscript,
    isVoskConnected: isConnected,
    connectVosk,
    disconnectVosk,
    sendToVosk,
    resetTranscript,
  };
}

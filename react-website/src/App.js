import React, { useState, useCallback, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { useVoskTranscription } from "./hooks/useVoskTranscription";
import { useAudioRecording } from "./hooks/useAudioRecording";
import ChatMessage from "./components/ChatMessage.js";
import TranscriptMessage from "./components/TranscriptMessage.js";
import InputArea from "./components/InputArea.js";
import "./App.css";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [currentGeminiStream, setCurrentGeminiStream] = useState("");
  const [isGeminiStreaming, setIsGeminiStreaming] = useState(false);

  // ✅ Gemini WebSocket (Port 8765)
  const handleGeminiMessage = useCallback((event) => {
    const chunk = event.data;

    if (chunk === "[[END]]") {
      setIsGeminiStreaming(false);
      setCurrentGeminiStream("");
      return;
    }

    setIsGeminiStreaming(true);
    setCurrentGeminiStream((prev) => prev + chunk);
  }, []);

  const {
    isConnected: isGeminiConnected,
    sendMessage: sendToGemini,
    reconnect: reconnectGemini,
  } = useWebSocket(
    "ws://localhost:8765",
    handleGeminiMessage,
    () => console.log("✅ Connected to Gemini WebSocket on port 8765"),
    () => console.log("⚠️ Disconnected from Gemini WebSocket")
  );

  // ✅ Vosk WebSocket (Port 2700)
  const handleVoskMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.text !== undefined) {
        // Handle final transcript
        console.log("Final transcript:", data.text);
        // You'll need to integrate this with your useVoskTranscription hook
      }

      if (data.partial !== undefined) {
        // Handle partial transcript
        console.log("Partial transcript:", data.partial);
        // You'll need to integrate this with your useVoskTranscription hook
      }
    } catch (error) {
      console.error("Error parsing Vosk message:", error);
    }
  }, []);

  const {
    isConnected: isVoskConnected,
    sendMessage: sendToVosk,
    reconnect: reconnectVosk,
  } = useWebSocket(
    "ws://localhost:2700",
    handleVoskMessage,
    () => console.log("✅ Connected to Vosk WebSocket on port 2700"),
    () => console.log("⚠️ Disconnected from Vosk WebSocket")
  );

  // ✅ Vosk Transcription + Audio Recording
  const handleTranscriptUpdate = useCallback(() => {}, []);

  const {
    finalTranscript,
    partialTranscript,
    connectVosk,
    disconnectVosk,
    resetTranscript,
  } = useVoskTranscription(handleTranscriptUpdate);

  const handleAudioData = useCallback(
    (data) => {
      if (isVoskConnected) {
        sendToVosk(data);
      }
    },
    [sendToVosk, isVoskConnected]
  );

  const { isRecording, hasPermission, startRecording, stopRecording } =
    useAudioRecording(handleAudioData, () => {
      stopRecording();
      if (finalTranscript.trim()) {
        setInputValue(finalTranscript.trim());
        handleSendMessage(finalTranscript.trim());
      }
    });

  // ✅ Send Message to Gemini
  const handleSendMessage = useCallback(
    (text = null) => {
      const messageToSend = text || inputValue.trim();
      if (!messageToSend || !isGeminiConnected) return;

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "user", text: messageToSend },
      ]);

      sendToGemini(messageToSend);
      setInputValue("");
      resetTranscript();
    },
    [inputValue, isGeminiConnected, sendToGemini, resetTranscript]
  );

  // ✅ Recording toggle
  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
    } else {
      resetTranscript();
      const started = await startRecording();
      if (!started) {
        alert("Failed to start recording. Please allow microphone access.");
      }
    }
  }, [isRecording, startRecording, stopRecording, resetTranscript]);

  // ✅ Reconnect functionality
  const handleReconnectAll = useCallback(() => {
    reconnectGemini();
    reconnectVosk();
  }, [reconnectGemini, reconnectVosk]);

  // ✅ Connect to services when mounted
  useEffect(() => {
    connectVosk();
    return () => disconnectVosk();
  }, [connectVosk, disconnectVosk]);

  // ✅ Stream message updates
  useEffect(() => {
    if (isGeminiStreaming && currentGeminiStream) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.sender === "gemini" && last.isStreaming) {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, text: currentGeminiStream } : m
          );
        }
        return [
          ...prev,
          {
            id: Date.now(),
            sender: "gemini",
            text: currentGeminiStream,
            isStreaming: true,
          },
        ];
      });
    } else if (!isGeminiStreaming) {
      setMessages((prev) =>
        prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
    }
  }, [isGeminiStreaming, currentGeminiStream]);

  return (
    <div className="app">
      <h1>🐈‍⬛ CatGPT NOENOE</h1>

      {/* ✅ Connection Status */}
      <div className="connection-status">
        <span style={{ color: isGeminiConnected ? "green" : "red" }}>
          Gemini: {isGeminiConnected ? "Connected" : "Disconnected"}
        </span>
        <span
          style={{
            color: isVoskConnected ? "green" : "red",
            marginLeft: "20px",
          }}
        >
          Vosk: {isVoskConnected ? "Connected" : "Disconnected"}
        </span>
        {!hasPermission && isVoskConnected && (
          <span style={{ color: "orange", marginLeft: "20px" }}>
            Microphone permission needed
          </span>
        )}

        {/* Reconnect Button */}
        {(!isGeminiConnected || !isVoskConnected) && (
          <button
            onClick={handleReconnectAll}
            style={{ marginLeft: "20px", padding: "5px 10px" }}
          >
            Reconnect All
          </button>
        )}
      </div>

      {/* ✅ Chat Display */}
      <div id="messages" className="messages-container">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            sender={message.sender}
            message={message.text}
            isStreaming={message.isStreaming}
          />
        ))}

        {(finalTranscript || partialTranscript) && (
          <TranscriptMessage
            finalTranscript={finalTranscript}
            partialTranscript={partialTranscript}
          />
        )}
      </div>

      {/* ✅ Input Area */}
      <InputArea
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSendMessage={handleSendMessage}
        onToggleRecording={handleToggleRecording}
        isRecording={isRecording}
        isVoskConnected={isVoskConnected}
        hasAudioPermission={hasPermission}
      />
    </div>
  );
};

export default App;

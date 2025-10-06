// src/hooks/useAudioRecording.js
import { useState, useCallback, useRef } from "react";

export function useAudioRecording(onAudioData, onSilenceDetected) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const workletNodeRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setHasPermission(true);
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );
      await audioContextRef.current.audioWorklet.addModule(
        "/vosk/vosk-processor.js"
      );
      const workletNode = new AudioWorkletNode(
        audioContextRef.current,
        "vosk-processor"
      );

      workletNode.port.onmessage = (event) => {
        const { type, data } = event.data;
        if (type === "pcm") onAudioData?.(data);
        else if (type === "silence") onSilenceDetected?.();
      };

      source.connect(workletNode);
      workletNode.connect(audioContextRef.current.destination);
      workletNodeRef.current = workletNode;
      setIsRecording(true);
      return true;
    } catch (err) {
      console.error("Mic access error:", err);
      setHasPermission(false);
      return false;
    }
  }, [onAudioData, onSilenceDetected]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  }, [isRecording]);

  return { isRecording, hasPermission, startRecording, stopRecording };
}

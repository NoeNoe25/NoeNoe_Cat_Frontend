// // chat.js
// const messagesDiv = document.getElementById("messages");
// const inputField = document.getElementById("input");
// const sendButton = document.getElementById("sendButton");
// const micButton = document.getElementById("micButton");
// const geminiStatusDiv = document.getElementById("geminiStatus");

// let wsVosk, mediaStream, audioContext, workletNode;
// let finalTranscript = "";
// let recording = false; // Single source of truth for recording state

// // Function to update the status display
// const updateGeminiStatus = (status, color = "black") => {
//   if (geminiStatusDiv) {
//     geminiStatusDiv.textContent = `Gemini Server Status: ${status}`;
//     geminiStatusDiv.style.color = color;
//   }
// };

// // Gemini WS
// const wsGemini = new WebSocket("ws://localhost:8765");
// let currentGeminiMessageElement = null;

// // Add connection handlers
// wsGemini.onopen = () => {
//   console.log("Gemini WS Connected");
//   updateGeminiStatus("Connected", "green");
// };

// wsGemini.onclose = () => {
//   console.log("Gemini WS Disconnected");
//   updateGeminiStatus("Disconnected", "red");
// };

// wsGemini.onerror = (error) => {
//   console.error("Gemini WS Error:", error);
//   updateGeminiStatus("Error", "red");
// };

// // Set initial status
// if (wsGemini.readyState === WebSocket.CONNECTING) {
//   updateGeminiStatus("Connecting...", "orange");
// } else if (wsGemini.readyState === WebSocket.OPEN) {
//   updateGeminiStatus("Connected", "green");
// }

// // wsGemini.onmessage = (event) => {
// //   const chunk = event.data;
// //   // ... (rest of wsGemini.onmessage is unchanged)
// //   if (chunk === "[[END]]") {
// //     currentGeminiMessageElement = null;
// //     messagesDiv.scrollTop = messagesDiv.scrollHeight;
// //     return;
// //   }
// //   if (!currentGeminiMessageElement) {
// //     currentGeminiMessageElement = document.createElement("div");
// //     currentGeminiMessageElement.classList.add("message", "gemini-message");
// //     currentGeminiMessageElement.innerHTML =
// //       "<b>Gemini:</b> <span class='stream-text'></span>";
// //     messagesDiv.appendChild(currentGeminiMessageElement);
// //   }
// //   const streamText = currentGeminiMessageElement.querySelector(".stream-text");
// //   if (streamText) streamText.textContent += chunk;
// //   messagesDiv.scrollTop = messagesDiv.scrollHeight;
// // };

// // let audioQueue = [];
// // let isPlayingAudio = false;

// // async function processAudioQueue() {
// //   if (isPlayingAudio || audioQueue.length === 0) return;

// //   isPlayingAudio = true;
// //   const audioUrl = audioQueue.shift();

// //   try {
// //     const audio = new Audio(audioUrl);
// //     await audio.play();
// //     audio.onended = () => {
// //       URL.revokeObjectURL(audioUrl);
// //       isPlayingAudio = false;
// //       processAudioQueue();
// //     };
// //   } catch (err) {
// //     console.error("Audio playback error:", err);
// //     isPlayingAudio = false;
// //     processAudioQueue();
// //   }
// // }

// // wsGemini.onmessage = async (event) => {
// //   const chunk = event.data;

// //   if (chunk === "[[END]]") {
// //     currentGeminiMessageElement = null;
// //     messagesDiv.scrollTop = messagesDiv.scrollHeight;
// //     return;
// //   }

// //   // Handle audio data
// //   if (chunk.startsWith("AUDIO::")) {
// //     try {
// //       const audioB64 = chunk.substring(7);
// //       const audioBytes = Uint8Array.from(atob(audioB64), (c) =>
// //         c.charCodeAt(0)
// //       );
// //       const audioBlob = new Blob([audioBytes], { type: "audio/mpeg" });
// //       const audioUrl = URL.createObjectURL(audioBlob);

// //       audioQueue.push(audioUrl);
// //       processAudioQueue();
// //     } catch (err) {
// //       console.error("Audio processing error:", err);
// //     }
// //     return;
// //   }

// //   // Handle text data
// //   if (!currentGeminiMessageElement) {
// //     currentGeminiMessageElement = document.createElement("div");
// //     currentGeminiMessageElement.classList.add("message", "gemini-message");
// //     currentGeminiMessageElement.innerHTML =
// //       "<b>Gemini:</b> <span class='stream-text'></span>";
// //     messagesDiv.appendChild(currentGeminiMessageElement);
// //   }

// //   const streamText = currentGeminiMessageElement.querySelector(".stream-text");
// //   if (streamText) streamText.textContent += chunk;
// //   messagesDiv.scrollTop = messagesDiv.scrollHeight;
// // };

// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// let audioQueue = Promise.resolve(); // ensures sequential playback

// wsGemini.onmessage = (event) => {
//   const chunk = event.data;

//   if (chunk === "[[END]]") {
//     currentGeminiMessageElement = null;
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//     return;
//   }

//   if (chunk.startsWith("AUDIO::")) {
//     const audioB64 = chunk.substring(7);
//     const audioBytes = Uint8Array.from(atob(audioB64), (c) => c.charCodeAt(0));
//     const audioBlob = new Blob([audioBytes], { type: "audio/mpeg" });

//     // Queue playback to preserve order
//     audioQueue = audioQueue.then(async () => {
//       try {
//         const arrayBuffer = await audioBlob.arrayBuffer();
//         const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
//         const source = audioCtx.createBufferSource();
//         source.buffer = audioBuffer;
//         source.connect(audioCtx.destination);
//         source.start();
//         await new Promise((resolve) => {
//           source.onended = resolve;
//         });
//       } catch (err) {
//         console.error("Audio playback error:", err);
//       }
//     });

//     return;
//   }

//   // Handle text
//   if (!currentGeminiMessageElement) {
//     currentGeminiMessageElement = document.createElement("div");
//     currentGeminiMessageElement.classList.add("message", "gemini-message");
//     currentGeminiMessageElement.innerHTML =
//       "<b>Gemini:</b> <span class='stream-text'></span>";
//     messagesDiv.appendChild(currentGeminiMessageElement);
//   }

//   const streamText = currentGeminiMessageElement.querySelector(".stream-text");
//   if (streamText) streamText.textContent += chunk;
//   messagesDiv.scrollTop = messagesDiv.scrollHeight;
// };

// // Text message send
// const sendMessage = () => {
//   // ... (rest of sendMessage is unchanged)
//   const message = inputField.value.trim();
//   if (message && wsGemini.readyState === WebSocket.OPEN) {
//     let userDiv = document.createElement("div");
//     userDiv.classList.add("message", "user-message");
//     userDiv.innerHTML = "<b>You:</b> " + message;
//     messagesDiv.appendChild(userDiv);
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;

//     currentGeminiMessageElement = null;
//     wsGemini.send(message);
//     inputField.value = "";
//   }
// };
// sendButton.onclick = sendMessage;
// inputField.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") sendMessage();
// });

// // Mic button handler (Single Source of Truth)
// micButton.onclick = async () => {
//   // ... (rest of micButton.onclick is unchanged)
//   // Ensure AudioContext is resumed/started on user interaction
//   if (audioContext && audioContext.state === "suspended") {
//     audioContext.resume();
//   }

//   if (!recording) {
//     micButton.textContent = "⏹ Stop";
//     recording = true;
//     finalTranscript = "";
//     try {
//       await startRecording();
//     } catch (e) {
//       // If startRecording fails (e.g., mic access denied), reset the button state
//       stopRecording(false);
//       console.error("Start recording failed:", e);
//     }
//   } else {
//     // Manually stopped by user
//     stopRecording(true);
//   }
// };

// // startRecording
// async function startRecording() {
//   // ... (rest of startRecording is unchanged)
//   // Ensure we stop if the process is already running or being called again accidentally
//   if (wsVosk || workletNode) stopRecording(false);

//   mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   audioContext = new AudioContext({ sampleRate: 16000 });
//   const source = audioContext.createMediaStreamSource(mediaStream);

//   // 1. Load AudioWorklet module
//   await audioContext.audioWorklet.addModule("vosk-processor.js");

//   // 2. Create AudioWorklet node
//   workletNode = new AudioWorkletNode(audioContext, "vosk-processor");

//   // 3. Vosk WebSocket
//   wsVosk = new WebSocket("ws://localhost:2700");
//   wsVosk.binaryType = "arraybuffer";

//   wsVosk.onopen = () => {
//     console.log("Vosk WS Connected");
//   };

//   wsVosk.onclose = () => {
//     // If the server closes, clean up resources (but don't auto-send the transcript)
//     if (recording) stopRecording(false);
//   };

//   wsVosk.onerror = (error) => {
//     console.error("Vosk WS Error:", error);
//     if (recording) stopRecording(false);
//   };

//   // 4. Handle messages from the Worklet thread
//   workletNode.port.onmessage = (event) => {
//     const { type, data } = event.data;

//     if (type === "pcm") {
//       // Audio data ready to send to Vosk
//       if (wsVosk && wsVosk.readyState === WebSocket.OPEN) wsVosk.send(data);
//     } else if (type === "silence") {
//       // Silence detected by Worklet - Auto-stop
//       stopRecording(true);
//     }
//   };

//   // 5. Vosk Reply Handler
//   wsVosk.onmessage = (event) => {
//     const result = JSON.parse(event.data);
//     let transcriptDiv = document.getElementById("transcript-msg");

//     if (!transcriptDiv) {
//       transcriptDiv = document.createElement("div");
//       transcriptDiv.id = "transcript-msg";
//       transcriptDiv.classList.add("message", "transcript-message");
//       transcriptDiv.innerHTML = "<b>Voice:</b> <span id='voice-text'></span>";
//       messagesDiv.appendChild(transcriptDiv);
//     }

//     const voiceText = transcriptDiv.querySelector("#voice-text");

//     if (result.partial) {
//       voiceText.textContent = finalTranscript.trim() + " " + result.partial;
//     } else if (result.text) {
//       finalTranscript += " " + result.text;
//       voiceText.textContent = finalTranscript.trim();
//     }

//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   };

//   // 6. Connect Nodes
//   source.connect(workletNode);
//   workletNode.connect(audioContext.destination);
// }

// /**
//  * Stops recording and cleans up resources.
//  * @param {boolean} [shouldSend=true] - Whether to automatically send the final transcript to Gemini.
//  */
// function stopRecording(shouldSend = true) {
//   if (!recording) return;

//   // 1. Update State (Single Source of Truth)
//   recording = false;
//   micButton.textContent = "🎤 Start";

//   // 2. Clean up Web Audio resources and null out references
//   if (workletNode) {
//     workletNode.disconnect();
//     workletNode = null;
//   }
//   if (audioContext) {
//     audioContext.close();
//     audioContext = null;
//   }
//   if (mediaStream) {
//     mediaStream.getTracks().forEach((t) => t.stop());
//     mediaStream = null;
//   }

//   // 3. Close WebSocket and null out reference
//   if (wsVosk) {
//     if (wsVosk.readyState === WebSocket.OPEN) wsVosk.close();
//     wsVosk = null;
//   }

//   // 4. Auto-send final transcript to Gemini if requested
//   const trimmedTranscript = finalTranscript.trim();
//   if (
//     shouldSend &&
//     trimmedTranscript &&
//     wsGemini.readyState === WebSocket.OPEN
//   ) {
//     inputField.value = trimmedTranscript;
//     sendMessage();
//   }

//   // 5. Clean up the temporary transcript element
//   const transcriptDiv = document.getElementById("transcript-msg");
//   if (transcriptDiv) transcriptDiv.remove();

//   // 6. Reset transcript buffer
//   finalTranscript = "";
// }

// chat.js
const messagesDiv = document.getElementById("messages");
const inputField = document.getElementById("input");
const sendButton = document.getElementById("sendButton");
const micButton = document.getElementById("micButton");
const geminiStatusDiv = document.getElementById("geminiStatus");

let wsVosk, mediaStream, audioContext, workletNode;
let finalTranscript = "";
let recording = false; // Single source of truth

// Function to update the status display
const updateGeminiStatus = (status, color = "black") => {
  if (geminiStatusDiv) {
    geminiStatusDiv.textContent = `Gemini Server Status: ${status}`;
    geminiStatusDiv.style.color = color;
  }
};

// --- Gemini WS ---
const wsGemini = new WebSocket("ws://localhost:8765");
let currentGeminiMessageElement = null;

wsGemini.onopen = () => {
  console.log("✅ Gemini WS Connected");
  updateGeminiStatus("Connected", "green");
};

wsGemini.onclose = () => {
  console.log("❌ Gemini WS Disconnected");
  updateGeminiStatus("Disconnected", "red");
};

wsGemini.onerror = (err) => {
  console.error("⚠️ Gemini WS Error:", err);
  updateGeminiStatus("Error", "red");
};

// Sequential audio playback using promises
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioQueue = Promise.resolve();

// Handle Gemini messages (text + audio)
wsGemini.onmessage = (event) => {
  const chunk = event.data;

  if (chunk === "[[END]]") {
    currentGeminiMessageElement = null;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return;
  }

  // AUDIO chunk
  if (chunk.startsWith("AUDIO::")) {
    const audioB64 = chunk.substring(7);
    const audioBytes = Uint8Array.from(atob(audioB64), (c) => c.charCodeAt(0));
    const audioBlob = new Blob([audioBytes], { type: "audio/mpeg" });

    // Queue playback
    audioQueue = audioQueue.then(async () => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        await new Promise((resolve) => (source.onended = resolve));
      } catch (err) {
        console.error("Audio playback error:", err);
      }
    });

    return;
  }

  // TEXT chunk
  if (!currentGeminiMessageElement) {
    currentGeminiMessageElement = document.createElement("div");
    currentGeminiMessageElement.classList.add("message", "gemini-message");
    currentGeminiMessageElement.innerHTML =
      "<b>Gemini:</b> <span class='stream-text'></span>";
    messagesDiv.appendChild(currentGeminiMessageElement);
  }

  const streamText = currentGeminiMessageElement.querySelector(".stream-text");
  if (streamText) streamText.textContent += chunk;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// --- Send text message ---
const sendMessage = () => {
  const message = inputField.value.trim();
  if (!message || wsGemini.readyState !== WebSocket.OPEN) return;

  const userDiv = document.createElement("div");
  userDiv.classList.add("message", "user-message");
  userDiv.innerHTML = "<b>You:</b> " + message;
  messagesDiv.appendChild(userDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  currentGeminiMessageElement = null;
  wsGemini.send(message);
  inputField.value = "";
};

sendButton.onclick = sendMessage;
inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// --- Mic button handler ---
micButton.onclick = async () => {
  if (audioContext && audioContext.state === "suspended")
    await audioContext.resume();

  if (!recording) {
    micButton.textContent = "⏹ Stop";
    recording = true;
    finalTranscript = "";
    try {
      await startRecording();
    } catch (e) {
      stopRecording(false);
      console.error("Start recording failed:", e);
    }
  } else {
    stopRecording(true);
  }
};

// --- Start recording ---
async function startRecording() {
  if (wsVosk || workletNode) stopRecording(false);

  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new AudioContext({ sampleRate: 16000 });
  const source = audioContext.createMediaStreamSource(mediaStream);

  await audioContext.audioWorklet.addModule("vosk-processor.js");
  workletNode = new AudioWorkletNode(audioContext, "vosk-processor");

  wsVosk = new WebSocket("ws://localhost:2700");
  wsVosk.binaryType = "arraybuffer";

  wsVosk.onopen = () => console.log("✅ Vosk WS Connected");
  wsVosk.onclose = () => {
    console.log("❌ Vosk WS Disconnected");
    if (recording) stopRecording(false);
  };
  wsVosk.onerror = (err) => {
    console.error("⚠️ Vosk WS Error:", err);
    if (recording) stopRecording(false);
  };

  // Handle PCM & silence
  workletNode.port.onmessage = (event) => {
    const { type, data } = event.data;
    if (type === "pcm" && wsVosk && wsVosk.readyState === WebSocket.OPEN)
      wsVosk.send(data);
    if (type === "silence") stopRecording(true);
  };

  // Handle Vosk transcription
  wsVosk.onmessage = (event) => {
    const result = JSON.parse(event.data);
    let transcriptDiv = document.getElementById("transcript-msg");

    if (!transcriptDiv) {
      transcriptDiv = document.createElement("div");
      transcriptDiv.id = "transcript-msg";
      transcriptDiv.classList.add("message", "transcript-message");
      transcriptDiv.innerHTML = "<b>Voice:</b> <span id='voice-text'></span>";
      messagesDiv.appendChild(transcriptDiv);
    }

    const voiceText = transcriptDiv.querySelector("#voice-text");

    if (result.partial)
      voiceText.textContent = finalTranscript.trim() + " " + result.partial;
    if (result.text) {
      finalTranscript += " " + result.text;
      voiceText.textContent = finalTranscript.trim();
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };

  source.connect(workletNode);
  workletNode.connect(audioContext.destination);
}

// --- Stop recording ---
function stopRecording(shouldSend = true) {
  if (!recording) return;
  recording = false;
  micButton.textContent = "🎤 Start";

  if (workletNode) {
    workletNode.disconnect();
    workletNode = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }

  if (wsVosk) {
    if (wsVosk.readyState === WebSocket.OPEN) wsVosk.close();
    wsVosk = null;
  }

  if (
    shouldSend &&
    finalTranscript.trim() &&
    wsGemini.readyState === WebSocket.OPEN
  ) {
    inputField.value = finalTranscript.trim();
    sendMessage();
  }

  const transcriptDiv = document.getElementById("transcript-msg");
  if (transcriptDiv) transcriptDiv.remove();
  finalTranscript = "";
}

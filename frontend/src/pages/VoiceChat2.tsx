import React, { useState, useRef, useEffect } from "react";
import { LettaClient } from "@letta-ai/letta-client";
import './VoiceChat2.css';
import ReactMarkdown from 'react-markdown';

// Configuration constants
const SILENCE_THRESHOLD = 0.01; // Adjust based on your testing
const SILENCE_DURATION_MS = 3000; // 3 seconds of silence triggers stop
const LOCAL_WHISPER_ENDPOINT = "http://localhost:8000/transcribe"; // Your local Whisper endpoint URL
const LETTA_AGENT_ID = "agent-ae19d2d6-72fe-4dcf-b756-fc5005ed7043";
const LETTA_TOKEN = "OTEyZDc0OWUtMzVkZi00NmI2LThlOGItNzQ3YzQ0NGQ5NWYzOjBhMjNlMjhiLTQyMWUtNDZkMy1hODM2LTEyNzA3ZWI4OWFhMQ==";

const VoiceChat: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [agentResponse, setAgentResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Refs for audio recording and visualization
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Start recording and set up visualization/silence monitoring
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setRecording(true);
      audioChunksRef.current = [];

      // Set up MediaRecorder with explicit mime type and configuration
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Recorded chunk: ${event.data.size} bytes`);
        }
      };

      // Request data more frequently
      mediaRecorder.start(1000); // Get data every second instead of waiting until stop

      // Set up AudioContext for waveform visualization and silence detection
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;

      drawAndMonitor();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  // Stop recording and clean up
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    processAudio();
  };

  // Combined loop: draw waveform and monitor audio level for silence
  const drawAndMonitor = () => {
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    const canvas = canvasRef.current;
    if (!analyser || !dataArray || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;

    // Get waveform data
    analyser.getByteTimeDomainData(dataArray);

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Draw waveform (common sound wave visualization)
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#007bff";
    ctx.beginPath();
    const sliceWidth = width / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      // dataArray values range from 0 to 255; normalize to [0, 2] then scale
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Calculate RMS (root mean square) for silence detection
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] - 128) / 128; // Normalize to [-1, 1]
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    if (rms < SILENCE_THRESHOLD) {
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = window.setTimeout(() => {
          stopRecording();
        }, SILENCE_DURATION_MS);
      }
    } else {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    }
    animationFrameIdRef.current = requestAnimationFrame(drawAndMonitor);
  };

  // Process the recorded audio by sending it to Whisper for transcription
  const processAudio = async () => {
    setIsProcessing(true);
    setError(null);
    
    console.log(`Processing ${audioChunksRef.current.length} audio chunks`);
  
    if (audioChunksRef.current.length === 0) {
      console.error("No audio recorded");
      return;
    }
    
    const totalBytes = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
    console.log(`Total audio size: ${totalBytes} bytes`);
    
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    
    try {
      console.log("Sending audio to Whisper service...");
      
      const res = await fetch(LOCAL_WHISPER_ENDPOINT, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Whisper service error (${res.status}): ${errorText}`);
        throw new Error(`Transcription failed: ${res.status} ${errorText}`);
      }
      
      const result = await res.json();
      console.log("Transcription result:", result);
      
      const text = result.transcription || "";
      setTranscription(text);
      
      if (text.trim()) {
        await sendToLetta(text);
      } else {
        console.warn("Empty transcription, not sending to Letta");
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this function to extract guides from Letta responses
  const extractGuideFromResponse = (response: any) => {
    if (!response || !response.messages) return null;
    
    // Look for responses with tool_call containing guide_generator
    const hasGuideGenerator = response.messages.some((msg: any) => 
      msg.message_type === "tool_call_message" && 
      msg.tool_call?.name === "guide_generator"
    );
    
    // Find assistant messages with markdown content
    const assistantMessages = response.messages.filter((msg: any) => 
      msg.message_type === "assistant_message" && 
      msg.content
    );
    
    // Check the latest assistant message for markdown content
    if (assistantMessages.length > 0) {
      const latestMessage = assistantMessages[assistantMessages.length - 1];
      if (latestMessage.content.includes('```markdown') || hasGuideGenerator) {
        return latestMessage.content;
      }
    }
    
    return null;
  };

  // Update the sendToLetta function to separate normal text from markdown content

  const extractTextBeforeMarkdown = (content: string): string => {
    // Find the index of the first markdown code block
    const markdownIndex = content.indexOf('```markdown');
    
    if (markdownIndex === -1) {
      // No markdown found, return the full content
      return content;
    }
    
    // Return only the text before the markdown
    return content.substring(0, markdownIndex).trim();
  };

  const sendToLetta = async (text: string) => {
    try {
      console.log("Sending to Letta:", text);
      setIsProcessing(true);
      
      const response = await fetch(`http://localhost:8000/proxy/letta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: text
                }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Letta API error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Letta response:", result);
      
      // Find the assistant message
      if (result.messages && result.messages.length > 0) {
        // Look specifically for assistant_message type
        const assistantMessage = result.messages.find(
          (msg: any) => msg.message_type === "assistant_message"
        );
        
        if (assistantMessage && assistantMessage.content) {
          const fullContent = assistantMessage.content;
          
          // Check if the response contains a guide/markdown
          const hasMarkdown = fullContent.includes('```markdown');
          
          if (hasMarkdown) {
            // Extract just the text before the markdown for display in chat
            const textBeforeMarkdown = extractTextBeforeMarkdown(fullContent);
            
            // Set the text-only part for the chat message
            setAgentResponse(textBeforeMarkdown);
            
            // Use the text-only part for TTS
            speakResponse(textBeforeMarkdown);
            
            // Set the full content including markdown as the guide
            setGuide(fullContent);
            setShowGuide(true);
          } else {
            // No markdown found, use the full content for chat and TTS
            setAgentResponse(fullContent);
            speakResponse(fullContent);
          }
        } else {
          console.warn("No assistant message found in response");
        }
      } else {
        console.warn("No messages in response");
      }
    } catch (error) {
      console.error("Error sending message to Letta:", error);
      setError(error instanceof Error ? error.message : "Unknown error with Letta API");
    } finally {
      setIsProcessing(false);
    }
  };

  // Replace the speakResponse function:
  const speakResponse = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Detect language (simple heuristic)
      let lang = "en";
      if (text.match(/[áéíóúüñ¿¡]/i)) {
        lang = "es"; // Spanish
      } else if (text.match(/[ăâêôơưđ]/i)) {
        lang = "vi"; // Vietnamese
      }
      
      console.log(`Speaking in ${lang}: ${text}`);
      
      // Call backend TTS service
      const response = await fetch(`http://localhost:8000/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: text,
          lang: lang
        })
      });
      
      if (!response.ok) {
        throw new Error(`TTS service error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Play the audio with an event for tracking completion
      const audio = new Audio(`data:audio/wav;base64,${result.audio}`);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
      
    } catch (error) {
      console.error("Error with TTS service:", error);
      setIsSpeaking(false);
      // Fall back to browser's TTS as backup
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        if (text.match(/[áéíóúüñ¿¡]/i)) {
          utterance.lang = 'es-ES';
        } else {
          utterance.lang = 'en-US';
        }
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="app-container">
      {/* Your existing voice chat UI */}
      <div className="voice-chat-container">
        <h1>Immigrant Assistance Voice Assistant</h1>
        
        <div className="chat-area">
          {/* User's transcribed message */}
          {transcription && (
            <div className="message user-message">
              <div className="avatar">
                <span>You</span>
              </div>
              <div className="bubble">
                {transcription}
              </div>
            </div>
          )}
          
          {/* AI response message */}
          {agentResponse && (
            <div className="message ai-message">
              <div className="avatar">
                <span>AI</span>
              </div>
              <div className="bubble">
                {agentResponse}
              </div>
            </div>
          )}
          
          {/* Recording/Processing indicator */}
          {recording && (
            <div className="status-indicator recording">
              <div className="pulse"></div>
              <span>Listening...</span>
            </div>
          )}
          
          {isProcessing && (
            <div className="status-indicator processing">
              <div className="spinner"></div>
              <span>Processing...</span>
            </div>
          )}
          
          {isSpeaking && (
            <div className="status-indicator speaking">
              <div className="sound-wave"></div>
              <span>Speaking...</span>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
        
        <div className="controls">
          <button 
            className={recording ? "recording" : ""}
            onClick={recording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            {recording ? "Stop" : "Start Speaking"}
          </button>
        </div>
        
        {/* Visualization canvas */}
        <canvas 
          ref={canvasRef} 
          className="audio-visualizer"
          width="800" 
          height="200"
        />
      </div>
      
      {/* Guide panel */}
      <div className="guide-panel">
        {!showGuide ? (
          <div className="guide-invitation">
            <h3>Need help with government programs?</h3>
            <p>Ask me for a guide on how to apply for government assistance programs like:</p>
            <ul>
              <li>SNAP/Food Stamps</li>
              <li>Medicaid/Health Insurance</li>
              <li>Housing Assistance</li>
              <li>Cash Aid Programs</li>
            </ul>
            <p className="suggestion-prompt">Try saying: <em>"Can you provide a guide for applying to government assistance programs?"</em></p>
          </div>
        ) : (
          <div className="guide-content">
            <h3>Guide to Government Programs</h3>
            <button className="close-guide" onClick={() => setShowGuide(false)}>×</button>
            <div className="markdown-content">
              <ReactMarkdown>
                {guide ? guide.replace(/```markdown|```/g, '') : ''}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
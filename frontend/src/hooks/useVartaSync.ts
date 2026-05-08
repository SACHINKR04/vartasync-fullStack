"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { WSEventType, type TranscriptEntry, type ScoreUpdate, type ObjectionStatus, type CallSummary, type WSMessage } from "@/types";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

interface UseVartaSyncReturn {
  isConnected: boolean;
  isCallActive: boolean;
  transcript: TranscriptEntry[];
  score: number;
  category: "hot" | "warm" | "cold";
  objections: ObjectionStatus;
  callSummary: CallSummary | null;
  handoffTriggered: boolean;
  whatsappStatus: { status: string; to: string } | null;
  detectedLanguage: string;
  startCall: (leadId: number) => void;
  endCall: () => void;
  sendMessage: (text: string) => void;
  sendInterrupt: () => void;
}

export function useVartaSync(): UseVartaSyncReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Track Sarvam TTS audio for barge-in
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [score, setScore] = useState(30);
  const [category, setCategory] = useState<"hot" | "warm" | "cold">("cold");
  const [objections, setObjections] = useState<ObjectionStatus>({
    existing_broker: false,
    no_contacts: false,
    support_concern: false,
    trust: false,
    delay: false,
  });
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [handoffTriggered, setHandoffTriggered] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<{ status: string; to: string } | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState("auto");

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WSMessage = JSON.parse(event.data);

      switch (data.event) {
        case WSEventType.TRANSCRIPT_USER:
          setTranscript((prev) => [
            ...prev,
            { speaker: "user", text: data.text as string, timestamp: Date.now() },
          ]);
          break;

        case WSEventType.TRANSCRIPT_AGENT:
          setTranscript((prev) => [
            ...prev,
            { speaker: "agent", text: data.text as string, timestamp: Date.now() },
          ]);
          // Store the AI's text to prevent it from triggering barge-in on itself
          (window as any)._agentLastText = (data.text as string).toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, '');
          break;

        case "audio_response":
          // Play Sarvam TTS audio from backend
          if (data.audio) {
            // Stop any currently playing audio first
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            const audio = new Audio("data:audio/wav;base64," + data.audio);
            audioRef.current = audio;
            
            // Prevent mic from picking up the agent's voice (infinite loop)
            (window as any)._isSpeakingRef = true;
            
            audio.onended = () => { 
              audioRef.current = null; 
              setTimeout(() => {
                (window as any)._isSpeakingRef = false;
              }, 500); // 500ms delay to let echo fade
            };
            audio.play().catch((err) => {
              console.error("[Sarvam TTS] Play error:", err);
              (window as any)._isSpeakingRef = false;
            });
            console.log("[Sarvam TTS] Playing agent audio");
          }
          break;

        case WSEventType.SCORE_UPDATE:
          setScore(data.score as number);
          setCategory(data.category as "hot" | "warm" | "cold");
          break;

        case WSEventType.OBJECTION_DETECTED:
          console.log("[useVartaSync] WSEventType.OBJECTION_DETECTED received for:", data.objection_id);
          setObjections((prev) => ({
            ...prev,
            [data.objection_id as string]: true,
          }));
          break;

        case WSEventType.HANDOFF_TRIGGERED:
          setHandoffTriggered(true);
          break;

        case WSEventType.CALL_SUMMARY:
          setCallSummary((data.data as unknown) as CallSummary);
          setIsCallActive(false);
          break;

        case WSEventType.WHATSAPP_SENT:
          if (data.data) {
            setWhatsappStatus(data.data as { status: string; to: string });
            console.log("WhatsApp message sent:", data.data);
          }
          break;

        case WSEventType.STOP_PLAYBACK:
          // Barge-in: stop Sarvam TTS audio immediately
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
            console.log("[Sarvam TTS] Barge-in — audio stopped");
          }
          window.dispatchEvent(new CustomEvent("vartasync:stop_playback"));
          break;

        case WSEventType.ERROR:
          console.error("VartaSync error:", data.message);
          break;
      }
    } catch (err) {
      console.error("Failed to parse WebSocket message:", err);
    }
  }, []);

  const startCall = useCallback(
    (leadId: number) => {
      // Reset state
      setTranscript([]);
      setScore(30);
      setCategory("cold");
      setObjections({
        existing_broker: false,
        no_contacts: false,
        support_concern: false,
        trust: false,
        delay: false,
      });
      setCallSummary(null);
      setHandoffTriggered(false);

      const ws = new WebSocket(`${WS_BASE_URL}/ws/call/${leadId}`);

      ws.onopen = () => {
        setIsConnected(true);
        setIsCallActive(true);
        console.log("📞 WebSocket connected");
      };

      ws.onmessage = handleMessage;

      ws.onclose = () => {
        setIsConnected(false);
        console.log("📴 WebSocket disconnected");
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setIsConnected(false);
      };

      wsRef.current = ws;
    },
    [handleMessage]
  );

  const endCall = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: WSEventType.END_CALL }));
    }
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: WSEventType.USER_TEXT, text })
      );
    }
  }, []);

  const sendInterrupt = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: WSEventType.INTERRUPT, timestamp: Date.now() })
      );
    }
  }, []);

  // Setup global barge-in listener map to send an interrupt over the websocket
  useEffect(() => {
    const handleBargeIn = () => {
      sendInterrupt();
    };
    window.addEventListener("vartasync:barge_in", handleBargeIn);
    return () => {
      window.removeEventListener("vartasync:barge_in", handleBargeIn);
    };
  }, [sendInterrupt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isCallActive,
    transcript,
    score,
    category,
    objections,
    callSummary,
    handoffTriggered,
    whatsappStatus,
    detectedLanguage,
    startCall,
    endCall,
    sendMessage,
    sendInterrupt,
  };
}

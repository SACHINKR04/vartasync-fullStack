"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * useVoice — Browser-native STT + TTS via Web Speech API
 * ========================================================
 * - STT: SpeechRecognition (Chrome/Edge) — continuous, multilingual
 * - TTS: SpeechSynthesis — auto-speaks agent responses
 * - No API keys needed. Works offline for TTS.
 */

interface UseVoiceOptions {
  language?: string;           // BCP-47 tag: "hi-IN", "en-IN", "ta-IN"
  continuous?: boolean;        // Keep listening after each result
  autoSpeak?: boolean;         // Automatically speak agent responses
  onTranscript?: (text: string, isFinal: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
  manualSend?: boolean;        // If true, accumulate text and don't auto-send on final
  onAccumulatedText?: (text: string) => void; // Callback with all accumulated text
}

// Map our language codes to BCP-47 for Web Speech API
const LANG_MAP: Record<string, string> = {
  hindi: "hi-IN",
  english: "en-IN",
  hinglish: "hi-IN",  // Hinglish works best with Hindi recognition
  kannada: "kn-IN",
};

// TTS voice preferences by language
const TTS_LANG_MAP: Record<string, string> = {
  hindi: "hi-IN",
  english: "en-IN",
  hinglish: "hi-IN",
  kannada: "kn-IN",
};

export function useVoice(options: UseVoiceOptions = {}) {
  const {
    language = "hinglish",
    continuous = true,
    autoSpeak = true,
    onTranscript,
    onListeningChange,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<any | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);
  const cachedVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const accumulatedTextRef = useRef<string>(""); // Accumulate all final transcripts
  const flushTimerRef = useRef<number | null>(null); // Flush after short silence in continuous mode

  const flushAccumulatedTranscript = useCallback(() => {
    const accumulated = accumulatedTextRef.current.trim();
    if (!accumulated) return;
    onTranscript?.(accumulated, true);
    accumulatedTextRef.current = "";
    console.log("[VartaSync STT] Sent accumulated text:", accumulated.slice(0, 50));
  }, [onTranscript]);

  // Check browser support & preload voices
  useEffect(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    synthRef.current = window.speechSynthesis || null;

    // Voices load asynchronously in Chrome — must listen for the event
    const loadVoices = () => {
      if (synthRef.current) {
        const voices = synthRef.current.getVoices();
        cachedVoicesRef.current = voices;
        voicesLoadedRef.current = voices.length > 0;
        console.log(`[VartaSync TTS] Loaded ${voices.length} voices:`,
          voices.map(v => `${v.name} (${v.lang})`).slice(0, 10)
        );
      }
    };

    loadVoices(); // Try immediately
    if (synthRef.current) {
      synthRef.current.onvoiceschanged = loadVoices; // Chrome fires this async
    }

    return () => {
      if (synthRef.current) synthRef.current.onvoiceschanged = null;
    };
  }, []);

  // Listen for backend barge-in signal (STOP_PLAYBACK → cancel TTS)
  useEffect(() => {
    const handleStopPlayback = () => {
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
    };
    window.addEventListener("vartasync:stop_playback", handleStopPlayback);
    return () => window.removeEventListener("vartasync:stop_playback", handleStopPlayback);
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
    recognition.lang = LANG_MAP[language] || "hi-IN";
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // If user starts speaking while AI is speaking -> TRIGGER BARGE-IN
      // We must avoid the "echo" problem where the mic hears the AI's own voice.
      if ((window as any)._isSpeakingRef) {
        const spokenText = (interimTranscript + finalTranscript).toLowerCase().replace(/[^\w\s\u0900-\u097F]/g, '').trim();
        const aiText = ((window as any)._agentLastText || "");
        
        // Only interrupt if the user's speech is NOT a subset of what the AI is currently saying.
        // If the AI is saying "नमस्ते मैं पूजा हूँ", and mic hears "नमस्ते मैं" -> It's an echo.
        // If mic hears "हेलो मेरा नाम" -> It's the user.
        const isEcho = spokenText.length > 0 && aiText.includes(spokenText);

        if (!isEcho && spokenText.length > 2) {
          // Dispatch an event so useVartaSync can send an INTERRUPT through websocket
          window.dispatchEvent(new CustomEvent("vartasync:barge_in"));
          // Immediately flip the flag so we don't block the user's speech!
          (window as any)._isSpeakingRef = false;
          // Also update local state so parent component knows speaking stopped
          setIsSpeaking(false);
        } else {
          // It's an echo or too short, safely ignore it and prevent rendering on screen
          setInterimText("");
          return;
        }
      }

      if (interimTranscript) {
        setInterimText(interimTranscript);
        // Send interim to parent for display (not to backend yet)
        onTranscript?.(interimTranscript, false);
      }

      if (finalTranscript) {
        setInterimText("");
        // Accumulate final text instead of sending immediately
        // This prevents splitting into multiple messages on pauses
        accumulatedTextRef.current += " " + finalTranscript.trim();
        // In continuous mode, onend may not fire for a long time.
        // Flush shortly after the latest finalized segment.
        if (flushTimerRef.current !== null) {
          window.clearTimeout(flushTimerRef.current);
        }
        flushTimerRef.current = window.setTimeout(() => {
          flushAccumulatedTranscript();
          flushTimerRef.current = null;
        }, 700);
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
      onListeningChange?.(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListeningChange?.(false);

      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      // Flush any pending finalized text on recognition end.
      flushAccumulatedTranscript();
      
      // Auto-restart if continuous mode AND we are not currently speaking
      // (isSpeaking check prevents the mic from restarting while TTS is playing)
      if (continuous && !(window as any)._isSpeakingRef) {
        // Small delay to avoid rapid restart loops and let browser settle
        setTimeout(() => {
          // Create fresh recognition instance for restart
          const newRecognition = initRecognition();
          if (newRecognition) {
            recognitionRef.current = newRecognition;
            try {
              newRecognition.start();
              console.log("[VartaSync STT] Auto-restarted after onend");
            } catch (err) {
              console.warn("[VartaSync STT] Auto-restart failed:", err);
            }
          }
        }, 300); // 300ms delay before restart
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      
      // Handle specific errors
      if (event.error === "not-allowed") {
        setIsListening(false);
        onListeningChange?.(false);
        recognitionRef.current = null; // Prevent restart attempts
      } else if (event.error === "no-speech" || event.error === "audio-capture") {
        // These are temporary errors - let onend handle restart
        // Don't clear recognitionRef so onend can restart
        console.log("[VartaSync STT] Temporary error, will auto-restart...");
      } else if (event.error === "network") {
        // Network error - try restart after delay
        console.log("[VartaSync STT] Network error, retrying...");
      } else {
        // Other errors - still try to restart
        console.log("[VartaSync STT] Error occurred, will attempt restart");
      }
    };

    return recognition;
  }, [language, continuous, onTranscript, onListeningChange, flushAccumulatedTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) return;

    // Stop any ongoing TTS (barge-in)
    stopSpeaking();

    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      console.warn("Recognition already started");
    }
  }, [isSupported, initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;  // Prevent auto-restart
      ref.stop();
      setIsListening(false);
      onListeningChange?.(false);
    }
  }, [onListeningChange]);

  // Speak text using TTS
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !autoSpeak) {
      console.log("[VartaSync TTS] Skipped:", !synthRef.current ? "no synth" : "autoSpeak off");
      return;
    }

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = TTS_LANG_MAP[language] || "hi-IN";
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use cached voices (already loaded via onvoiceschanged)
    const voices = cachedVoicesRef.current.length > 0
      ? cachedVoicesRef.current
      : synthRef.current.getVoices();

    // Priority: exact match → language prefix match → Google English → any English → default
    const langPrefix = targetLang.split("-")[0];
    let selectedVoice =
      voices.find(v => v.lang === targetLang) ||
      voices.find(v => v.lang.startsWith(langPrefix)) ||
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      (voices.length > 0 ? voices[0] : null);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`[VartaSync TTS] Using voice: ${selectedVoice.name} (${selectedVoice.lang}) for ${language}`);
    } else {
      console.warn(`[VartaSync TTS] No voices available! ${voices.length} voices loaded.`);
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      (window as any)._isSpeakingRef = true;
      console.log("[VartaSync TTS] Speaking:", text.slice(0, 60) + "...");
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setTimeout(() => {
        (window as any)._isSpeakingRef = false;
      }, 500);
    };

    utterance.onerror = (e) => {
      console.error("[VartaSync TTS] Error:", e);
      setIsSpeaking(false);
      (window as any)._isSpeakingRef = false;
    };

    currentUtteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [language, autoSpeak]);

  // Stop speaking (barge-in support)
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup any pending flush timer on unmount
  useEffect(() => {
    return () => {
      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSpeaking,
    isSupported,
    interimText,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
  };
}

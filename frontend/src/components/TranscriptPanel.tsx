"use client";

import { useRef, useEffect } from "react";
import type { TranscriptEntry } from "@/types";
import { Bot, Mic } from "lucide-react";

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
  isCallActive: boolean;
  leadName?: string;
  leadAvatar?: string;
}

export default function TranscriptPanel({ transcript, isCallActive, leadName, leadAvatar }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="neon-card" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ borderBottom: "1px solid rgba(42,42,58,0.5)", padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e5e5e5" }}>LIVE VOICE STREAM</h3>
            {isCallActive && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "9999px", background: "rgba(255,68,68,0.1)", padding: "2px 8px" }}>
                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff4444", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
                <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "#ff4444" }}>REC</span>
              </div>
            )}
          </div>
          {isCallActive && (
            <span className="live-pulse" style={{ fontSize: "0.75rem", fontWeight: 600, color: "#00ff88" }}>LIVE</span>
          )}
        </div>
        {isCallActive && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "8px", border: "1px solid rgba(42,42,58,0.5)", background: "rgba(26,26,36,0.5)", padding: "10px 12px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 500, textTransform: "uppercase", color: "#00ff88" }}>Active Agent</div>
            <span style={{ fontWeight: 600, color: "#e5e5e5", fontSize: "0.85rem" }}>VartaSync (Hinglish)</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={16} style={{ color: "#00ff88" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="transcript-container" style={{ flex: 1 }}>
        {transcript.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#6b6b7b" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
              <Mic size={32} />
            </div>
            <p style={{ fontSize: "0.85rem" }}>Start a call to see the live transcript</p>
          </div>
        )}

        {transcript.map((entry, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexDirection: entry.speaker === "user" ? "row-reverse" : "row" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
              background: entry.speaker === "agent" ? "rgba(0,255,136,0.1)" : "#2a2a3a",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {entry.speaker === "agent"
                ? <Bot size={16} style={{ color: "#00ff88" }} />
                : <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#e5e5e5" }}>{leadAvatar || "U"}</span>}
            </div>
            <div style={{ maxWidth: "75%", textAlign: entry.speaker === "user" ? "right" : "left" }}>
              <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.7rem", color: "#6b6b7b" }}>
                <span style={{ color: entry.speaker === "agent" ? "#00ff88" : "#e5e5e5" }}>
                  {entry.speaker === "agent" ? "Sarvam" : `Lead${leadName ? ` — ${leadName}` : ""}`}
                </span>
              </div>
              <div className={`transcript-msg ${entry.speaker === "user" ? "user" : "agent"}`} style={{ display: "inline-block" }}>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "#e5e5e5" }}>{entry.text}</p>
              </div>
            </div>
          </div>
        ))}

        {isCallActive && transcript.length > 0 && transcript[transcript.length - 1].speaker === "user" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={16} style={{ color: "#00ff88" }} />
            </div>
            <div className="transcript-msg agent" style={{ opacity: 0.6 }}>
              <div className="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

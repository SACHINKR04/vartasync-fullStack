"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CallData {
  id: number;
  start_time: string | null;
  duration: number | null;
  score: number | null;
  category: string;
  summary: Record<string, unknown> | null;
  objections: string[];
  next_action: string | null;
}

interface LeadDetail {
  lead: {
    id: number;
    name: string;
    phone: string;
    language: string;
    status: string;
    score: number;
  };
  calls: CallData[];
}

interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string | null;
}

interface CallTranscript {
  call_id: number;
  transcript: TranscriptEntry[];
  summary: Record<string, unknown> | null;
  score: number | null;
  category: string;
  next_action: string | null;
  objections: string[];
}

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = params?.id;
  const [data, setData] = useState<LeadDetail | null>(null);
  const [selectedCallTranscript, setSelectedCallTranscript] = useState<CallTranscript | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    fetch(`${API_BASE}/api/leads/${leadId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [leadId]);

  const loadTranscript = async (callId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/calls/${callId}/transcript`);
      if (res.ok) setSelectedCallTranscript(await res.json());
    } catch (err) {
      console.error("Failed to load transcript:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Loading lead details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--accent-red)", fontSize: "1rem" }}>Lead not found.</p>
      </div>
    );
  }

  const { lead, calls } = data;
  const statusColor = lead.status === "hot" ? "var(--accent-red)" : lead.status === "warm" ? "var(--accent-yellow)" : "var(--accent-cyan)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Header */}
      <header style={{
        padding: "14px 28px", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--bg-glass)", backdropFilter: "blur(20px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <a href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>← Back to Dashboard</a>
          <span style={{ color: "var(--border-subtle)" }}>|</span>
          <h1 style={{ fontSize: "1.05rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            RM Handoff — {lead.name}
          </h1>
        </div>
        <span style={{
          padding: "4px 16px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
          background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>
          {lead.status}
        </span>
      </header>

      <main style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
        {/* Left: Lead Info + Call History */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Lead Card */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "14px" }}>
              Lead Profile
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Name</span>
                <span style={{ fontWeight: 600 }}>{lead.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Phone</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{lead.phone}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Language</span>
                <span style={{ textTransform: "capitalize" }}>{lead.language}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Score</span>
                <span style={{ fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: statusColor }}>{lead.score}/100</span>
              </div>
            </div>
          </div>

          {/* Call History */}
          <div className="glass-card" style={{ padding: "20px", flex: 1, overflow: "auto" }}>
            <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "14px" }}>
              Call History ({calls.length})
            </h2>
            {calls.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center", padding: "20px" }}>No calls yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {calls.map((call) => {
                  const cColor = call.category === "hot" ? "var(--accent-red)" : call.category === "warm" ? "var(--accent-yellow)" : "var(--accent-cyan)";
                  return (
                    <div
                      key={call.id}
                      onClick={() => loadTranscript(call.id)}
                      style={{
                        padding: "14px", borderRadius: "var(--radius-md)",
                        border: selectedCallTranscript?.call_id === call.id ? `1px solid var(--accent-purple)` : "1px solid var(--border-subtle)",
                        background: selectedCallTranscript?.call_id === call.id ? "rgba(139,92,246,0.08)" : "transparent",
                        cursor: "pointer", transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {call.start_time ? new Date(call.start_time).toLocaleString() : "—"}
                        </span>
                        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: cColor, textTransform: "uppercase" }}>
                          {call.category}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                        <span>Score: <strong style={{ color: cColor }}>{call.score ?? "—"}</strong></span>
                        <span style={{ color: "var(--text-muted)" }}>{call.duration ? `${Math.round(call.duration)}s` : "—"}</span>
                      </div>
                      {call.next_action && (
                        <div style={{ fontSize: "0.7rem", color: "var(--accent-purple)", marginTop: "6px" }}>
                          Next: {call.next_action.replace(/_/g, " ")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Call Detail / Transcript */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {selectedCallTranscript ? (
            <>
              {/* Summary */}
              {selectedCallTranscript.summary && (
                <div className="glass-card" style={{ padding: "20px" }}>
                  <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "14px" }}>
                    AI Call Summary
                  </h2>
                  <p style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "var(--text-secondary)" }}>
                    {String(selectedCallTranscript.summary?.summary || "No summary available")}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
                    {/* Topics */}
                    <div>
                      <h3 style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Topics</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {(selectedCallTranscript.summary?.topics_covered as string[] || []).map((t, i) => (
                          <span key={i} style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.65rem", background: "rgba(139,92,246,0.15)", color: "var(--accent-purple)" }}>
                            {String(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Objections */}
                    <div>
                      <h3 style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Objections</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {selectedCallTranscript.objections.map((o, i) => (
                          <span key={i} style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "0.65rem", background: "rgba(239,68,68,0.15)", color: "var(--accent-red)" }}>
                            {o.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Quotes */}
                  {(selectedCallTranscript.summary?.key_quotes as string[] || []).length > 0 && (
                    <div style={{ marginTop: "14px" }}>
                      <h3 style={{ fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>Key Quotes</h3>
                      {(selectedCallTranscript.summary?.key_quotes as string[]).map((q, i) => (
                        <p key={i} style={{ fontSize: "0.8rem", fontStyle: "italic", color: "var(--accent-green)", marginBottom: "4px" }}>
                          &ldquo;{String(q)}&rdquo;
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Recommended Action */}
                  {selectedCallTranscript.next_action && (
                    <div style={{
                      marginTop: "14px", padding: "10px 14px", borderRadius: "var(--radius-md)",
                      background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)",
                    }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--accent-green)", textTransform: "uppercase" }}>
                        Recommended: {selectedCallTranscript.next_action.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Transcript */}
              <div className="glass-card" style={{ padding: "20px", flex: 1, overflow: "auto" }}>
                <h2 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "14px" }}>
                  Full Transcript
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {selectedCallTranscript.transcript.map((entry, i) => (
                    <div key={i} style={{
                      display: "flex", gap: "10px", alignItems: "flex-start",
                      flexDirection: entry.speaker === "agent" ? "row" : "row-reverse",
                    }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 700,
                        background: entry.speaker === "agent" ? "var(--gradient-brand)" : "rgba(255,255,255,0.1)",
                        color: entry.speaker === "agent" ? "#fff" : "var(--text-secondary)",
                      }}>
                        {entry.speaker === "agent" ? "AI" : "U"}
                      </div>
                      <div style={{
                        maxWidth: "75%", padding: "10px 14px", borderRadius: "var(--radius-md)",
                        fontSize: "0.82rem", lineHeight: 1.5,
                        background: entry.speaker === "agent" ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.05)",
                        border: entry.speaker === "agent" ? "1px solid rgba(139,92,246,0.2)" : "1px solid var(--border-subtle)",
                      }}>
                        {entry.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{
              padding: "60px", display: "flex", alignItems: "center", justifyContent: "center",
              flex: 1,
            }}>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Select a call from the left to view the full transcript and AI summary.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

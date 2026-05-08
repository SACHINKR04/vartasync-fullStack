"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { LayoutDashboard, Radio, Users, Phone, Mic, PhoneOff, Send, UserPlus, Plus, Filter, Flame, Snowflake, Volume2, VolumeX, StopCircle, LogOut, Bell, ChevronDown, Calendar, X, Bot, CheckCircle2, Info } from "lucide-react"
import { useVartaSync } from "@/hooks/useVartaSync"
import { useVoice } from "@/hooks/useVoice"
import ScoreGauge from "@/components/ScoreGauge"
import TranscriptPanel from "@/components/TranscriptPanel"
import ObjectionMatrix from "@/components/ObjectionMatrix"
import CallSummaryPanel from "@/components/CallSummaryPanel"
import { DashView, MiniWave, LiveWave, SentimentChart } from "@/components/dashboard-parts"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

type V = "dash" | "live"
type F = "all" | "hot" | "warm" | "cold"
interface LeadItem { id: number; name: string; phone: string; language: string; status: string; score: number }
interface DashStats { total_leads: number; hot_leads: number; warm_leads: number; cold_leads: number; total_calls: number; conversion_rate: number }

export function VartaSyncDashboard({ onLogout, onGoHome }: { onLogout?: () => void; onGoHome?: () => void }) {
  const [vw, setVw] = useState<V>("dash")
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [stats, setStats] = useState<DashStats | null>(null)
  const [activeLeadId, setActiveLeadId] = useState<number | null>(null)
  const [flt, setFlt] = useState<F>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newLead, setNewLead] = useState({ name: "", phone: "", lang: "hindi", t: "warm" })
  const [messageInput, setMessageInput] = useState("")
  const [voiceMode, setVoiceMode] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [sec, setSec] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isSpeakingRef = useRef(false)

  const { isConnected, isCallActive, transcript, score, category, objections, callSummary, handoffTriggered, whatsappStatus, startCall, endCall, sendMessage } = useVartaSync()

  const activeLead = leads.find(l => l.id === activeLeadId)
  const voiceLang = activeLead?.language || "hinglish"

  const handleVoiceTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal && text.trim() && isCallActive && !isSpeakingRef.current) sendMessage(text.trim())
  }, [isCallActive, sendMessage])

  const { isListening, isSpeaking, isSupported: voiceSupported, interimText, toggleListening, stopSpeaking } = useVoice({
    language: voiceLang, continuous: true, autoSpeak, onTranscript: handleVoiceTranscript,
  })

  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])

  useEffect(() => { fetchLeads(); fetchStats() }, [])
  useEffect(() => { if (callSummary) { fetchLeads(); fetchStats() } }, [callSummary])
  useEffect(() => {
    if (!isCallActive) return
    const t = setInterval(() => setSec(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [isCallActive])

  const fetchLeads = async () => { try { const r = await fetch(`${API_BASE}/api/leads`); if (r.ok) setLeads(await r.json()) } catch (e) { console.error(e) } }
  const fetchStats = async () => { try { const r = await fetch(`${API_BASE}/api/dashboard/stats`); if (r.ok) setStats(await r.json()) } catch (e) { console.error(e) } }

  const handleAddLead = async () => {
    if (!newLead.name.trim() || !newLead.phone.trim()) return
    try {
      const r = await fetch(`${API_BASE}/api/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newLead.name, phone: newLead.phone, language: newLead.lang }) })
      if (r.ok) { setNewLead({ name: "", phone: "", lang: "hindi", t: "warm" }); setShowAddModal(false); fetchLeads(); fetchStats() }
    } catch (e) { console.error(e) }
  }

  const handleStartCall = (id: number) => { setActiveLeadId(id); setSec(0); startCall(id) }
  const handleSend = () => { if (!messageInput.trim()) return; sendMessage(messageInput); setMessageInput(""); inputRef.current?.focus() }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
  const fl = leads.filter(l => flt === "all" || l.status === flt)
  const counts = { all: leads.length, hot: leads.filter(l => l.status === "hot").length, warm: leads.filter(l => l.status === "warm").length, cold: leads.filter(l => l.status === "cold").length }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0f" }}>
      {/* Sidebar */}
      <aside style={{ position: "fixed", left: 0, top: 0, width: "208px", height: "100vh", display: "flex", flexDirection: "column", borderRight: "1px solid rgba(42,42,58,0.5)", background: "linear-gradient(to bottom, #0d0d14, #0a0a0f)" }}>
        <div onClick={onGoHome} style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid rgba(42,42,58,0.5)", padding: "20px 16px", cursor: onGoHome ? "pointer" : "default", transition: "opacity 0.2s" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#00ff88", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(0,255,136,0.4)" }}>
            <Users size={16} style={{ color: "#0a0a0f" }} />
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e5e5e5" }}>VartaSync</span>
        </div>
        <nav style={{ flex: 1, padding: "12px" }}>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "4px" }}>
            {[{ id: "dash" as V, icon: <LayoutDashboard size={16} />, label: "Dashboard" },
              { id: "live" as V, icon: <Radio size={16} />, label: "Live Monitoring" }].map(i => (
              <li key={i.id}>
                <button onClick={() => setVw(i.id)} style={{
                  display: "flex", width: "100%", alignItems: "center", gap: "12px", borderRadius: "8px", padding: "10px 12px",
                  textAlign: "left", fontSize: "0.85rem", border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: vw === i.id ? "rgba(0,255,136,0.1)" : "transparent",
                  color: vw === i.id ? "#00ff88" : "#6b6b7b",
                  textShadow: vw === i.id ? "0 0 10px rgba(0,255,136,0.5)" : "none",
                }}>
                  {i.icon} <span style={{ fontWeight: 500 }}>{i.label}</span>
                  {i.id === "live" && vw !== "live" && <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#00ff88", animation: "pulse-dot 1.5s ease-in-out infinite" }} />}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ borderRadius: "8px", border: "1px solid rgba(42,42,58,0.5)", background: "rgba(26,26,36,0.5)", padding: "12px" }}>
            <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.7rem", color: "#6b6b7b" }}>System Status</span>
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#00ff88" }}>All Systems Operational</span>
          </div>
          {onLogout && (
            <button onClick={onLogout} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", border: "1px solid #2a2a3a", background: "rgba(26,26,36,0.5)", padding: "10px", fontSize: "0.8rem", color: "#6b6b7b", cursor: "pointer" }}>
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: "208px", flex: 1, padding: "24px" }}>
        <header style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#e5e5e5" }}>{vw === "dash" ? "Dashboard" : "Live Monitoring"}</h1>
            <p style={{ marginTop: "4px", fontSize: "0.8rem", color: "#6b6b7b" }}>Real-time voice agent monitoring and analytics</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isCallActive && <span className="live-pulse" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#00ff88" }}>CALL ACTIVE</span>}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "9999px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.1)", padding: "8px 12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#00ff88" }}>Live</span>
            </div>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(to bottom right, #2a2a3a, #1a1a24)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#e5e5e5" }}>RS</span>
            </div>
          </div>
        </header>

        {handoffTriggered && (
          <div className="handoff-banner" style={{ marginBottom: "20px" }}>
            🔥 HOT LEAD — READY FOR RM HANDOFF • Score: {score}/100
          </div>
        )}

        {vw === "dash" ? (
          <DashView onGoLive={() => setVw("live")} stats={stats} leads={leads} />
        ) : (
          /* Live Monitoring View */
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 340px", gap: "20px", height: "calc(100vh - 140px)" }}>
            {/* Add Lead Modal */}
            {showAddModal && (
              <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,15,0.8)", backdropFilter: "blur(4px)" }}>
                <div style={{ width: "400px", borderRadius: "16px", border: "1px solid rgba(42,42,58,0.8)", background: "rgba(18,18,26,0.95)", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                  <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "1.1rem", fontWeight: 700, color: "#e5e5e5" }}>
                    <UserPlus size={20} style={{ color: "#00ff88" }} /> Add New Lead
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input value={newLead.name} onChange={e => setNewLead({ ...newLead, name: e.target.value })} className="input-field" placeholder="Full Name" />
                    <input value={newLead.phone} onChange={e => setNewLead({ ...newLead, phone: e.target.value })} className="input-field" placeholder="+91 98765 43210" />
                    <select value={newLead.lang} onChange={e => setNewLead({ ...newLead, lang: e.target.value })} className="input-field" style={{ cursor: "pointer" }}>
                      <option value="hindi">Hindi</option><option value="english">English</option><option value="hinglish">Hinglish</option><option value="kannada">Kannada</option>
                    </select>
                  </div>
                  <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button onClick={() => setShowAddModal(false)} style={{ borderRadius: "12px", border: "1px solid #2a2a3a", background: "transparent", padding: "10px 20px", fontSize: "0.8rem", color: "#6b6b7b", cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleAddLead} disabled={!newLead.name} className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.8rem" }}>Add Lead</button>
                  </div>
                </div>
              </div>
            )}

            {/* Left: Lead Queue */}
            <div className="neon-card" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ borderBottom: "1px solid rgba(42,42,58,0.5)", padding: "16px" }}>
                <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6b7b" }}>Lead Queue</h3>
                  <button onClick={() => setShowAddModal(true)} style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.1)", padding: "4px 10px", fontSize: "0.7rem", fontWeight: 500, color: "#00ff88", cursor: "pointer" }}>
                    <Plus size={14} /> Add Lead
                  </button>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["all", "hot", "warm", "cold"] as F[]).map(f => (
                    <button key={f} onClick={() => setFlt(f)} style={{
                      display: "flex", alignItems: "center", gap: "6px", borderRadius: "9999px", padding: "6px 12px", fontSize: "0.7rem", fontWeight: 500, cursor: "pointer", border: "1px solid",
                      borderColor: flt === f ? "rgba(0,255,136,0.5)" : "#2a2a3a",
                      background: flt === f ? "rgba(0,255,136,0.1)" : "transparent",
                      color: flt === f ? "#00ff88" : "#6b6b7b",
                    }}>
                      {f === "hot" && <Flame size={12} style={{ color: "#ff6b6b" }} />}
                      {f === "cold" && <Snowflake size={12} style={{ color: "#6b9fff" }} />}
                      {f === "all" ? `All (${counts.all})` : f === "hot" ? `Hot (${counts.hot})` : f === "warm" ? `Warm (${counts.warm})` : `Cold (${counts.cold})`}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {fl.length === 0 && <p style={{ textAlign: "center", padding: "24px", fontSize: "0.8rem", color: "#6b6b7b" }}>No leads. Add one to start.</p>}
                {fl.map(l => (
                  <div key={l.id} onClick={() => { if (!isCallActive) setActiveLeadId(l.id) }} style={{
                    padding: "12px", borderRadius: "12px", marginBottom: "6px", cursor: "pointer", transition: "all 0.2s",
                    border: activeLeadId === l.id ? "1px solid rgba(0,255,136,0.6)" : "1px solid rgba(42,42,58,0.5)",
                    background: activeLeadId === l.id ? "rgba(0,255,136,0.05)" : "rgba(26,26,36,0.3)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(to bottom right, #2a2a3a, #1a1a24)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "#e5e5e5" }}>{l.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 600, color: "#e5e5e5", fontSize: "0.85rem" }}>{l.name}</span>
                          <span style={{ fontSize: "1rem", fontWeight: 700, color: l.score >= 70 ? "#00ff88" : l.score >= 40 ? "#ffaa00" : "#6b6b7b" }}>{isCallActive && activeLeadId === l.id ? score : l.score}%</span>
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#6b6b7b" }}>{l.phone} • {l.language}</div>
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {isCallActive && activeLeadId === l.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <Phone size={12} style={{ color: "#00ff88" }} />
                              <span style={{ fontSize: "0.7rem", color: "#00ff88" }}>Live Call</span>
                              <MiniWave active />
                            </div>
                          ) : (
                            <button onClick={e => { e.stopPropagation(); handleStartCall(l.id) }} disabled={isCallActive} className="btn-ghost" style={{ fontSize: "0.7rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Phone size={12} /> Call
                            </button>
                          )}
                          <span style={{ borderRadius: "9999px", padding: "2px 8px", fontSize: "0.65rem", fontWeight: 500,
                            background: l.status === "hot" ? "rgba(0,255,136,0.15)" : l.status === "warm" ? "rgba(255,170,0,0.15)" : "rgba(107,107,123,0.15)",
                            color: l.status === "hot" ? "#00ff88" : l.status === "warm" ? "#ffaa00" : "#6b6b7b" }}>
                            {l.status.charAt(0).toUpperCase() + l.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center: Transcript + Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflow: "hidden", minHeight: 0 }}>
              {(!callSummary || isCallActive) ? (
                <>
                  <TranscriptPanel transcript={transcript} isCallActive={isCallActive} leadName={activeLead?.name} leadAvatar={activeLead?.name.substring(0, 2).toUpperCase()} />

                  <div className="neon-card" style={{ padding: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
                    {voiceSupported && isCallActive && (
                      <button onClick={() => { setVoiceMode(!voiceMode); toggleListening() }} style={{
                        width: "44px", height: "44px", borderRadius: "50%", border: "none",
                        background: isListening ? "#ff4444" : "#00ff88", color: isListening ? "#fff" : "#0a0a0f",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        animation: isListening ? "pulse-dot 1.5s infinite" : "none",
                        boxShadow: isListening ? "0 0 20px rgba(239,68,68,0.4)" : "0 0 15px rgba(0,255,136,0.3)",
                      }}>
                        {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                      </button>
                    )}
                    <input ref={inputRef} className="input-field" style={{ flex: 1 }}
                      placeholder={isListening ? "Listening... speak now" : isCallActive ? "Type or use mic..." : "Start a call first..."}
                      value={isListening ? interimText : messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={!isCallActive || isListening} />
                    <button className="btn-primary" onClick={handleSend} disabled={!isCallActive || !messageInput.trim() || isListening} style={{ padding: "12px 20px" }}>
                      <Send size={16} />
                    </button>
                    {isCallActive && (
                      <button onClick={() => { setAutoSpeak(!autoSpeak); if (isSpeaking) stopSpeaking() }} className="btn-ghost" style={{ padding: "12px" }}>
                        {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
                      </button>
                    )}
                    {isCallActive && (
                      <button className="btn-danger" onClick={() => { if (isListening) toggleListening(); endCall() }} style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <PhoneOff size={16} /> End
                      </button>
                    )}
                  </div>

                  {isCallActive && (isListening || isSpeaking) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", background: isListening ? "rgba(255,68,68,0.1)" : "rgba(0,255,136,0.1)", borderRadius: "8px", fontSize: "0.75rem", border: `1px solid ${isListening ? "rgba(255,68,68,0.2)" : "rgba(0,255,136,0.2)"}` }}>
                      <span className="live-pulse" style={{ color: isListening ? "#ff4444" : "#00ff88" }}>
                        {isListening ? "Listening..." : "Speaking..."}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <CallSummaryPanel summary={callSummary} whatsappStatus={whatsappStatus} />
              )}
            </div>

            {/* Right: Score + Objections + Sentiment */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto" }}>
              <ScoreGauge score={score} category={category} />
              <ObjectionMatrix objections={objections} />

              <div className="neon-card" style={{ padding: "16px" }}>
                <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6b7b" }}>Sentiment Trend</h3>
                </div>
                <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "16px", fontSize: "0.7rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88" }} /><span style={{ color: "#6b6b7b" }}>Positive</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} /><span style={{ color: "#6b6b7b" }}>Neutral</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} /><span style={{ color: "#6b6b7b" }}>Negative</span></div>
                </div>
                <SentimentChart />
              </div>

              {isCallActive && (
                <div className="neon-card" style={{ padding: "16px" }}>
                  <h3 style={{ marginBottom: "12px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6b7b" }}>Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button className="btn-primary" style={{ padding: "12px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <Phone size={16} /> Take Over
                    </button>
                    <button className="btn-ghost" style={{ padding: "12px", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <PhoneOff size={16} /> Mute
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

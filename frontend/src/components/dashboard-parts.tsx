"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Phone, Clock, Check, ChevronDown, Radio, AlertTriangle, GitBranch, Mic, MessageSquare, Users } from "lucide-react"

/* ── Hardcoded SVG Charts (same as reference) ── */

export function Spark() {
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full">
      <defs>
        <linearGradient id="spg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#00ff88" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      <path d="M0,30 Q15,28 30,22 T60,18 T90,12 T120,8" fill="none" stroke="url(#spg)" strokeWidth="3" />
    </svg>
  )
}

export function ConversionChart() {
  const pts = [35, 42, 48, 55, 58, 72, 75]
  const days = ["May 8", "May 9", "May 10", "May 11", "May 12", "May 13", "May 14"]
  const w = 500, h = 200, px = w / (pts.length - 1), py = h / 100
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${i * px},${h - p * py}`).join(" ")
  const areaPath = `${path} L${w},${h} L0,${h} Z`
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <svg viewBox={`0 0 ${w + 60} ${h + 40}`} className="h-full w-full" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1="40" y1={h - v * py} x2={w + 40} y2={h - v * py} stroke="#2a2a3a" strokeWidth="1" />
            <text x="30" y={h - v * py + 4} fill="#6b6b7b" fontSize="11" textAnchor="end">{v}%</text>
          </g>
        ))}
        <g transform="translate(40, 0)">
          {/* Hover highlight column */}
          {hoverIdx !== null && (
            <rect x={hoverIdx * px - px / 2} y={0} width={px} height={h} fill="url(#chartGrad)" opacity="0.5" />
          )}
          <path d={areaPath} fill="url(#chartGrad)" />
          {hoverIdx !== null && (
            <line x1={hoverIdx * px} y1={0} x2={hoverIdx * px} y2={h} stroke="rgba(0,255,136,0.5)" strokeWidth="1" strokeDasharray="4,4" />
          )}
          <path d={path} fill="none" stroke="#00ff88" strokeWidth="3" style={{ filter: "drop-shadow(0 0 6px #00ff88)" }} />
          {pts.map((p, i) => (
            <circle key={i} cx={i * px} cy={h - p * py} r={hoverIdx === i ? 7 : 5} fill="#00ff88" stroke="#0a0a0f" strokeWidth="2"
              style={{ filter: hoverIdx === i ? "drop-shadow(0 0 8px #00ff88)" : "drop-shadow(0 0 4px #00ff88)", transition: "all 0.2s ease", pointerEvents: "none" }} />
          ))}
          {/* Invisible interactive columns for much better UX */}
          {pts.map((_, i) => (
            <rect key={`hit-${i}`} x={i === 0 ? 0 : i * px - px / 2} y={0} width={i === 0 || i === pts.length - 1 ? px / 2 : px} height={h + 25} fill="transparent"
              style={{ cursor: "pointer" }} onMouseEnter={() => setHoverIdx(i)} />
          ))}
        </g>
        {days.map((d, i) => (
          <text key={d} x={40 + i * px} y={h + 25} fill={hoverIdx === i ? "#00ff88" : "#6b6b7b"} fontSize="11" fontWeight={hoverIdx === i ? 600 : 400} textAnchor="middle" style={{ transition: "all 0.2s ease" }}>{d}</text>
        ))}
      </svg>
      {hoverIdx !== null && (
        <div style={{
          position: "absolute", left: `calc(${(40 + hoverIdx * px) / (w + 60) * 100}%)`, top: `calc(${(h - pts[hoverIdx] * py) / (h + 40) * 100}% - 55px)`, transform: "translateX(-50%)",
          background: "rgba(18,18,26,0.95)", border: "1px solid rgba(42,42,58,0.8)", borderRadius: "6px",
          padding: "6px 10px", pointerEvents: "none", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", whiteSpace: "nowrap"
        }}>
          <div style={{ fontSize: "0.6rem", color: "#6b6b7b" }}>{days[hoverIdx]}, 2024</div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#00ff88", lineHeight: "1" }}>{pts[hoverIdx]}%</div>
        </div>
      )}
    </div>
  )
}

export function IndiaMap() {
  const states = [
    { n: "Maharashtra", v: 1248, c: "#2d6b3f" },
    { n: "Uttar Pradesh", v: 1034, c: "#3d8a4d" },
    { n: "Karnataka", v: 932, c: "#4d9a5d" },
    { n: "Tamil Nadu", v: 812, c: "#6ab867" },
    { n: "Gujarat", v: 728, c: "#c4a332" },
    { n: "West Bengal", v: 645, c: "#c4a332" },
    { n: "Rajasthan", v: 532, c: "#d4943a" },
    { n: "Others", v: 1256, c: "#3d8a4d" },
  ]
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ flex: "1 1 150px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        {/* India Map Image */}
        <div style={{ width: "100%", maxWidth: "190px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src="/india-map.png" alt="Map of India" style={{ display: "block", width: "100%", height: "auto", objectFit: "contain", maxHeight: "220px" }} />
        </div>
      </div>
      {/* State List */}
      <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
        {states.map((s) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.c, flexShrink: 0 }} />
              <span style={{ color: "#e5e5e5", whiteSpace: "nowrap" }}>{s.n}</span>
            </div>
            <span style={{ fontWeight: 600, color: "#e5e5e5", flexShrink: 0, textAlign: "right", marginLeft: "16px" }}>{s.v.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MiniWave({ active = true }: { active?: boolean }) {
  const [bars, setBars] = useState<{h: string, a: string}[]>([])
  useEffect(() => {
    setBars([...Array(8)].map(() => ({
      h: active ? `${4 + Math.random() * 12}px` : "4px",
      a: active ? `pulse ${0.3 + Math.random() * 0.4}s ease-in-out infinite` : "none"
    })))
  }, [active])
  const db = bars.length ? bars : [...Array(8)].map(() => ({ h: active ? "10px" : "4px", a: active ? "pulse 0.5s ease-in-out infinite" : "none" }))
  return (
    <div style={{ display: "flex", height: "16px", alignItems: "center", gap: "2px" }}>
      {db.map((b, i) => (
        <div key={i} style={{ width: "2px", borderRadius: "9999px", background: active ? "#00ff88" : "#3a3a4a", height: b.h, animation: b.a }} />
      ))}
    </div>
  )
}

export function LiveWave() {
  const [bars, setBars] = useState<{h: string, o: number, a: string}[]>([])
  useEffect(() => {
    setBars([...Array(40)].map(() => ({
      h: `${2 + Math.random() * 20}px`,
      o: 0.3 + Math.random() * 0.7,
      a: `pulse ${0.2 + Math.random() * 0.3}s ease-in-out infinite`
    })))
  }, [])
  const db = bars.length ? bars : [...Array(40)].map(() => ({ h: "12px", o: 0.6, a: "pulse 0.35s ease-in-out infinite" }))
  return (
    <div style={{ display: "flex", height: "24px", alignItems: "center", justifyContent: "center", gap: "2px" }}>
      {db.map((b, i) => (
        <div key={i} style={{ width: "4px", borderRadius: "9999px", background: "#00ff88", height: b.h, opacity: b.o, animation: b.a }} />
      ))}
    </div>
  )
}

export function SentimentChart() {
  const days = ["8 May", "9 May", "10 May", "11 May", "12 May", "13 May", "14 May"]
  const pos = [45, 50, 55, 48, 60, 55, 58]
  const neu = [30, 28, 25, 32, 25, 30, 28]
  const neg = [15, 12, 10, 18, 8, 12, 10]
  const w = 240, h = 80, px = w / (days.length - 1)
  const mkP = (d: number[]) => d.map((p, i) => `${i === 0 ? "M" : "L"}${i * px},${h - (p / 100) * h}`).join(" ")
  return (
    <svg width={w} height={h + 30} style={{ overflow: "visible" }}>
      <path d={mkP(pos)} fill="none" stroke="#00ff88" strokeWidth="2" />
      <path d={mkP(neu)} fill="none" stroke="#3b82f6" strokeWidth="2" />
      <path d={mkP(neg)} fill="none" stroke="#ef4444" strokeWidth="2" />
      {pos.map((_, i) => <circle key={`p${i}`} cx={i * px} cy={h - (pos[i] / 100) * h} r="3" fill="#00ff88" />)}
      {neu.map((_, i) => <circle key={`n${i}`} cx={i * px} cy={h - (neu[i] / 100) * h} r="3" fill="#3b82f6" />)}
      {neg.map((_, i) => <circle key={`g${i}`} cx={i * px} cy={h - (neg[i] / 100) * h} r="3" fill="#ef4444" />)}
      <g style={{ fontSize: "9px", fill: "#6b6b7b" }}>
        {days.map((d, i) => <text key={d} x={i * px - 12} y={h + 15}>{d}</text>)}
      </g>
      <line x1="0" y1={h} x2={w} y2={h} stroke="#2a2a3a" strokeWidth="1" />
    </svg>
  )
}

interface DashViewProps {
  onGoLive: () => void
  stats: { total_leads: number; hot_leads: number; warm_leads: number; cold_leads: number; total_calls: number; conversion_rate: number } | null
  leads: Array<{ id: number; name: string; phone: string; language: string; status: string; score: number }>
}

export function DashView({ onGoLive, stats, leads }: DashViewProps) {
  const conv = stats?.conversion_rate ?? 87
  const calls = stats?.total_calls ?? 0
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
        {[
          { icon: <TrendingUp size={16} style={{ color: "#00ff88" }} />, label: "Conversion Rate", value: `${conv}%`, sub: "+12% this week", accent: true },
          { icon: <Phone size={16} style={{ color: "#00ff88" }} />, label: "Total Calls", value: calls.toLocaleString(), sub: "+18.7% this week", accent: false },
          { icon: <Clock size={16} style={{ color: "#00ff88" }} />, label: "Avg. Call Duration", value: "02:46", sub: "+6.2% this week", accent: false },
          { icon: <Check size={16} style={{ color: "#00ff88" }} />, label: "Converted Calls", value: Math.round(calls * (conv / 100)).toLocaleString(), sub: "+15.3% this week", accent: false },
        ].map((c, i) => (
          <div key={i} className="neon-card" style={{ padding: "20px" }}>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              {c.icon}
              <span style={{ fontSize: "0.8rem", color: "#6b6b7b" }}>{c.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: c.accent ? "#00ff88" : "#e5e5e5", textShadow: c.accent ? "0 0 20px rgba(0,255,136,0.4)" : "none" }}>{c.value}</span>
                <p style={{ marginTop: "4px", fontSize: "0.7rem", color: "#00ff88" }}>{c.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px" }}>
        <div className="neon-card" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} style={{ color: "#00ff88" }} />
              <h3 style={{ fontWeight: 600, color: "#e5e5e5" }}>Conversion Rate Overview</h3>
            </div>
          </div>
          <div style={{ height: "220px" }}><ConversionChart /></div>
        </div>
        <div className="neon-card" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Radio size={16} style={{ color: "#00ff88" }} />
              <h3 style={{ fontWeight: 600, color: "#e5e5e5" }}>Live Call Pipeline</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88", animation: "pulse-dot 1.5s ease-in-out infinite" }} />
              <span style={{ fontSize: "0.8rem", color: "#00ff88" }}>Live</span>
            </div>
          </div>
          <p style={{ marginBottom: "16px", fontSize: "1.1rem", fontWeight: 700, color: "#e5e5e5" }}>Active Leads: <span style={{ color: "#00ff88" }}>{leads.length}</span></p>
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {leads.slice(0, 3).map((l) => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "12px", borderRadius: "8px", border: "1px solid rgba(42,42,58,0.5)", background: "rgba(26,26,36,0.6)", padding: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(to bottom right, #2a2a3a, #1a1a24)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "#e5e5e5" }}>{l.name.substring(0, 2).toUpperCase()}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "#e5e5e5", fontSize: "0.85rem" }}>{l.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#6b6b7b" }}>{l.language}</div>
                </div>
                <MiniWave active />
                <span style={{ borderRadius: "9999px", border: "1px solid rgba(0,255,136,0.3)", background: "rgba(0,255,136,0.1)", padding: "4px 10px", fontSize: "0.65rem", fontWeight: 500, color: "#00ff88" }}>{l.status}</span>
              </div>
            ))}
          </div>
          <button onClick={onGoLive} style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.3)", padding: "12px", fontWeight: 500, color: "#00ff88", cursor: "pointer", transition: "all 0.2s" }}>
            Open Live Monitoring <span style={{ fontSize: "1.1rem" }}>→</span>
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
        <div className="neon-card" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={16} style={{ color: "#ff6b6b" }} />
            <h3 style={{ fontWeight: 600, color: "#e5e5e5" }}>Top Objections</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[{ l: "Pricing", p: "35%", c: "#ff6b6b" }, { l: "Timing", p: "28%", c: "#ffaa00" }, { l: "Features", p: "18%", c: "#00ff88" }].map(o => (
              <div key={o.l}>
                <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <span style={{ color: "#e5e5e5" }}>{o.l}</span>
                  <span style={{ color: o.c }}>{o.p}</span>
                </div>
                <div style={{ height: "8px", overflow: "hidden", borderRadius: "9999px", background: "#1a1a24" }}>
                  <div style={{ height: "100%", width: o.p, borderRadius: "9999px", background: o.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="neon-card" style={{ padding: "20px" }}>
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <GitBranch size={16} style={{ color: "#00ff88" }} />
            <h3 style={{ fontWeight: 600, color: "#e5e5e5" }}>Pipeline Stages</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[{ icon: <Mic size={16} style={{ color: "#00ff88" }} />, l: "Pitch", p: "85%" },
              { icon: <MessageSquare size={16} style={{ color: "#00ff88" }} />, l: "Objection Handling", p: "62%" },
              { icon: <Users size={16} style={{ color: "#00ff88" }} />, l: "Qualified", p: "41%" }].map(s => (
              <div key={s.l} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(0,255,136,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span style={{ color: "#e5e5e5" }}>{s.l}</span>
                    <span style={{ color: "#e5e5e5" }}>{s.p}</span>
                  </div>
                  <div style={{ height: "8px", overflow: "hidden", borderRadius: "9999px", background: "#1a1a24" }}>
                    <div style={{ height: "100%", width: s.p, borderRadius: "9999px", background: "#00ff88" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="neon-card" style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "16px", fontWeight: 600, color: "#e5e5e5" }}>Brokers by State (India)</h3>
          <IndiaMap />
        </div>
      </div>

      <div className="neon-card" style={{ padding: "20px" }}>
        <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={16} style={{ color: "#00ff88" }} />
          <h3 style={{ fontWeight: 600, color: "#e5e5e5" }}>Language Distribution</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[{ l: "Hinglish", p: "42%", v: 524, c: "#00ff88" }, { l: "Hindi", p: "28%", v: 348, c: "#00ff88" }, { l: "English", p: "16%", v: 199, c: "#3b82f6" }].map(i => (
              <div key={i.l} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "70px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i.c }} />
                  <span style={{ fontSize: "0.8rem", color: "#e5e5e5" }}>{i.l}</span>
                </div>
                <div style={{ flex: 1, height: "8px", overflow: "hidden", borderRadius: "9999px", background: "#1a1a24" }}>
                  <div style={{ height: "100%", width: i.p, borderRadius: "9999px", background: i.c }} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#6b6b7b", width: "36px", textAlign: "right" }}>{i.p}</span>
                <span style={{ fontSize: "0.75rem", color: "#e5e5e5", width: "36px", textAlign: "right" }}>{i.v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[{ l: "Tamil", p: "6%", v: 75, c: "#3b82f6" }, { l: "Telugu", p: "4%", v: 50, c: "#ff6b6b" }, { l: "Kannada", p: "2%", v: 25, c: "#ffaa00" }].map(i => (
              <div key={i.l} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "70px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i.c }} />
                  <span style={{ fontSize: "0.8rem", color: "#e5e5e5" }}>{i.l}</span>
                </div>
                <div style={{ flex: 1, height: "8px", overflow: "hidden", borderRadius: "9999px", background: "#1a1a24" }}>
                  <div style={{ height: "100%", width: i.p, borderRadius: "9999px", background: i.c }} />
                </div>
                <span style={{ fontSize: "0.75rem", color: "#6b6b7b", width: "36px", textAlign: "right" }}>{i.p}</span>
                <span style={{ fontSize: "0.75rem", color: "#e5e5e5", width: "36px", textAlign: "right" }}>{i.v}</span>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: "12px", border: "1px solid rgba(42,42,58,0.5)", background: "rgba(26,26,36,0.5)", padding: "16px" }}>
            <p style={{ fontSize: "0.7rem", color: "#6b6b7b", marginBottom: "4px" }}>Most Used Language</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#00ff88", marginBottom: "8px" }}>Hinglish</p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.7rem", color: "#00ff88" }}>
              <TrendingUp size={12} /> 18% interactions
            </div>
            <p style={{ fontSize: "0.7rem", color: "#6b6b7b", marginTop: "4px" }}>vs last 7 days</p>
            <div style={{ marginTop: "12px" }}><Spark /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

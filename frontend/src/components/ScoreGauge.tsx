"use client";

import { useMemo } from "react";

interface ScoreGaugeProps {
  score: number;
  category: "hot" | "warm" | "cold";
}

export default function ScoreGauge({ score, category }: ScoreGaugeProps) {
  const r = 50;
  const c = 2 * Math.PI * r;
  const o = c - (score / 100) * c;

  const cfg = useMemo(() => {
    switch (category) {
      case "hot": return { label: "HOT", color: "#00ff88" };
      case "warm": return { label: "WARM", color: "#ffaa00" };
      default: return { label: "COLD", color: "#6b6b7b" };
    }
  }, [category]);

  return (
    <div className="neon-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b6b7b" }}>
          Confidence Score
        </h3>
        <span style={{ fontSize: "0.7rem", color: "#00ff88", display: "flex", alignItems: "center", gap: "4px" }}>
          ↑ 12% vs last 7 days
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={cfg.color} />
                <stop offset="100%" stopColor={category === "hot" ? "#00cc6a" : category === "warm" ? "#ff8800" : "#4a4a5a"} />
              </linearGradient>
            </defs>
            <circle cx="65" cy="65" r={r} fill="none" stroke="#1a1a24" strokeWidth="10" />
            <circle cx="65" cy="65" r={r} fill="none" stroke="url(#scoreGrad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={o}
              style={{ filter: `drop-shadow(0 0 6px ${cfg.color})`, transition: "stroke-dashoffset 0.8s ease" }} />
          </svg>
          <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "2rem", fontWeight: 800, color: "#e5e5e5" }}>{score}</span>
            <span style={{ fontSize: "0.65rem", color: "#6b6b7b" }}>/100</span>
          </div>
        </div>
      </div>
      <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
        {[{ l: "Sentiment", v: "Positive", c: "#00ff88" }, { l: "Objections", v: "1", c: "#ff6b6b" },
          { l: "Duration", v: "02:46", c: "#e5e5e5" }, { l: "Talk Ratio", v: "62%", c: "#e5e5e5" }].map(s => (
          <div key={s.l} style={{ borderRadius: "8px", background: "rgba(26,26,36,0.5)", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "0.6rem", color: "#6b6b7b" }}>{s.l}</div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

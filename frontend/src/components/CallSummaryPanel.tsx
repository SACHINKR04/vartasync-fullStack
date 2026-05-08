"use client";

import type { CallSummary } from "@/types";
import { BarChart, Smartphone } from "lucide-react";

interface CallSummaryPanelProps {
  summary: CallSummary;
  whatsappStatus?: { status: string; to: string } | null;
}

export default function CallSummaryPanel({ summary, whatsappStatus }: CallSummaryPanelProps) {
  return (
    <div className="neon-card animate-scale-in" style={{ padding: "20px", overflowY: "auto", flex: 1, minHeight: 0 }}>
      <h3 style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#00ff88", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <BarChart size={16} /> Post-Call Summary
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {[
          { l: "Duration", v: `${Math.round(summary.call_duration_seconds || 0)}s` },
          { l: "Interest Score", v: `${summary.interest_score}/100` },
          { l: "Lead Category", v: summary.lead_category?.toUpperCase() },
          { l: "Next Action", v: summary.recommended_next_action?.replace(/_/g, " ") || "—" },
        ].map(s => (
          <div key={s.l} style={{ background: "rgba(26,26,36,0.5)", borderRadius: "8px", padding: "12px" }}>
            <div style={{ fontSize: "0.6rem", color: "#6b6b7b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>{s.l}</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e5e5e5" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {summary.summary && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "0.65rem", color: "#6b6b7b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Summary</div>
          <p style={{ fontSize: "0.8rem", color: "#e5e5e5", lineHeight: 1.6 }}>{summary.summary}</p>
        </div>
      )}

      {whatsappStatus && (
        <div style={{ marginBottom: "12px", padding: "10px", background: "rgba(0,255,136,0.05)", borderRadius: "8px", border: "1px solid rgba(0,255,136,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#e5e5e5", fontWeight: 600 }}>
            <Smartphone size={14} style={{ color: "#00ff88" }} /> WhatsApp Follow-Up
          </div>
          <p style={{ fontSize: "0.7rem", color: "#6b6b7b", marginTop: "4px" }}>
            Status: <span style={{ color: "#00ff88" }}>{whatsappStatus.status}</span> • To: {whatsappStatus.to}
          </p>
        </div>
      )}

      {summary.objections_raised?.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "0.65rem", color: "#6b6b7b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Objections</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {summary.objections_raised.map((obj, i) => (
              <span key={i} style={{ padding: "2px 8px", background: "rgba(255,170,0,0.1)", border: "1px solid rgba(255,170,0,0.2)", borderRadius: "9999px", fontSize: "0.65rem", color: "#ffaa00" }}>
                {obj.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}

      {summary.key_quotes?.length > 0 && (
        <div>
          <div style={{ fontSize: "0.65rem", color: "#6b6b7b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Key Quotes</div>
          {summary.key_quotes.map((q, i) => (
            <div key={i} style={{ padding: "8px 12px", background: "rgba(26,26,36,0.5)", borderLeft: "3px solid #00ff88", borderRadius: "0 6px 6px 0", fontSize: "0.75rem", color: "#e5e5e5", fontStyle: "italic", marginBottom: "6px" }}>
              &ldquo;{q}&rdquo;
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

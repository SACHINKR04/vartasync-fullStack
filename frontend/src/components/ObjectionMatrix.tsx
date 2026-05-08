"use client";

import type { ObjectionStatus } from "@/types";
import { Check, CheckCircle2 } from "lucide-react";

interface ObjectionMatrixProps {
  objections: ObjectionStatus;
}

const OBJECTION_LABELS: { key: keyof ObjectionStatus; label: string }[] = [
  { key: "existing_broker", label: "Existing Broker" },
  { key: "no_contacts", label: "No Contacts" },
  { key: "support_concern", label: "Support" },
  { key: "trust", label: "Trust" },
  { key: "delay", label: "Delay" },
];

export default function ObjectionMatrix({ objections }: ObjectionMatrixProps) {
  const resolvedCount = Object.values(objections).filter(Boolean).length;

  return (
    <div className="neon-card" style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#6b6b7b" }}>
          Objection Matrix Checklist
        </h3>
        <span style={{ fontSize: "0.7rem", color: "#6b6b7b" }}>{resolvedCount}/5 Completed</span>
      </div>
      <div style={{ display: "flex", gap: "16px" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
          {OBJECTION_LABELS.map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "20px", height: "20px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
                background: objections[key] ? "#00ff88" : "#1a1a24",
                border: objections[key] ? "none" : "1px solid #3a3a4a",
              }}>
                {objections[key] && <Check size={12} style={{ color: "#0a0a0f" }} />}
              </div>
              <span style={{ fontSize: "0.8rem", color: objections[key] ? "#e5e5e5" : "#6b6b7b" }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%", background: "rgba(0,255,136,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>
          <CheckCircle2 size={40} style={{ color: "#00ff88" }} />
        </div>
      </div>
    </div>
  );
}

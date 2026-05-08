/**
 * VartaSync — Shared TypeScript Types
 * Mirror of backend constants.py WebSocket protocol
 */

// ============================================================================
// WEBSOCKET EVENTS
// ============================================================================

export enum WSEventType {
  // Frontend → Backend
  AUDIO_CHUNK = "audio_chunk",
  INTERRUPT = "interrupt",
  END_CALL = "end_call",
  START_CALL = "start_call",
  USER_TEXT = "user_text",

  // Backend → Frontend
  TRANSCRIPT_USER = "transcript_user",
  TRANSCRIPT_AGENT = "transcript_agent",
  TRANSCRIPT_AGENT_PARTIAL = "transcript_agent_partial",
  AUDIO_RESPONSE = "audio_response",
  SCORE_UPDATE = "score_update",
  OBJECTION_DETECTED = "objection_detected",
  CALL_SUMMARY = "call_summary",
  STOP_PLAYBACK = "stop_playback",
  HANDOFF_TRIGGERED = "handoff_triggered",
  WHATSAPP_SENT = "whatsapp_sent",
  ERROR = "error",
}

// ============================================================================
// DATA TYPES
// ============================================================================

export type LeadCategory = "hot" | "warm" | "cold";

export interface Lead {
  id: number;
  name: string;
  phone: string;
  language: string;
  status: LeadCategory;
  score: number;
  created_at?: string;
}

export interface TranscriptEntry {
  speaker: "user" | "agent";
  text: string;
  timestamp: number;
}

export interface ScoreUpdate {
  score: number;
  category: LeadCategory;
}

export interface ObjectionStatus {
  existing_broker: boolean;
  no_contacts: boolean;
  support_concern: boolean;
  trust: boolean;
  delay: boolean;
}

export interface CallSummary {
  call_duration_seconds: number;
  topics_covered: string[];
  objections_raised: string[];
  objections_resolved: string[];
  interest_score: number;
  lead_category: LeadCategory;
  engagement_signals: string[];
  recommended_next_action: string;
  summary: string;
  key_quotes: string[];
}

export interface WSMessage {
  event: string;
  [key: string]: unknown;
}

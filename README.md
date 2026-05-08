<p align="center">
  <img src="https://img.shields.io/badge/VartaSync-AI%20Voice%20Agent-8b5cf6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xMiAyYTMgMyAwIDAgMC0zIDN2N2EzIDMgMCAwIDAgNiAwVjVhMyAzIDAgMCAwLTMtM1oiLz48cGF0aCBkPSJNMTkgMTB2MmE3IDcgMCAwIDEtMTQgMHYtMiIvPjxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMTkiIHkyPSIyMiIvPjwvc3ZnPg==" alt="VartaSync"/>
</p>

<h1 align="center">⚡ VartaSync</h1>
<p align="center"><strong>AI Voice Agent for Partner Lead Conversion</strong></p>
<p align="center">
  <em>Real-time, multilingual, event-driven voice orchestration engine for Rupeezy's Authorized Person (AP) partner program.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/AI-LangGraph-FF6F00?style=flat-square" alt="LangGraph"/>
  <img src="https://img.shields.io/badge/LLM-Llama%203%20(Groq)-F55036?style=flat-square" alt="Llama 3"/>
  <img src="https://img.shields.io/badge/Frontend-Next.js%2016-000?style=flat-square&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/DB-SQLite-003B57?style=flat-square&logo=sqlite" alt="SQLite"/>
  <img src="https://img.shields.io/badge/Voice-Web%20Speech%20API-34A853?style=flat-square" alt="Web Speech"/>
  <img src="https://img.shields.io/badge/TTS%2FSTT-Sarvam%20AI-FF5722?style=flat-square" alt="Sarvam"/>
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [WebSocket Protocol](#-websocket-protocol)
- [Lead Scoring Engine](#-lead-scoring-engine)
- [Objection Handling System](#-objection-handling-system)
- [Multilingual Support](#-multilingual-support)
- [LangGraph Conversation Engine](#-langgraph-conversation-engine)
- [Database Schema](#-database-schema)
- [REST API Reference](#-rest-api-reference)
- [Frontend Components](#-frontend-components)
- [WhatsApp Integration](#-whatsapp-integration)
- [Testing](#-testing)
- [Demo Script](#-demo-script)
- [Team](#-team)

---

## 🔍 Problem Statement

Rupeezy's partner program offers **zero joining fee**, **100% brokerage share** (vs. 60–70% industry standard), and **daily payouts** — yet only **18% of leads convert**. The failure is structural:

| Bottleneck | Impact |
|------------|--------|
| **Timing** | Leads arriving after hours sit untouched. Contacting within 5 min yields 9× higher conversion vs. 30 min. |
| **Language** | India has 20+ languages. RMs speak 1–2. Hindi leads receiving English pitches disconnect in 15 seconds. |
| **Capacity** | 1 RM = 1 call at a time. Overnight campaigns generate 200+ leads; queue backs up for days. |

> **82% of leads are lost to delay, language mismatch, and queue overflow — not a weak value proposition.**

---

## 💡 Solution Overview

**VartaSync** is an AI voice agent that:

1. **Contacts all leads instantly** — no after-hours gap, no queue backlog
2. **Opens in the lead's language** — Hindi, English, Hinglish detected automatically
3. **Pitches Rupeezy's AP program** following Appendix A telecalling script
4. **Handles 5 core objections** naturally with contextual rebuttals
5. **Scores leads in real-time** using deterministic Python math (not LLM arithmetic)
6. **Hands off hot leads** to human RMs with full conversation context
7. **Auto-sends WhatsApp** signup links to warm leads
8. **Generates post-call summaries** with duration, objections, score, and next action

**Target: Lift conversion from 18% → 40%+**

---

## ✨ Key Features

### 🎙️ Real-Time Voice Conversation
- Browser-native voice via Web Speech API (STT + TTS)
- Sarvam AI integration ready for production telephony (Saarika STT + Bulbul TTS)
- Barge-in support — interrupt the AI mid-sentence, it stops and listens

### 🌐 Multilingual Intelligence
- Auto-detects Hindi, English, Hinglish from first message
- Switches language mid-conversation if the lead does
- Devanagari script detection + Hinglish word-list analysis
- Support for Tamil, Telugu, Marathi, Gujarati, Bengali

### 🧠 LangGraph State Machine
- 4-node graph: Conversation → Objection → Handoff → Summarization
- Conditional routing with keyword pre-detection (O(1) regex)
- Multi-turn memory across calls (loads last 3 conversations for returning leads)

### 📊 Deterministic Lead Scoring
- LLM emits `[SIGNAL: xxx]` tags → Python applies exact point math
- Base 30 + positive signals (+5 to +15) + negative signals (-5 to -20)
- Hot (≥70) → RM handoff | Warm (40–69) → WhatsApp | Cold (<40) → Nurture

### 🎯 5 Core Objection Handlers
Each with bilingual rebuttals adapted contextually (never copy-pasted):
1. "I already have a broker"
2. "I don't have enough contacts"
3. "Who handles client support?"
4. "Is Rupeezy trustworthy?"
5. "I'll think about it / call me later"

### 🖥️ God Mode Dashboard
- Live transcript with typing indicators
- Animated SVG score gauge (0–100)
- Objection matrix with green glow on resolution
- Hot lead handoff banner flash
- RM detail view with full call history and transcripts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 16 + React 19)            │
│                                                              │
│  page.tsx (Dashboard)          lead/[id]/page.tsx (RM View)  │
│       │                              │                       │
│  useVartaSync.ts ◄──── WebSocket ────┘                       │
│  useVoice.ts     ◄──── Web Speech API                        │
│       │                                                      │
│  Components: ScoreGauge │ ObjectionMatrix │ TranscriptPanel   │
└────────┬────────────────────────────────────────────────────┘
         │ WS: ws://localhost:8000/ws/call/{id}
         │ REST: http://localhost:8000/api/*
┌────────▼────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI + Python)                   │
│                                                              │
│  main.py ──► graph.py (LangGraph 4-node state machine)       │
│                 ├── conversation_node (Groq LLM)             │
│                 ├── objection_node (focused rebuttals)        │
│                 ├── handoff_node (RM transfer)                │
│                 └── summarization_node (JSON summary)         │
│                                                              │
│  scoring.py ◄── [SIGNAL: xxx] tags from LLM                  │
│  prompts.py ──► Master system prompt with few-shot examples   │
│  audio.py   ──► Sarvam AI STT/TTS (production path)          │
│  whatsapp.py──► Twilio WhatsApp auto-send                    │
│  models.py  ──► SQLAlchemy (Lead, Call, Transcript tables)    │
│                     │                                        │
│              ┌──────▼──────┐                                 │
│              │ vartasync.db │ (SQLite)                        │
│              └─────────────┘                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **LLM** | Groq Llama-3 (70B/8B) | Conversation, objection handling, summarization |
| **Orchestration** | LangGraph + LangChain | 4-node state machine with conditional routing |
| **Backend** | FastAPI + Uvicorn | REST API + WebSocket server |
| **Frontend** | Next.js 16 + React 19 | Dark-mode real-time dashboard |
| **Database** | SQLite + SQLAlchemy | Leads, Calls, Transcripts storage |
| **Voice (Browser)** | Web Speech API | SpeechRecognition (STT) + SpeechSynthesis (TTS) |
| **Voice (Prod)** | Sarvam AI | Saarika v2 STT + Bulbul v1 TTS for Indian languages |
| **WhatsApp** | Twilio API | Auto-send signup links to warm/hot leads |
| **Styling** | Vanilla CSS + CSS Variables | Dark fintech glassmorphism design system |
| **Fonts** | Inter + JetBrains Mono | Google Fonts for UI + monospace data |

---

## 📁 Project Structure

```
VartaSync/
├── README.md
├── .gitignore
│
├── backend/
│   ├── .env.example                 # Environment template
│   ├── requirements.txt             # Python dependencies
│   ├── vartasync.db                 # SQLite database (auto-created)
│   ├── test_ws.py                   # WebSocket E2E test
│   ├── test_bargein.py              # Barge-in flow test
│   ├── test_whatsapp.py             # WhatsApp simulation test
│   └── app/
│       ├── __init__.py
│       ├── config.py                # Pydantic settings from .env
│       ├── constants.py             # WS events, scoring rubric, objections
│       ├── models.py                # SQLAlchemy models (3 tables)
│       ├── prompts.py               # Master system prompt builder
│       ├── scoring.py               # Deterministic lead scoring engine
│       ├── graph.py                 # LangGraph state machine (4 nodes)
│       ├── audio.py                 # Sarvam AI STT/TTS pipeline
│       ├── whatsapp.py              # Twilio WhatsApp follow-up
│       ├── main.py                  # FastAPI app entry point
│       └── test_brain.py            # CLI brain test (no audio)
│
└── frontend/
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    └── src/
        ├── types.ts                 # Shared TS types (mirrors constants.py)
        ├── hooks/
        │   ├── useVartaSync.ts      # WebSocket state manager
        │   └── useVoice.ts          # Web Speech API (STT + TTS)
        ├── components/
        │   ├── ScoreGauge.tsx        # SVG radial score dial
        │   ├── ObjectionMatrix.tsx   # 5-item objection checklist
        │   ├── TranscriptPanel.tsx   # Live chat transcript
        │   ├── CallSummaryPanel.tsx  # Post-call summary report
        │   ├── vartasync-dashboard.tsx # Main dashboard layout
        │   ├── landing-page.tsx      # Marketing landing page
        │   └── dashboard-parts.tsx   # Extracted dashboard UI components
        └── app/
            ├── layout.tsx           # Root layout (fonts, SEO)
            ├── globals.css          # Design system (dark theme)
            ├── page.tsx             # SPA router (Landing -> Dashboard)
            └── lead/[id]/page.tsx   # RM handoff detail view
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Python** 3.10+ with pip
- **Node.js** 18+ with npm
- **Groq API Key** (for Llama-3 models) — [Get one here](https://console.groq.com/keys)

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/VartaSync.git
cd VartaSync
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Create `.env` file in `backend/`

```bash
cp .env.example .env
```

Edit `backend/.env` with your keys:

```env
# === REQUIRED ===
GROQ_API_KEY=your-groq-api-key-here
LLM_MODEL=llama-3.3-70b-versatile

# === OPTIONAL: Fallback LLMs ===
GOOGLE_API_KEY=your-google-api-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here

# === OPTIONAL: Speech (Sarvam AI) ===
SARVAM_API_KEY=your-sarvam-key
DEEPGRAM_API_KEY=your-deepgram-key

# === OPTIONAL: TTS fallback ===
ELEVENLABS_API_KEY=your-elevenlabs-key

# === OPTIONAL: WhatsApp (Twilio) ===
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# === Database (auto-configured) ===
DATABASE_URL=sqlite+aiosqlite:///./vartasync.db
```

> **Note:** Only `GROQ_API_KEY` is required. The browser demo uses Web Speech API for voice (no Sarvam key needed). WhatsApp will simulate if no Twilio credentials.

---

## ▶️ Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
python -m app.main
# Server starts at http://localhost:8000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
# Dashboard opens at http://localhost:3000
```

### Quick Test (Terminal 3)

```bash
# Test the brain without UI
cd backend
python -m app.test_brain

# Test WebSocket end-to-end
python test_ws.py

# Test barge-in flow
python test_bargein.py
```

---

## 📡 WebSocket Protocol

All real-time communication uses a JSON WebSocket at `ws://localhost:8000/ws/call/{lead_id}`.

### Frontend → Backend Events

| Event | Payload | Description |
|-------|---------|-------------|
| `user_text` | `{"event": "user_text", "text": "..."}` | User's typed or spoken message |
| `interrupt` | `{"event": "interrupt", "timestamp": ...}` | Barge-in: user spoke while AI was talking |
| `end_call` | `{"event": "end_call"}` | User ends the call |
| `audio_chunk` | `{"event": "audio_chunk", "data": "..."}` | Raw audio from mic (Phase 2) |

### Backend → Frontend Events

| Event | Payload | Description |
|-------|---------|-------------|
| `transcript_user` | `{text, speaker: "user"}` | Echo of user's message |
| `transcript_agent` | `{text, speaker: "agent"}` | Agent's clean response |
| `score_update` | `{score: 45, category: "warm"}` | Updated lead score |
| `objection_detected` | `{objection_id: "trust"}` | Objection was identified and handled |
| `handoff_triggered` | `{score: 75, category: "hot"}` | Score hit 70+ — RM handoff ready |
| `call_summary` | `{data: {final_score, category, ...}}` | Post-call JSON summary |
| `stop_playback` | `{}` | Stop browser TTS (barge-in) |
| `whatsapp_sent` | `{status, to, message}` | WhatsApp follow-up result |
| `error` | `{message: "..."}` | Error description |

---

## 📊 Lead Scoring Engine

**Philosophy:** LLMs don't do arithmetic — Python does. The LLM emits signal tags; `scoring.py` applies exact math.

### Scoring Rubric

| Category | Signal | Points |
|----------|--------|--------|
| **Base** | Lead answered the call | +30 |
| **Positive** | Asks for signup / send link | +15 |
| | Mentions existing clients | +15 |
| | Asks about payouts | +10 |
| | Asks about brokerage share | +10 |
| | Asks about RISE Portal | +10 |
| | Engaged beyond 2 minutes | +10 |
| | Positive reaction ("interesting") | +10 |
| | Asks clarifying question | +5 |
| **Negative** | "Not interested" | -20 |
| | "I'll think about it" (disengaged) | -15 |
| | Hung up within 60 seconds | -10 |
| | One-word answers consistently | -10 |
| | Sounds distracted | -5 |

### Classification Thresholds

| Score Range | Category | Action |
|-------------|----------|--------|
| 70–100 | 🔥 **HOT** | Immediate RM handoff with full context |
| 40–69 | 🌤️ **WARM** | WhatsApp signup link auto-sent |
| 0–39 | ❄️ **COLD** | Logged for future nurture campaign |

### How It Works

```
LLM Output: "[SIGNAL: asks_about_brokerage] [SIGNAL: positive_reaction] Bilkul, 100% brokerage..."
                        │                              │
         scoring.py extracts via regex ◄───────────────┘
                        │
         Python: score = 30 + 10 + 10 = 50 → WARM
                        │
         Clean output sent to frontend: "Bilkul, 100% brokerage..."
```

---

## 🎯 Objection Handling System

### The 5 Core Objections

| ID | Objection | Trigger Phrases (sample) |
|----|-----------|--------------------------|
| `existing_broker` | "I already have a broker" | "pehle se broker hai", "already working with" |
| `no_contacts` | "I don't have enough contacts" | "clients nahi hain", "small network" |
| `support_concern` | "Who handles client support?" | "support kaun dega", "problem aayi toh" |
| `trust` | "Is Rupeezy trustworthy?" | "bharosa kaise karein", "fraud toh nahi" |
| `delay` | "I'll think about it" | "sochna padega", "baad mein call karna" |

### Two-Layer Detection

1. **Keyword pre-router** (`detect_objection_by_keywords`) — O(1) regex scan runs BEFORE the LLM. Catches obvious objections instantly.
2. **LLM intent detection** — The system prompt instructs the LLM (Llama-3) to emit `[OBJECTION: type]` tags for nuanced cases.

### Contextual Rebuttals

Each objection has bilingual rebuttals (English + Hindi) stored in `constants.py`. The LLM is told:

> *"Do NOT copy this rebuttal word-for-word. Adapt it naturally to what the user actually said."*

Example: Lead says *"Mere paas pehle se broker hai"* → LangGraph routes to `objection_node` → LLM gets the reference rebuttal + instruction to adapt → Response: *"Achha, yeh toh achhi baat hai. Lekin kya aapko 100% brokerage mil raha hai?"*

---

## 🌐 Multilingual Support

### Language Detection (`graph.py`)

```python
# 1. Devanagari script → Hindi
if re.search(r'[\u0900-\u097F]', text): return "hindi"

# 2. Hinglish word list (40+ common words)
if hindi_word_ratio > 0.3: return "hinglish"

# 3. Default → English
return "english"
```

### Supported Languages

| Language | Detection | STT/TTS | Objection Rebuttals |
|----------|-----------|---------|---------------------|
| Hindi | ✅ Script analysis | ✅ Web Speech + Sarvam | ✅ Full |
| English | ✅ Default | ✅ Web Speech + Sarvam | ✅ Full |
| Hinglish | ✅ Word-list | ✅ Web Speech (hi-IN) | ✅ Full |
| Tamil | ⬜ Planned | ✅ Sarvam | ⬜ Planned |
| Telugu | ⬜ Planned | ✅ Sarvam | ⬜ Planned |
| Marathi | ⬜ Planned | ✅ Sarvam | ⬜ Planned |
| Gujarati | ⬜ Planned | ✅ Sarvam | ⬜ Planned |
| Bengali | ⬜ Planned | ✅ Sarvam | ⬜ Planned |

### Mid-Conversation Switching

The system prompt tells the agent: *"If the user switches language mid-conversation, switch with them naturally."* Language is re-detected on each message and the prompt is rebuilt.

---

## 🧠 LangGraph Conversation Engine

### State Machine Flow

```
[User Input]
      │
      ▼
 route_after_input()
      │
      ├── call_active == false?  ──► summarization_node ──► END
      │
      ├── score >= 70?           ──► handoff_node ──► END
      │
      ├── keyword objection?     ──► objection_node ──► END
      │
      └── default                ──► conversation_node ──► END
                                          │
                                    (waits for next user input)
```

### Node Details

| Node | LLM Call? | Purpose |
|------|-----------|---------|
| `conversation_node` | ✅ Groq | General chat, pitching, engagement questions |
| `objection_node` | ✅ Groq | Focused rebuttal with reference knowledge injected |
| `handoff_node` | ❌ Static | Pre-written handoff message, sets `handoff_triggered` |
| `summarization_node` | ✅ Groq | Generates structured JSON post-call summary |

### Multi-Turn Memory

On WebSocket connect, the backend loads **last 3 calls** for the same lead and injects their summaries as a system message:

```
[PREVIOUS CALL CONTEXT]
- Call on 05 May: Score=45, Category=warm, Objections=["trust"], Action=whatsapp_followup
Use this context to pick up where you left off.
```

---

## 🗄️ Database Schema

Three SQLite tables via SQLAlchemy:

### `leads`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| name | VARCHAR(255) | Lead's name |
| phone | VARCHAR(20) | Phone number |
| language | ENUM | Preferred language |
| status | ENUM | hot / warm / cold |
| score | INTEGER | Current score (0-100) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### `calls`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| lead_id | INTEGER FK | References leads.id |
| start_time | DATETIME | Call start |
| end_time | DATETIME | Call end |
| duration_seconds | FLOAT | Total duration |
| final_score | INTEGER | Score at call end |
| category | ENUM | hot / warm / cold |
| summary | TEXT (JSON) | AI-generated post-call summary |
| objections_raised | TEXT (JSON) | List of objection IDs |
| next_action | VARCHAR(255) | Recommended next step |

### `transcripts`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Auto-increment ID |
| call_id | INTEGER FK | References calls.id |
| speaker | VARCHAR(10) | "user" or "agent" |
| text | TEXT | Message content |
| timestamp | DATETIME | Message timestamp |

---

## 📚 REST API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/api/leads` | List all leads (ordered by creation date desc) |
| `POST` | `/api/leads` | Create a new lead `{name, phone, language}` |
| `GET` | `/api/leads/{id}` | Get lead detail + all call history |
| `POST` | `/api/leads/batch` | Batch upload leads `{leads: [...]}` |
| `GET` | `/api/dashboard/stats` | Dashboard funnel stats (total, hot, warm, cold, conv. rate) |
| `GET` | `/api/calls/{id}/transcript` | Full transcript + summary for a specific call |
| `WS` | `/ws/call/{lead_id}` | WebSocket for real-time voice call session |

---

## 🖥️ Frontend Components

### Dashboard (`page.tsx`) — 3-Column Layout

```
┌──────────────┬───────────────────────────┬──────────────────┐
│  LEFT (320px) │    CENTER (flex)           │  RIGHT (280px)   │
│               │                           │                  │
│  Stats Cards  │  Live Transcript          │  Score Gauge     │
│  (4x grid)    │  (auto-scroll bubbles)    │  (SVG 0-100)     │
│               │                           │                  │
│  + Add Lead   │  Chat Input + Mic + Send  │  Objection       │
│               │                           │  Matrix (5x)     │
│  Lead Queue   │  Voice Status Bar         │                  │
│  (clickable)  │                           │  Active Call     │
│               │  Post-Call Summary        │  Info            │
└──────────────┴───────────────────────────┴──────────────────┘
```

### Component Details

| Component | File | Description |
|-----------|------|-------------|
| **ScoreGauge** | `ScoreGauge.tsx` | SVG radial dial with gradient stroke. Colors change by category (red/amber/blue). Animated transition on score change. |
| **ObjectionMatrix** | `ObjectionMatrix.tsx` | 5-item checklist with gray circles. When an objection is handled, the circle fills green with a glow effect. Shows resolved count. |
| **TranscriptPanel** | `TranscriptPanel.tsx` | Chat-style message bubbles. User messages (right, blue-purple gradient) and agent messages (left, dark card). Auto-scrolls. Shows typing indicator. |
| **CallSummaryPanel** | `CallSummaryPanel.tsx` | Post-call report with 4 stats cards (duration, score, category, next action), summary text, objection tags, and key quotes. |

### RM Handoff View (`lead/[id]/page.tsx`)

When an RM picks up a hot lead, this page shows:
- **Lead Profile** — Name, phone, language, current score
- **Call History** — All previous calls with scores, categories, next actions
- **AI Call Summary** — Topics covered, objections, key quotes
- **Full Transcript** — Every message in chat bubble format
- **Recommended Action** — handoff_to_rm / whatsapp_followup / nurture_later

### Design System (`globals.css`)

- **Theme:** Dark navy (`#0a0e1a` → `#1a1f35`) with glassmorphism
- **Accents:** Purple (`#8b5cf6`), Cyan (`#06b6d4`), Green (`#10b981`), Red (`#ef4444`), Amber (`#f59e0b`)
- **Effects:** `backdrop-filter: blur(20px)`, glow shadows, `slideIn` animations
- **Typography:** Inter for UI text, JetBrains Mono for data/scores

---

## 📱 WhatsApp Integration

### Auto-Send Flow

```
Call ends → scoring.py classifies lead
    ├── HOT (70+)  → WhatsApp signup link + RM handoff
    ├── WARM (40-69) → WhatsApp signup link
    └── COLD (<40)  → Logged only
```

### Message Templates

**Hinglish:**
> *"Hi {name}! Arjun here, Rupeezy se. Abhi humari achhi baat hui thi. Yeh raha aapka signup link — bas 2 minute, zero joining fee: https://partner.rupeezy.in/signup"*

### Configuration

- **With Twilio:** Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env` → real WhatsApp messages
- **Without Twilio:** Messages are simulated and logged to console → perfect for hackathon demo

---

## 🧪 Testing

### CLI Brain Test (No UI Required)

```bash
cd backend
python -m app.test_brain
```

Interactive terminal chat. Type messages as a lead, see:
- Agent responses in color
- Visual score bar updating
- Signal and objection tracking
- Post-call JSON summary on exit

### WebSocket E2E Test

```bash
cd backend
python test_ws.py
```

Automated: creates lead → connects WS → sends Hinglish message → collects responses → ends call → verifies summary.

### Barge-In Test

```bash
cd backend
python test_bargein.py
```

Same as above but sends an `interrupt` event mid-conversation, then a new message, verifying the AI stops and adapts.

---

## 🎤 Demo Script

### The Live Fire Test

1. **Open the dashboard** at `http://localhost:3000`
2. **Add a lead**: Enter name, phone number, select "Hindi"
3. **Press "Call"** — WebSocket connects, dashboard goes live
4. **Type as the lead**: *"Haan boliye, kaun bol raha hai?"*
5. **Watch the dashboard**: Transcript appears, score gauge moves
6. **Test objection**: Type *"Mere paas pehle se broker hai"*
7. **Watch**: Objection Matrix checkbox lights up green, agent adapts
8. **Test interest**: Type *"Achha, 100% brokerage? Tell me more"*
9. **Watch**: Score climbs, signals detected
10. **Test handoff**: Type *"Sign me up, send the link"*
11. **Watch**: Score hits 70+ → **HOT LEAD banner flashes** 🔥
12. **End the call**: Click "End Call"
13. **See**: Post-call summary with duration, score, objections, next action
14. **Check RM view**: Click the 📋 icon on the lead → full transcript and AI summary

### Judge-Impressing Moments

- **Barge-in**: Click the mic, interrupt the AI mid-response → it stops and listens
- **Language switch**: Start in Hindi, switch to English mid-conversation → agent follows
- **Objection matrix**: Each handled objection lights up green in real-time
- **WhatsApp**: After ending a warm/hot call, the simulated WhatsApp message appears in the console

---

## 👥 Team

Built with ❤️ for the AI for Bharat Hackathon.

---

<p align="center">
  <strong>VartaSync</strong> — <em>Every lead deserves a conversation in their language, at the right time.</em>
</p>

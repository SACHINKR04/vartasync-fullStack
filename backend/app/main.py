"""
VartaSync — FastAPI Application Entry Point
=============================================
WebSocket-first architecture for real-time voice agent communication.
REST endpoints for lead management and dashboard data.
"""

import json
import logging
import time
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import get_settings
from app.constants import WSEventType, LeadCategory, Language
from app.models import init_db, get_sync_session, Lead, Call, Transcript
from app.graph import ConversationManager
from app.scoring import LeadScoreState
from app.audio import stt_sarvam, tts_sarvam
import base64

# ============================================================================
# LOGGING
# ============================================================================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vartasync")


# ============================================================================
# LIFESPAN — DB init on startup
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    settings = get_settings()
    db_url = settings.database_url.replace("+aiosqlite", "")
    init_db(db_url)
    logger.info("✅ Database initialized")
    yield


# ============================================================================
# APP SETUP
# ============================================================================

app = FastAPI(
    title="VartaSync — AI Voice Agent for Partner Lead Conversion",
    description="Real-time voice agent that pitches Rupeezy's partner program",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vartasync-full-stack.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PYDANTIC MODELS for REST endpoints
# ============================================================================

class LeadCreate(BaseModel):
    name: str
    phone: str
    language: str = "hindi"


class LeadResponse(BaseModel):
    id: int
    name: str
    phone: str
    language: str
    status: str
    score: int


# ============================================================================
# REST ENDPOINTS — Lead Management
# ============================================================================

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "VartaSync", "version": "1.0.0"}


@app.post("/api/leads", response_model=LeadResponse)
async def create_lead(lead: LeadCreate):
    """Create a new lead in the database."""
    session = get_sync_session()
    try:
        db_lead = Lead(
            name=lead.name,
            phone=lead.phone,
            language=Language(lead.language) if lead.language in [l.value for l in Language] else Language.HINDI,
        )
        session.add(db_lead)
        session.commit()
        session.refresh(db_lead)

        return LeadResponse(
            id=db_lead.id,
            name=db_lead.name,
            phone=db_lead.phone,
            language=db_lead.language.value if db_lead.language else "hindi",
            status=db_lead.status.value if db_lead.status else "cold",
            score=db_lead.score or 30,
        )
    finally:
        session.close()


@app.get("/api/leads")
async def list_leads():
    """List all leads with their current status."""
    session = get_sync_session()
    try:
        leads = session.query(Lead).order_by(Lead.created_at.desc()).all()
        return [
            {
                "id": l.id,
                "name": l.name,
                "phone": l.phone,
                "language": l.language.value if l.language else "hindi",
                "status": l.status.value if l.status else "cold",
                "score": l.score or 30,
                "created_at": l.created_at.isoformat() if l.created_at else None,
            }
            for l in leads
        ]
    finally:
        session.close()


@app.get("/api/leads/{lead_id}")
async def get_lead(lead_id: int):
    """Get a lead with all their call history."""
    session = get_sync_session()
    try:
        lead = session.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")

        calls = session.query(Call).filter(Call.lead_id == lead_id).all()

        return {
            "lead": {
                "id": lead.id,
                "name": lead.name,
                "phone": lead.phone,
                "language": lead.language.value if lead.language else "hindi",
                "status": lead.status.value if lead.status else "cold",
                "score": lead.score or 30,
            },
            "calls": [
                {
                    "id": c.id,
                    "start_time": c.start_time.isoformat() if c.start_time else None,
                    "duration": c.duration_seconds,
                    "score": c.final_score,
                    "category": c.category.value if c.category else "cold",
                    "summary": json.loads(c.summary) if c.summary else None,
                    "objections": json.loads(c.objections_raised) if c.objections_raised else [],
                    "next_action": c.next_action,
                }
                for c in calls
            ],
        }
    finally:
        session.close()


@app.get("/api/dashboard/stats")
async def dashboard_stats():
    """Get conversion funnel stats for the dashboard."""
    session = get_sync_session()
    try:
        total = session.query(Lead).count()
        hot = session.query(Lead).filter(Lead.status == LeadCategory.HOT).count()
        warm = session.query(Lead).filter(Lead.status == LeadCategory.WARM).count()
        cold = session.query(Lead).filter(Lead.status == LeadCategory.COLD).count()
        total_calls = session.query(Call).count()

        return {
            "total_leads": total,
            "hot_leads": hot,
            "warm_leads": warm,
            "cold_leads": cold,
            "total_calls": total_calls,
            "conversion_rate": round((hot / max(total, 1)) * 100, 1),
        }
    finally:
        session.close()


# ============================================================================
# REST ENDPOINTS — Call History & Batch Operations
# ============================================================================

@app.get("/api/calls/{call_id}/transcript")
async def get_call_transcript(call_id: int):
    """Get full transcript for a specific call — used by RM handoff screen."""
    session = get_sync_session()
    try:
        call = session.query(Call).filter(Call.id == call_id).first()
        if not call:
            raise HTTPException(status_code=404, detail="Call not found")

        transcripts = (
            session.query(Transcript)
            .filter(Transcript.call_id == call_id)
            .order_by(Transcript.timestamp.asc())
            .all()
        )

        return {
            "call_id": call_id,
            "lead_id": call.lead_id,
            "duration": call.duration_seconds,
            "score": call.final_score,
            "category": call.category.value if call.category else "cold",
            "summary": json.loads(call.summary) if call.summary else None,
            "objections": json.loads(call.objections_raised) if call.objections_raised else [],
            "next_action": call.next_action,
            "transcript": [
                {
                    "speaker": t.speaker,
                    "text": t.text,
                    "timestamp": t.timestamp.isoformat() if t.timestamp else None,
                }
                for t in transcripts
            ],
        }
    finally:
        session.close()


class BatchLeadUpload(BaseModel):
    leads: list[LeadCreate]


@app.post("/api/leads/batch")
async def batch_upload_leads(batch: BatchLeadUpload):
    """Batch upload leads — RM uploads a CSV/list, all get queued for calling."""
    session = get_sync_session()
    created = []
    try:
        for lead_data in batch.leads:
            db_lead = Lead(
                name=lead_data.name,
                phone=lead_data.phone,
                language=Language(lead_data.language) if lead_data.language in [l.value for l in Language] else Language.HINDI,
            )
            session.add(db_lead)
            session.flush()
            created.append({
                "id": db_lead.id,
                "name": db_lead.name,
                "phone": db_lead.phone,
                "language": db_lead.language.value,
            })
        session.commit()
        return {"created": len(created), "leads": created}
    finally:
        session.close()


# ============================================================================
# WEBSOCKET — Real-time Voice Agent Communication
# ============================================================================

# Store active conversations (in production, use Redis)
active_conversations: dict[str, ConversationManager] = {}


@app.websocket("/ws/call/{lead_id}")
async def websocket_call(websocket: WebSocket, lead_id: int):
    """
    Main WebSocket endpoint for a voice call session.

    Protocol:
    - Frontend sends: audio_chunk, interrupt, end_call, start_call
    - Backend sends: transcript_user, transcript_agent, score_update,
                     objection_detected, call_summary, stop_playback, handoff_triggered
    """
    await websocket.accept()
    logger.info(f"📞 WebSocket connected for lead {lead_id}")

    # Get lead info from DB first (need language preference)
    session = get_sync_session()
    lead = session.query(Lead).filter(Lead.id == lead_id).first()

    # Create conversation manager with lead's preferred language
    preferred_lang = lead.language.value if lead and lead.language else "auto"
    logger.info(f"🌐 Lead preferred language: {preferred_lang}")
    manager = ConversationManager(preferred_language=preferred_lang)
    session_id = f"lead_{lead_id}_{datetime.now().timestamp()}"
    active_conversations[session_id] = manager

    # ── MULTI-TURN MEMORY: Load previous call context for this lead ──
    previous_calls = (
        session.query(Call)
        .filter(Call.lead_id == lead_id, Call.summary.isnot(None))
        .order_by(Call.start_time.desc())
        .limit(3)  # Last 3 calls max
        .all()
    )
    if previous_calls:
        from langchain_core.messages import SystemMessage as SysMsg
        memory_lines = ["[PREVIOUS CALL CONTEXT — Use this to personalize the conversation]"]
        for prev in reversed(previous_calls):
            if prev.summary:
                try:
                    prev_summary = json.loads(prev.summary)
                    memory_lines.append(
                        f"- Call on {prev.start_time.strftime('%d %b') if prev.start_time else 'unknown date'}: "
                        f"Score={prev.final_score}, Category={prev.category.value if prev.category else 'cold'}, "
                        f"Topics={prev_summary.get('topics_covered', [])}, "
                        f"Objections={prev_summary.get('objections_raised', [])}, "
                        f"Action={prev_summary.get('recommended_next_action', 'unknown')}"
                    )
                except (json.JSONDecodeError, AttributeError):
                    pass
        if len(memory_lines) > 1:
            memory_lines.append("Use this context to pick up where you left off. Reference prior discussions naturally.")
            manager.state["messages"].append(SysMsg(content="\n".join(memory_lines)))
            logger.info(f"📚 Loaded {len(previous_calls)} previous call(s) for lead {lead_id}")

    # Create a call record
    call = Call(lead_id=lead_id)
    session.add(call)
    session.commit()
    call_id = call.id
    session.close()

    try:
        async def process_and_respond(user_text: str):
            logger.info(f"👤 User: {user_text}")

            # Send user transcript back to frontend
            await websocket.send_json({
                "event": WSEventType.TRANSCRIPT_USER,
                "text": user_text,
                "speaker": "user",
            })

            # Process through LangGraph
            t0 = time.time()
            result = await manager.process_user_input(user_text)
            llm_latency = time.time() - t0
            logger.info(f"⏱️ LLM Thinking (Groq) Latency: {llm_latency:.2f} seconds")

            # Save transcript to DB
            db_session = get_sync_session()
            db_session.add(Transcript(call_id=call_id, speaker="user", text=user_text))
            db_session.add(Transcript(call_id=call_id, speaker="agent", text=result["response"]))
            db_session.commit()
            db_session.close()

            # Generate TTS audio with Sarvam
            t1 = time.time()
            audio_bytes = await tts_sarvam(result["response"], language=result.get("language", "hinglish"))
            tts_latency = time.time() - t1
            logger.info(f"⏱️ TTS Generation (Sarvam) Latency: {tts_latency:.2f} seconds")
            logger.info(f"⏱️ Total Backend Processing Time: {(llm_latency + tts_latency):.2f} seconds")

            if audio_bytes:
                audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
                await websocket.send_json({
                    "event": "audio_response",
                    "audio": audio_b64
                })

            # Send agent response
            await websocket.send_json({
                "event": WSEventType.TRANSCRIPT_AGENT,
                "text": result["response"],
                "speaker": "agent",
            })

            # Send score update
            await websocket.send_json({
                "event": WSEventType.SCORE_UPDATE,
                "score": result["score"],
                "category": result["category"],
            })

            # Send objection detection events
            for obj in result["objections_handled"]:
                await websocket.send_json({
                    "event": WSEventType.OBJECTION_DETECTED,
                    "objection_id": obj,
                })

            # Send new signal events
            for signal in result["new_signals"]:
                await websocket.send_json({
                    "event": "signal_detected",
                    "signal": signal,
                })

            # Check for handoff trigger
            if result["handoff_triggered"]:
                await websocket.send_json({
                    "event": WSEventType.HANDOFF_TRIGGERED,
                    "score": result["score"],
                    "category": "hot",
                })

        while True:
            # Receive message from frontend
            data = await websocket.receive_text()
            message = json.loads(data)
            event_type = message.get("event")

            # ── TEXT INPUT (for text-chat mode or after STT) ──
            if event_type == "user_text":
                user_text = message.get("text", "")
                await process_and_respond(user_text)

            # ── AUDIO CHUNK (raw audio from mic) ──
            elif event_type == WSEventType.AUDIO_CHUNK:
                audio_data = message.get("audio", "")
                if audio_data:
                    # Decode base64 front-end audio
                    raw_audio_bytes = base64.b64decode(audio_data)
                    # Send to Sarvam STT
                    transcribed_text = await stt_sarvam(raw_audio_bytes, language=manager.state.get("language", "hinglish"))
                    if transcribed_text and transcribed_text.strip():
                        await process_and_respond(transcribed_text)
                    else:
                        logger.debug("STT returned empty text.")

            # ── INTERRUPT (barge-in) ──
            elif event_type == WSEventType.INTERRUPT:
                logger.info("🛑 Barge-in detected — stopping agent audio")
                manager.handle_interruption()
                await websocket.send_json({
                    "event": WSEventType.STOP_PLAYBACK,
                })

            # ── END CALL ──
            elif event_type == WSEventType.END_CALL:
                logger.info(f"📴 Call ended for lead {lead_id}")

                # Generate post-call summary
                summary_result = await manager.end_call()

                # Safely extract summary data (could be dict or string from LLM)
                summary_data = summary_result.get("summary", {})
                if isinstance(summary_data, str):
                    summary_data = {"summary": summary_data}
                elif summary_data is None:
                    summary_data = {}

                # Update DB records
                db_session = get_sync_session()
                call_record = db_session.query(Call).filter(Call.id == call_id).first()
                if call_record:
                    call_record.end_time = datetime.utcnow()
                    call_record.duration_seconds = summary_result.get("duration", 0)
                    call_record.final_score = summary_result.get("final_score", 30)
                    try:
                        call_record.category = LeadCategory(summary_result.get("category", "cold"))
                    except ValueError:
                        call_record.category = LeadCategory.COLD
                    call_record.summary = json.dumps(summary_data)
                    call_record.objections_raised = json.dumps(
                        manager.state.get("objections_handled", [])
                    )
                    call_record.next_action = summary_data.get(
                        "recommended_next_action", "nurture_later"
                    ) if isinstance(summary_data, dict) else "nurture_later"

                # Update lead status
                lead_record = db_session.query(Lead).filter(Lead.id == lead_id).first()
                if lead_record:
                    lead_record.score = summary_result.get("final_score", 30)
                    try:
                        lead_record.status = LeadCategory(summary_result.get("category", "cold"))
                    except ValueError:
                        lead_record.status = LeadCategory.COLD

                db_session.commit()
                db_session.close()

                # Send summary to frontend (flatten for easier consumption)
                await websocket.send_json({
                    "event": WSEventType.CALL_SUMMARY,
                    "data": {
                        "final_score": summary_result.get("final_score", 30),
                        "category": summary_result.get("category", "cold"),
                        "duration": summary_result.get("duration", 0),
                        "call_duration_seconds": summary_result.get("duration", 0),
                        "interest_score": summary_result.get("final_score", 30),
                        "lead_category": summary_result.get("category", "cold"),
                        "summary": summary_data.get("summary", "") if isinstance(summary_data, dict) else str(summary_data),
                        "topics_covered": summary_data.get("topics_covered", []) if isinstance(summary_data, dict) else [],
                        "objections_raised": summary_data.get("objections_raised", []) if isinstance(summary_data, dict) else [],
                        "objections_resolved": summary_data.get("objections_resolved", []) if isinstance(summary_data, dict) else [],
                        "engagement_signals": summary_data.get("engagement_signals", []) if isinstance(summary_data, dict) else [],
                        "recommended_next_action": summary_data.get("recommended_next_action", "nurture_later") if isinstance(summary_data, dict) else "nurture_later",
                        "key_quotes": summary_data.get("key_quotes", []) if isinstance(summary_data, dict) else [],
                    },
                })

                # ── WHATSAPP AUTO-SEND for Warm/Hot leads ──
                final_category = summary_result.get("category", "cold")
                # Reload lead from DB since previous session was closed
                db_session_wa = get_sync_session()
                lead_wa = db_session_wa.query(Lead).filter(Lead.id == lead_id).first()
                
                if lead_wa and final_category in ("warm", "hot"):
                    from app.whatsapp import send_whatsapp_followup
                    wa_result = await send_whatsapp_followup(
                        phone=lead_wa.phone,
                        name=lead_wa.name,
                        language=lead_wa.language.value if lead_wa.language else "hinglish",
                        category=final_category,
                    )
                    # Notify frontend about WhatsApp status
                    await websocket.send_json({
                        "event": "whatsapp_sent",
                        "data": {
                            "status": wa_result.get("status"),
                            "to": wa_result.get("to", ""),
                            "message": wa_result.get("body", ""),
                        },
                    })
                db_session_wa.close()

                break  # Close the WebSocket

    except WebSocketDisconnect:
        logger.info(f"📴 WebSocket disconnected for lead {lead_id}")
    except Exception as e:
        logger.error(f"❌ Error in WebSocket for lead {lead_id}: {e}")
        await websocket.send_json({
            "event": WSEventType.ERROR,
            "message": str(e),
        })
    finally:
        # Cleanup
        active_conversations.pop(session_id, None)


# ============================================================================
# RUN
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )

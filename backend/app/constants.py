"""
VartaSync — WebSocket Protocol & Scoring Constants
====================================================
Phase 0: "Measure twice, cut once."
Every WebSocket event and scoring rule is defined here.
Both backend and frontend reference this as the single source of truth.
"""

from enum import Enum
from typing import Literal


# ============================================================================
# WEBSOCKET EVENT PROTOCOL
# ============================================================================

class WSEventType:
    """All WebSocket event types used between frontend and backend."""

    # --- Frontend → Backend ---
    AUDIO_CHUNK = "audio_chunk"          # Raw audio data from mic
    INTERRUPT = "interrupt"              # User started speaking while AI talks
    END_CALL = "end_call"                # User ends the call
    START_CALL = "start_call"            # User initiates a new call

    # --- Backend → Frontend ---
    TRANSCRIPT_USER = "transcript_user"          # User's speech transcribed
    TRANSCRIPT_AGENT = "transcript_agent"        # Agent's response text
    TRANSCRIPT_AGENT_PARTIAL = "transcript_agent_partial"  # Streaming token
    AUDIO_RESPONSE = "audio_response"            # TTS audio chunk to play
    SCORE_UPDATE = "score_update"                # Lead score changed
    OBJECTION_DETECTED = "objection_detected"    # Objection identified
    CALL_SUMMARY = "call_summary"                # Post-call JSON summary
    STOP_PLAYBACK = "stop_playback"              # Stop audio (barge-in)
    HANDOFF_TRIGGERED = "handoff_triggered"      # Score hit Hot threshold
    ERROR = "error"                              # Error message


# ============================================================================
# LEAD SCORING RUBRIC — ALL MATH HAPPENS IN PYTHON, NOT THE LLM
# ============================================================================

BASE_SCORE = 30  # Every lead starts here (they answered the call)

# Positive signals the LLM emits as tags — Python adds the points
POSITIVE_SIGNALS = {
    "asks_for_signup":        15,   # "How do I sign up?" / "Send me the link"
    "mentions_clients":       15,   # "I have about 50 clients" / "I manage portfolios"
    "asks_about_payouts":     10,   # "How do daily payouts work?"
    "asks_about_brokerage":   10,   # "Is it really 100%?"
    "asks_about_rise_portal": 10,   # "Tell me about the RISE Portal"
    "engaged_beyond_2min":    10,   # Conversation lasted > 2 minutes
    "positive_reaction":      10,   # "Interesting" / "Tell me more"
    "asks_clarifying_question": 5,  # Any genuine question about the program
}

# Negative signals
NEGATIVE_SIGNALS = {
    "not_interested":         -20,  # "Not interested" / "Don't call again"
    "will_think_about_it":    -15,  # "I'll think about it" (without engagement)
    "hung_up_early":          -10,  # Disconnected within 60 seconds
    "one_word_answers":       -10,  # Consistently short, disengaged replies
    "sounds_distracted":      -5,   # Off-topic, not paying attention
}

# Classification thresholds
SCORE_HOT_THRESHOLD = 70    # 70-100 → Immediate RM handoff
SCORE_WARM_THRESHOLD = 40   # 40-69  → WhatsApp follow-up
# 0-39 → Cold → Log for nurture campaign


class LeadCategory(str, Enum):
    HOT = "hot"
    WARM = "warm"
    COLD = "cold"


def classify_lead(score: int) -> LeadCategory:
    """Classify a lead based on their score."""
    if score >= SCORE_HOT_THRESHOLD:
        return LeadCategory.HOT
    elif score >= SCORE_WARM_THRESHOLD:
        return LeadCategory.WARM
    else:
        return LeadCategory.COLD


# ============================================================================
# OBJECTION IDS — Maps to Appendix A rebuttals
# ============================================================================

class ObjectionType(str, Enum):
    EXISTING_BROKER = "existing_broker"        # "I already have a broker"
    NO_CONTACTS = "no_contacts"                # "I don't have enough contacts"
    SUPPORT_CONCERN = "support_concern"        # "Who handles client support?"
    TRUST = "trust"                            # "Is Rupeezy trustworthy?"
    DELAY = "delay"                            # "I'll think about it / call later"


# The 5 objections with their Appendix A rebuttals — O(1) lookup, no RAG needed
OBJECTION_REBUTTALS = {
    ObjectionType.EXISTING_BROKER: {
        "trigger_phrases": [
            "already have a broker", "already with another broker",
            "already working with", "pehle se broker hai",
            "mere paas broker hai", "existing broker"
        ],
        "rebuttal_en": (
            "That's actually great — it means you already understand the business. "
            "But let me ask you: are you getting 100% of your brokerage share? "
            "Most brokers cap you at 60-70% and pay monthly. With Rupeezy, you keep "
            "100% and get daily payouts through the RISE Portal. You can run both "
            "simultaneously and compare for yourself."
        ),
        "rebuttal_hi": (
            "Yeh toh achhi baat hai — iska matlab aap business samajhte hain. "
            "Lekin ek sawaal — kya aapko 100% brokerage share mil raha hai? "
            "Zyaadatar brokers 60-70% dete hain aur monthly pay karte hain. "
            "Rupeezy mein aapko 100% milta hai aur daily payouts RISE Portal se. "
            "Aap dono saath mein chala sakte hain aur khud compare kar sakte hain."
        ),
    },
    ObjectionType.NO_CONTACTS: {
        "trigger_phrases": [
            "don't have enough contacts", "not enough clients",
            "mere paas contacts nahi", "clients nahi hain",
            "no network", "small network", "no contacts"
        ],
        "rebuttal_en": (
            "You don't need hundreds of clients to start. Even 5-10 active traders "
            "can generate meaningful income at 100% brokerage share. Plus, Rupeezy "
            "provides you marketing materials and support through the RISE Portal "
            "to help you grow your network. Many of our top partners started with "
            "just their friends and family."
        ),
        "rebuttal_hi": (
            "Aapko hundreds of clients ki zaroorat nahi hai. Sirf 5-10 active traders "
            "se bhi acchi income ho sakti hai jab aapko 100% brokerage share mil raha ho. "
            "Aur Rupeezy aapko marketing materials aur RISE Portal se support deta hai "
            "network grow karne ke liye. Hamare bahut se top partners ne apne friends "
            "aur family se hi start kiya tha."
        ),
    },
    ObjectionType.SUPPORT_CONCERN: {
        "trigger_phrases": [
            "who handles support", "client issues", "customer support",
            "clients face issues", "support kaun dega",
            "problem aayi toh", "issues hue toh"
        ],
        "rebuttal_en": (
            "Great question — this is something Rupeezy handles completely. Your clients "
            "get direct access to Rupeezy's support team. You don't have to manage "
            "technical issues, KYC problems, or trading queries. Your job is just to "
            "bring clients in — Rupeezy handles the rest. You also get a dedicated "
            "Relationship Manager for any partner-level concerns."
        ),
        "rebuttal_hi": (
            "Bahut achha sawaal hai. Yeh Rupeezy completely handle karta hai. Aapke "
            "clients ko Rupeezy ki support team ka direct access milta hai. Aapko "
            "technical issues, KYC problems ya trading queries manage nahi karni padti. "
            "Aapka kaam sirf clients laana hai — baaki sab Rupeezy dekhta hai. Aur "
            "aapko ek dedicated Relationship Manager bhi milta hai."
        ),
    },
    ObjectionType.TRUST: {
        "trigger_phrases": [
            "is rupeezy trustworthy", "can I trust", "reliable", "trustworthy",
            "bharosa kaise karein", "trust kaise karein", "company trust", "is it safe",
            "genuine hai kya", "safe hai kya", "fraud toh nahi", "scam", "fake"
        ],
        "rebuttal_en": (
            "Absolutely valid concern. Rupeezy is a SEBI-registered stockbroker — "
            "you can verify this on SEBI's official website. We're regulated by both "
            "NSE and BSE. Your clients' funds go directly to exchange-approved accounts, "
            "not to Rupeezy. Over 10,000 partners are already active on our platform. "
            "And with the RISE Portal, you can track every single transaction in real-time."
        ),
        "rebuttal_hi": (
            "Bilkul valid concern hai. Rupeezy ek SEBI-registered stockbroker hai — "
            "aap SEBI ki official website pe verify kar sakte hain. Hum NSE aur BSE "
            "dono se regulated hain. Aapke clients ke funds directly exchange-approved "
            "accounts mein jaate hain, Rupeezy ke paas nahi. 10,000 se zyaada partners "
            "already hamare platform pe active hain. Aur RISE Portal pe aap har ek "
            "transaction real-time mein track kar sakte hain."
        ),
    },
    ObjectionType.DELAY: {
        "trigger_phrases": [
            "think about it", "call me later", "not now",
            "sochna padega", "baad mein call karna",
            "abhi nahi", "let me think", "will decide later"
        ],
        "rebuttal_en": (
            "Of course, take your time. But I want to mention — the zero joining fee "
            "offer and 100% brokerage share is our current program structure. There's "
            "no commitment to start — you can sign up in 2 minutes and explore the "
            "RISE Portal yourself. Would you like me to send you the signup link on "
            "WhatsApp so you can check it out whenever you're ready?"
        ),
        "rebuttal_hi": (
            "Bilkul, aap apna time lein. Lekin ek baat bata doon — zero joining fee "
            "aur 100% brokerage share yeh hamare current program ka structure hai. "
            "Start karne mein koi commitment nahi hai — aap 2 minute mein signup "
            "karke RISE Portal khud explore kar sakte hain. Kya main aapko WhatsApp "
            "pe signup link bhej doon taaki aap jab chaahein check kar sakein?"
        ),
    },
}


# ============================================================================
# RUPEEZY AP PROGRAM — KEY BENEFITS (for prompt injection)
# ============================================================================

RUPEEZY_BENEFITS = {
    "zero_joining_fee": "No joining fee or upfront cost to become an Authorized Person",
    "full_brokerage_share": "100% brokerage share (vs. industry standard 60-70%)",
    "daily_payouts": "Daily commission payouts through the RISE Portal",
    "rise_portal": "All-in-one RISE Portal for tracking earnings, clients, and payouts in real-time",
    "sebi_registered": "SEBI-registered, NSE & BSE regulated stockbroker",
    "dedicated_rm": "Dedicated Relationship Manager for partner support",
    "marketing_support": "Ready-made marketing materials and brochures provided",
    "no_commitment": "No lock-in — sign up in 2 minutes and explore freely",
}


# ============================================================================
# CONVERSATION LIMITS
# ============================================================================

MAX_CONTEXT_TOKENS = 4000           # Sliding window limit before summarization
ENGAGEMENT_THRESHOLD_SECONDS = 120  # 2 minutes = "engaged" signal
COLD_HANGUP_THRESHOLD_SECONDS = 60  # Hung up within 60s = negative signal


# ============================================================================
# SUPPORTED LANGUAGES
# ============================================================================

class Language(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"
    HINGLISH = "hinglish"
    KANNADA = "kannada"

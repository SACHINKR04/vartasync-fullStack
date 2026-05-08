"""
VartaSync — LangGraph Conversation State Machine
==================================================
A true graph with conditional routing — not a single-node wrapper.

Nodes:
  1. conversation_node  — Standard chat loop
  2. objection_node     — Handles the 5 core objections with Appendix A rebuttals
  3. handoff_node       — Triggers RM handoff for hot leads
  4. summarization_node — Generates post-call JSON summary

Routing:
  - Keyword pre-routing (regex) catches obvious objections before LLM
  - LLM intent detection handles ambiguous cases
  - Score threshold triggers handoff
"""

import json
import logging
import re
from typing import TypedDict, Literal, Annotated, Optional
from dataclasses import dataclass

from langgraph.graph import StateGraph, END

logger = logging.getLogger("vartasync")
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.constants import (
    OBJECTION_REBUTTALS,
    ObjectionType,
    LeadCategory,
    SCORE_HOT_THRESHOLD,
    MAX_CONTEXT_TOKENS,
)
from app.prompts import build_system_prompt
from app.scoring import LeadScoreState
from app.config import get_settings


# ============================================================================
# STATE DEFINITION
# ============================================================================

class ConversationState(TypedDict):
    """The typed state that flows through the LangGraph."""
    messages: list                     # Chat history (SystemMessage, HumanMessage, AIMessage)
    current_node: str                  # Which node we're in
    language: str                      # Detected language (english/hindi/hinglish)
    score: int                         # Current lead score
    category: str                      # hot/warm/cold
    objections_handled: list[str]      # List of objection IDs resolved
    objection_detected: Optional[str]  # Current objection to handle (if any)
    signals_detected: list[str]        # All scoring signals detected
    user_input: str                    # Latest user input
    agent_response: str                # Latest agent response (raw, with signals)
    agent_response_clean: str          # Agent response without signal tags
    call_active: bool                  # Whether the call is still ongoing
    handoff_triggered: bool            # Whether RM handoff was triggered
    summary: Optional[dict]            # Post-call summary JSON


# ============================================================================
# KEYWORD PRE-ROUTER — Catches objections before LLM (deterministic safety net)
# ============================================================================

def detect_objection_by_keywords(user_input: str) -> Optional[str]:
    """
    Fast keyword scan to detect objections deterministically.
    This runs BEFORE the LLM, catching obvious cases without latency.
    Returns the objection type string or None.
    """
    user_lower = user_input.lower()

    for obj_type, data in OBJECTION_REBUTTALS.items():
        for phrase in data["trigger_phrases"]:
            if phrase.lower() in user_lower:
                return obj_type.value

    return None


# ============================================================================
# LANGUAGE DETECTION
# ============================================================================

def detect_language(text: str) -> str:
    """
    Simple language detection based on script analysis.
    Hindi/Devanagari script → hindi
    Kannada script → kannada
    Mixed Roman with Hindi words → hinglish
    Pure English → english
    """
    # Check for Devanagari script (Hindi)
    devanagari_pattern = re.compile(r'[\u0900-\u097F]')
    if devanagari_pattern.search(text):
        return "hindi"

    # Check for Kannada script
    kannada_pattern = re.compile(r'[\u0C80-\u0CFF]')
    if kannada_pattern.search(text):
        return "kannada"

    # Common Hinglish indicators (Hindi words in Roman script)
    hinglish_words = [
        "hai", "hain", "nahi", "kya", "mein", "ke", "ka", "ki",
        "hoon", "aap", "yeh", "woh", "kaise", "kab", "kahan",
        "achha", "theek", "bilkul", "matlab", "paas", "bhai",
        "sir", "ji", "aur", "lekin", "toh", "abhi", "bahut",
        "chahiye", "bolo", "batao", "suno", "dekho", "chalo",
        "bol", "raha", "rahi", "mere", "mera", "tera", "apna",
        "pehle", "baad", "zyaada", "sochna", "padega",
    ]

    words = text.lower().split()
    hindi_word_count = sum(1 for w in words if w in hinglish_words)

    if hindi_word_count >= 2 or (len(words) > 0 and hindi_word_count / max(len(words), 1) > 0.3):
        return "hinglish"

    return "english"


# ============================================================================
# GRAPH NODES
# ============================================================================

async def conversation_node(state: ConversationState) -> ConversationState:
    """
    Main conversation loop. Handles general chat, pitching, and engagement.
    The LLM generates a response and may emit SIGNAL/OBJECTION tags.
    """
    settings = get_settings()
    llm = ChatGroq(
        model=settings.llm_model,
        api_key=settings.groq_api_key,
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens,
        max_retries=0, # Fail fast on rate limits instead of blocking for 30s
    )

    # Detect language from the first user message if not already set
    # Respect user's preferred language from their profile (passed from main.py)
    current_lang = state.get("language", "auto")
    if not current_lang or current_lang == "auto":
        detected = detect_language(state["user_input"])
        state["language"] = detected
        logger.info(f"🌐 Auto-detected language: {detected}")
    else:
        # User has a preferred language set - stick with it unless they switch scripts
        # Only override if specific script detected (clear language switch)
        devanagari_pattern = re.compile(r'[\u0900-\u097F]')
        kannada_pattern = re.compile(r'[\u0C80-\u0CFF]')
        
        if devanagari_pattern.search(state["user_input"]) and current_lang != "hindi":
            state["language"] = "hindi"
            logger.info(f"🌐 User switched to Hindi script, overriding to: hindi")
        elif kannada_pattern.search(state["user_input"]) and current_lang != "kannada":
            state["language"] = "kannada"
            logger.info(f"🌐 User switched to Kannada script, overriding to: kannada")

    # Build or update system prompt with detected language
    system_msg = SystemMessage(content=build_system_prompt(state["language"]))

    # Prepare messages: system + conversation history + current input
    messages = [system_msg] + state["messages"] + [HumanMessage(content=state["user_input"])]

    # Invoke LLM
    try:
        response = await llm.ainvoke(messages)
        agent_text = response.content
    except Exception as e:
        print(f"LLM Error in conversation_node: {e}")
        # Fallback if we hit a Rate Limit or other API error
        lang = state.get("language", "hinglish")
        if lang in ("hindi", "hinglish"):
            agent_text = "[SIGNAL: null] Maaf kijiyega, mujhe sunne mein thodi dikkat aayi. Kya aap phir se bol sakte hain?"
        else:
            agent_text = "[SIGNAL: null] I'm sorry, I missed that. Could you please repeat?"

    # Update state
    state["agent_response"] = agent_text
    state["current_node"] = "conversation"

    # Add to message history
    state["messages"].append(HumanMessage(content=state["user_input"]))
    state["messages"].append(AIMessage(content=agent_text))

    return state


async def objection_node(state: ConversationState) -> ConversationState:
    """
    Specialized objection handling node.
    When a known objection is detected (by keyword or LLM), this node
    ensures the response uses Appendix A knowledge while sounding natural.
    """
    settings = get_settings()
    llm = ChatGroq(
        model=settings.llm_model,
        api_key=settings.groq_api_key,
        temperature=settings.llm_temperature,
        max_tokens=settings.llm_max_tokens,
        max_retries=0, # Fail fast on rate limits
    )

    objection_id = state.get("objection_detected")
    if not objection_id:
        # Fallback to conversation node if no objection found
        return await conversation_node(state)

    # Get the specific rebuttal data
    try:
        obj_type = ObjectionType(objection_id)
        rebuttal_data = OBJECTION_REBUTTALS[obj_type]
    except (ValueError, KeyError):
        return await conversation_node(state)

    # Choose rebuttal language
    lang = state.get("language", "hinglish")
    if lang == "hindi" or lang == "hinglish":
        rebuttal_reference = rebuttal_data["rebuttal_hi"]
    else:
        rebuttal_reference = rebuttal_data["rebuttal_en"]

    # Build a focused objection-handling prompt
    objection_prompt = f"""The user just raised an objection: "{state['user_input']}"

This is the "{objection_id.replace('_', ' ')}" objection. Here is the reference rebuttal:
"{rebuttal_reference}"

IMPORTANT: Do NOT copy this rebuttal word-for-word. Adapt it naturally to what the user actually said. Keep it conversational, warm, and under 3 sentences. Respond in {lang}.

Also emit the appropriate [OBJECTION: {objection_id}] tag and any [SIGNAL: ...] tags you detect."""

    system_msg = SystemMessage(content=build_system_prompt(state.get("language", "hinglish")))
    messages = [system_msg] + state["messages"] + [HumanMessage(content=objection_prompt)]

    try:
        response = await llm.ainvoke(messages)
        agent_text = response.content
    except Exception as e:
        print(f"LLM Error in objection_node: {e}")
        # Standard fallback for the objection if rate limited
        lang = state.get("language", "hinglish")
        agent_text = f"[OBJECTION: {objection_id}] " + (
            "Bilkul, main samajh raha hoon. Kya hum is baare mein detail mein aage baat kar sakte hain?"
            if lang in ("hindi", "hinglish") else 
            "I completely understand your concern. Can we discuss this in more detail?"
        )

    # Track the objection as handled
    if objection_id not in state["objections_handled"]:
        state["objections_handled"].append(objection_id)

    state["agent_response"] = agent_text
    state["current_node"] = "objection"
    state["objection_detected"] = None  # Reset

    # Add to history
    state["messages"].append(HumanMessage(content=state["user_input"]))
    state["messages"].append(AIMessage(content=agent_text))

    return state


async def handoff_node(state: ConversationState) -> ConversationState:
    """
    Triggered when score >= 70 (Hot lead).
    The agent closes the conversation and initiates RM handoff.
    """
    lang = state.get("language", "hinglish")

    if lang in ("hindi", "hinglish"):
        handoff_msg = (
            "[SIGNAL: asks_for_signup] Bahut achha! Aap bilkul ready hain. "
            "Main abhi aapko hamari team ke senior Relationship Manager se connect "
            "karta hoon jo aapka signup complete karwa denge. Bas 2 minute lagenge. "
            "Aapka din bahut achha ho!"
        )
    else:
        handoff_msg = (
            "[SIGNAL: asks_for_signup] Excellent! You're all set. "
            "I'm connecting you right now with our senior Relationship Manager "
            "who will help you complete the signup. It'll take just 2 minutes. "
            "Thank you for your time!"
        )

    state["agent_response"] = handoff_msg
    state["current_node"] = "handoff"
    state["handoff_triggered"] = True

    state["messages"].append(HumanMessage(content=state["user_input"]))
    state["messages"].append(AIMessage(content=handoff_msg))

    return state


async def summarization_node(state: ConversationState) -> ConversationState:
    """
    Terminal node — runs after the call ends.
    Generates a structured JSON post-call summary from the full transcript.
    """
    settings = get_settings()
    llm = ChatGroq(
        model=settings.llm_model,
        api_key=settings.groq_api_key,
        temperature=0.2,  # Low temperature for structured output
        max_tokens=1024,
    )

    # Build transcript text from messages
    transcript_lines = []
    for msg in state["messages"]:
        if isinstance(msg, HumanMessage):
            transcript_lines.append(f"Lead: {msg.content}")
        elif isinstance(msg, AIMessage):
            # Clean signal tags for the summary
            clean = re.sub(r"\[SIGNAL:\s*\w+\]", "", msg.content)
            clean = re.sub(r"\[OBJECTION:\s*\w+\]", "", clean).strip()
            transcript_lines.append(f"Agent: {clean}")

    transcript_text = "\n".join(transcript_lines)

    summary_prompt = f"""Analyze the following sales call transcript and generate a JSON summary.

TRANSCRIPT:
{transcript_text}

RULES FOR recommended_next_action:
- If lead_category is "hot" (score >= 70): Use "handoff_to_rm"
- If lead_category is "warm" (score 40-69): Use "whatsapp_followup"
- If lead_category is "cold" (score < 40): Use "nurture_later"

OUTPUT FORMAT (strict JSON, no markdown):
{{
    "call_duration_seconds": {state.get("score", 0)},
    "topics_covered": ["list of main topics discussed"],
    "objections_raised": {json.dumps(state.get("objections_handled", []))},
    "objections_resolved": ["list of objections successfully handled"],
    "interest_score": {state.get("score", 30)},
    "lead_category": "{state.get("category", "cold")}",
    "engagement_signals": {json.dumps(state.get("signals_detected", []))},
    "recommended_next_action": "CHOOSE ONE: handoff_to_rm OR whatsapp_followup OR nurture_later (see rules above)",
    "summary": "2-3 sentence summary of the conversation",
    "key_quotes": ["1-2 notable quotes from the lead"]
}}

Return ONLY the JSON object, no other text."""

    response = await llm.ainvoke([HumanMessage(content=summary_prompt)])

    try:
        summary = json.loads(response.content)
    except json.JSONDecodeError:
        # Fallback: extract JSON from response
        json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
        if json_match:
            try:
                summary = json.loads(json_match.group())
            except json.JSONDecodeError:
                summary = {
                    "error": "Failed to parse summary",
                    "raw": response.content,
                    "score": state.get("score", 30),
                    "category": state.get("category", "cold"),
                }
        else:
            summary = {
                "error": "Failed to parse summary",
                "raw": response.content,
                "score": state.get("score", 30),
                "category": state.get("category", "cold"),
            }

    state["summary"] = summary
    state["current_node"] = "summarization"
    state["call_active"] = False

    return state


# ============================================================================
# CONDITIONAL ROUTING
# ============================================================================

def route_after_input(state: ConversationState) -> str:
    """
    Determines which node to route to based on the user's input.
    Priority: keyword objection detection → score threshold → default conversation.
    """
    user_input = state.get("user_input", "")

    # 1. Check if call is ending
    if not state.get("call_active", True):
        return "summarize"

    # 2. Check score threshold for handoff
    if state.get("score", 0) >= SCORE_HOT_THRESHOLD and not state.get("handoff_triggered"):
        return "handoff"

    # 3. Keyword-based objection detection (fast, deterministic)
    objection = detect_objection_by_keywords(user_input)
    if objection:
        state["objection_detected"] = objection
        return "objection"

    # 4. Default: normal conversation
    return "conversation"


# ============================================================================
# GRAPH BUILDER
# ============================================================================

def build_conversation_graph() -> StateGraph:
    """
    Build and compile the LangGraph conversation state machine.

    Flow:
        [User Input] → Router → conversation_node ─→ END (wait for next input)
                              → objection_node   ─→ END (wait for next input)
                              → handoff_node     ─→ END (call complete)
                              → summarization_node → END (final)
    """
    graph = StateGraph(ConversationState)

    # Add nodes
    graph.add_node("conversation", conversation_node)
    graph.add_node("objection", objection_node)
    graph.add_node("handoff", handoff_node)
    graph.add_node("summarize", summarization_node)

    # Set conditional entry point based on routing logic
    graph.set_conditional_entry_point(route_after_input)

    # All conversation/objection nodes return to END (waiting for next user input)
    graph.add_edge("conversation", END)
    graph.add_edge("objection", END)
    graph.add_edge("handoff", END)
    graph.add_edge("summarize", END)

    return graph.compile()


# ============================================================================
# CONVERSATION MANAGER — High-level interface for the WebSocket handler
# ============================================================================

class ConversationManager:
    """
    Manages a single call session. Wraps LangGraph + Scoring.
    The WebSocket handler creates one of these per call.
    """

    def __init__(self, preferred_language: str = "auto"):
        self.graph = build_conversation_graph()
        self.scorer = LeadScoreState()
        self.state: ConversationState = {
            "messages": [],
            "current_node": "conversation",
            "language": preferred_language if preferred_language != "auto" else "auto",
            "score": self.scorer.score,
            "category": self.scorer.category.value,
            "objections_handled": [],
            "objection_detected": None,
            "signals_detected": [],
            "user_input": "",
            "agent_response": "",
            "agent_response_clean": "",
            "call_active": True,
            "handoff_triggered": False,
            "summary": None,
        }
        self.scorer.start_call()

    async def process_user_input(self, user_input: str) -> dict:
        """
        Process a user message through the graph and return the result.

        Returns:
            dict with keys: response, score, category, signals, objections, handoff
        """
        # Update state with new input
        self.state["user_input"] = user_input
        self.state["score"] = self.scorer.score

        # Run the graph
        result = await self.graph.ainvoke(self.state)

        # Update our state from the graph result
        self.state.update(result)

        # Extract and apply scoring signals from LLM output
        raw_response = self.state.get("agent_response", "")
        new_signals = self.scorer.extract_and_apply_signals(raw_response)
        clean_response = self.scorer.clean_llm_output(raw_response)

        # Detect objection tags in LLM output
        objection_matches = re.findall(r"\[OBJECTION:\s*(\w+)\]", raw_response)
        valid_objections = [o.value for o in ObjectionType]
        for obj in objection_matches:
            obj_clean = obj.lower()
            if obj_clean in valid_objections and obj_clean not in self.state["objections_handled"]:
                self.state["objections_handled"].append(obj_clean)

        # Remove objection tags from clean response
        clean_response = re.sub(r"\[OBJECTION:\s*\w+\]", "", clean_response).strip()

        # Update state with scoring results
        self.state["score"] = self.scorer.score
        self.state["category"] = self.scorer.category.value
        self.state["signals_detected"] = self.scorer.signals_detected
        self.state["agent_response_clean"] = clean_response

        return {
            "response": clean_response,
            "score": self.scorer.score,
            "category": self.scorer.category.value,
            "new_signals": new_signals,
            "all_signals": self.scorer.signals_detected,
            "objections_handled": self.state["objections_handled"],
            "handoff_triggered": self.state.get("handoff_triggered", False),
            "language": self.state.get("language", "auto"),
        }

    async def end_call(self) -> dict:
        """End the call and generate the post-call summary."""
        self.scorer.end_call()
        self.state["call_active"] = False
        self.state["score"] = self.scorer.score
        self.state["category"] = self.scorer.category.value

        # Force state to route to summary
        self.state["call_complete"] = True

        # Run summarization manually since the call is ending
        result = await summarization_node(self.state)
        self.state.update(result)

        return {
            "summary": self.state.get("summary", {}),
            "final_score": self.scorer.score,
            "category": self.scorer.category.value,
            "duration": self.scorer.call_duration_seconds,
        }

    def handle_interruption(self) -> None:
        """Handle barge-in: append interruption marker to message history."""
        self.state["messages"].append(
            AIMessage(content="[User Interrupted — stopped speaking]")
        )

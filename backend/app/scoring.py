"""
VartaSync — Python-Based Scoring Engine
=========================================
The LLM emits signal tags like [SIGNAL: asks_for_signup].
This module reads those tags and does the actual math.
LLMs don't do arithmetic — Python does.
"""

import re
import time
from dataclasses import dataclass, field
from typing import Optional

from app.constants import (
    BASE_SCORE,
    POSITIVE_SIGNALS,
    NEGATIVE_SIGNALS,
    SCORE_HOT_THRESHOLD,
    SCORE_WARM_THRESHOLD,
    ENGAGEMENT_THRESHOLD_SECONDS,
    COLD_HANGUP_THRESHOLD_SECONDS,
    LeadCategory,
    classify_lead,
)


# Regex to extract signal tags from LLM output
# The LLM is instructed to emit: [SIGNAL: signal_name]
SIGNAL_PATTERN = re.compile(r"\[SIGNAL:\s*(\w+)\]", re.IGNORECASE)


@dataclass
class LeadScoreState:
    """Tracks a lead's score throughout a conversation."""

    score: int = BASE_SCORE
    signals_detected: list[str] = field(default_factory=list)
    call_start_time: Optional[float] = None
    call_end_time: Optional[float] = None
    engagement_bonus_applied: bool = False
    hangup_penalty_applied: bool = False

    @property
    def category(self) -> LeadCategory:
        return classify_lead(self.score)

    @property
    def call_duration_seconds(self) -> float:
        if self.call_start_time is None:
            return 0.0
        end = self.call_end_time or time.time()
        return end - self.call_start_time

    def start_call(self) -> None:
        """Mark the beginning of a call."""
        self.call_start_time = time.time()

    def end_call(self) -> None:
        """Mark the end of a call and apply time-based signals."""
        self.call_end_time = time.time()
        self._apply_time_based_signals()

    def _apply_time_based_signals(self) -> None:
        """Apply scoring adjustments based on call duration."""
        duration = self.call_duration_seconds

        # Positive: engaged beyond 2 minutes
        if duration >= ENGAGEMENT_THRESHOLD_SECONDS and not self.engagement_bonus_applied:
            points = POSITIVE_SIGNALS.get("engaged_beyond_2min", 0)
            self.score += points
            self.signals_detected.append("engaged_beyond_2min")
            self.engagement_bonus_applied = True

        # Negative: hung up within 60 seconds
        if duration <= COLD_HANGUP_THRESHOLD_SECONDS and not self.hangup_penalty_applied:
            points = NEGATIVE_SIGNALS.get("hung_up_early", 0)
            self.score += points  # points is already negative
            self.signals_detected.append("hung_up_early")
            self.hangup_penalty_applied = True

    def extract_and_apply_signals(self, llm_output: str) -> list[str]:
        """
        Parse LLM output for [SIGNAL: xxx] tags, apply scoring, and return
        the list of newly detected signals.

        The LLM is instructed to emit these tags in its response. We strip
        them before showing the text to the user.
        """
        new_signals = []
        matches = SIGNAL_PATTERN.findall(llm_output)

        for signal_name in matches:
            signal_name = signal_name.lower().strip()

            # Skip duplicates — don't double-count the same signal
            if signal_name in self.signals_detected:
                continue

            # Check positive signals
            if signal_name in POSITIVE_SIGNALS:
                self.score += POSITIVE_SIGNALS[signal_name]
                self.signals_detected.append(signal_name)
                new_signals.append(signal_name)

            # Check negative signals
            elif signal_name in NEGATIVE_SIGNALS:
                self.score += NEGATIVE_SIGNALS[signal_name]
                self.signals_detected.append(signal_name)
                new_signals.append(signal_name)

        # Clamp score to 0-100
        self.score = max(0, min(100, self.score))

        return new_signals

    def clean_llm_output(self, llm_output: str) -> str:
        """Remove [SIGNAL: xxx] tags from LLM output before displaying to user."""
        return SIGNAL_PATTERN.sub("", llm_output).strip()

    def to_dict(self) -> dict:
        """Serialize for WebSocket transmission and post-call summary."""
        return {
            "score": self.score,
            "category": self.category.value,
            "signals_detected": self.signals_detected,
            "call_duration_seconds": round(self.call_duration_seconds, 1),
        }

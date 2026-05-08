"""
VartaSync -- Text-Only CLI Test Script
=======================================
Tests the LangGraph brain without any audio pipeline.

Usage:
    python -m app.test_brain
"""

import asyncio
import sys
import os

# Fix Windows console encoding for emoji/unicode
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stdin.reconfigure(encoding="utf-8", errors="replace")
    os.system("")  # Enable ANSI colors on Windows

from app.graph import ConversationManager
from app.constants import LeadCategory


def cprint(text: str, color: str = "white"):
    """Print with ANSI colors (Windows-safe)."""
    codes = {
        "green": "\033[92m", "blue": "\033[94m", "yellow": "\033[93m",
        "red": "\033[91m", "cyan": "\033[96m", "magenta": "\033[95m",
        "white": "\033[97m", "reset": "\033[0m",
    }
    c = codes.get(color, codes["white"])
    try:
        print(f"{c}{text}{codes['reset']}")
    except UnicodeEncodeError:
        # Strip non-ASCII if console can't handle it
        safe = text.encode("ascii", errors="replace").decode("ascii")
        print(f"{c}{safe}{codes['reset']}")


def print_score_bar(score: int, category: str):
    """Print a visual score bar."""
    filled = int(score / 100 * 30)
    empty = 30 - filled
    labels = {"hot": ("RED", "[HOT]"), "warm": ("YEL", "[WARM]"), "cold": ("BLU", "[COLD]")}
    _, label = labels.get(category, ("BLU", "[COLD]"))
    color = {"hot": "\033[91m", "warm": "\033[93m", "cold": "\033[94m"}.get(category, "\033[94m")
    bar = f"  {color}{'#' * filled}{'.' * empty}\033[0m {score}/100 {label}"
    print(bar)


async def main():
    cprint("\n" + "=" * 60, "cyan")
    cprint("  VartaSync -- Text-Only Brain Test", "cyan")
    cprint("  Type messages as if you are on a phone call.", "cyan")
    cprint("  Type 'quit' to end the call and see the summary.", "cyan")
    cprint("=" * 60 + "\n", "cyan")

    manager = ConversationManager()

    cprint("[CALL STARTED] VartaSync is ready.\n", "green")
    cprint("[TIP] Try these test inputs:", "yellow")
    cprint('   - "Haan boliye, kaun bol raha hai?"', "yellow")
    cprint('   - "Mere paas pehle se broker hai"', "yellow")
    cprint('   - "Is it really 100% brokerage?"', "yellow")
    cprint('   - "Send me the signup link"', "yellow")
    cprint('   - "Nahi, interest nahi hai"\n', "yellow")

    while True:
        try:
            user_input = input("\n[YOU]: ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "end"):
            break

        cprint("\n[...Processing...]", "yellow")
        result = await manager.process_user_input(user_input)

        # Display agent response
        cprint(f"\n[VARTASYNC]: {result['response']}", "green")

        # Display scoring info
        cprint("\n[SCORE UPDATE]", "cyan")
        print_score_bar(result["score"], result["category"])

        if result["new_signals"]:
            cprint(f"  Signals: {', '.join(result['new_signals'])}", "magenta")

        if result["objections_handled"]:
            cprint(f"  Objections handled: {', '.join(result['objections_handled'])}", "yellow")

        if result["handoff_triggered"]:
            cprint("\n" + "!" * 50, "red")
            cprint("  >>> HOT LEAD: READY FOR RM HANDOFF! <<<", "red")
            cprint("!" * 50, "red")

        cprint(f"  Language: {result['language']}", "cyan")

    # End call and get summary
    cprint("\n[ENDING CALL...]\n", "yellow")
    summary = await manager.end_call()

    cprint("=" * 60, "cyan")
    cprint("  POST-CALL SUMMARY", "cyan")
    cprint("=" * 60, "cyan")
    cprint(f"  Duration: {summary['duration']:.1f} seconds", "white")
    cprint(f"  Final Score: {summary['final_score']}/100", "white")
    cprint(f"  Category: {summary['category'].upper()}", "white")

    if summary.get("summary"):
        cprint("\n  [AI SUMMARY]:", "green")
        import json
        cprint(json.dumps(summary["summary"], indent=4, ensure_ascii=False), "white")

    cprint("\n" + "=" * 60 + "\n", "cyan")


if __name__ == "__main__":
    asyncio.run(main())

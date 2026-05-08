"""
VartaSync — WhatsApp Follow-up Module
=======================================
Sends signup links to Warm leads after call ends.
Uses Twilio WhatsApp API (or simulates if no credentials).
"""

import logging
from app.config import get_settings

logger = logging.getLogger("vartasync")

SIGNUP_LINK = "https://partner.rupeezy.in/signup"

TEMPLATES = {
    "hindi": (
        "Namaste {name}! Main Pooja, Rupeezy se. "
        "Abhi humari baat hui thi partner program ke baare mein. "
        "Yahaan signup karein — sirf 2 minute lagenge, zero joining fee: {link}"
    ),
    "english": (
        "Hi {name}! This is Pooja from Rupeezy. "
        "Thanks for your time earlier discussing our partner program. "
        "Here's your signup link — takes just 2 minutes, zero joining fee: {link}"
    ),
    "hinglish": (
        "Hi {name}! Pooja here, Rupeezy se. "
        "Abhi humari achhi baat hui thi. Yeh raha aapka signup link — "
        "bas 2 minute, zero joining fee: {link}"
    ),
}


async def send_whatsapp_followup(
    phone: str,
    name: str,
    language: str = "hinglish",
    category: str = "warm",
) -> dict:
    """
    Send WhatsApp signup link to a lead.

    Args:
        phone: Lead's phone number (10 digits or with country code)
        name: Lead's name for personalization
        language: Message language
        category: Lead category (only 'warm' and 'hot' get messages)

    Returns:
        dict with status and message_sid (or simulation info)
    """
    if category not in ("warm", "hot"):
        logger.info(f"Skipping WhatsApp for {category} lead {name}")
        return {"status": "skipped", "reason": f"Category is {category}"}

    # Format phone for WhatsApp
    phone_clean = phone.replace(" ", "").replace("-", "").replace("+", "")
    if len(phone_clean) == 10:
        phone_clean = "91" + phone_clean  # Default to India
    whatsapp_to = f"whatsapp:+{phone_clean}"

    # Pick template
    template = TEMPLATES.get(language, TEMPLATES["hinglish"])
    message_body = template.format(name=name, link=SIGNUP_LINK)

    settings = get_settings()

    # If Twilio credentials are configured, send via Twilio
    if settings.twilio_account_sid and settings.twilio_auth_token:
        try:
            from twilio.rest import Client
            client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
            message = client.messages.create(
                body=message_body,
                from_=settings.twilio_whatsapp_from,
                to=whatsapp_to
            )
            logger.info(f"📱 WhatsApp sent to {name} ({phone}): SID={message.sid}")
            return {
                "status": "sent",
                "message_sid": message.sid,
                "to": whatsapp_to,
                "body": message_body,
            }
        except Exception as e:
            logger.error(f"❌ WhatsApp send failed for {name}: {e}")
            return {"status": "error", "error": str(e), "body": message_body}
    else:
        # Simulate — log what would be sent (for demo/hackathon)
        logger.info(
            f"📱 [SIMULATED] WhatsApp to {name} ({whatsapp_to}):\n"
            f"   {message_body}"
        )
        return {
            "status": "simulated",
            "to": whatsapp_to,
            "body": message_body,
            "note": "Twilio credentials not configured — message simulated",
        }

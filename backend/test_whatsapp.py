import asyncio
from app.whatsapp import send_whatsapp_followup

async def test():
    print("Testing WhatsApp Follow-up...")
    result = await send_whatsapp_followup(
        phone="8095713981",
        name="Sachin",
        language="hindi",
        category="warm"
    )
    print("Result:", result)

if __name__ == "__main__":
    asyncio.run(test())

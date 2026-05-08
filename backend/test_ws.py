"""Quick WebSocket end-to-end test."""
import asyncio
import json
import sys
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

async def test():
    # 1. Create a lead via REST
    req = urllib.request.Request(
        "http://localhost:8000/api/leads",
        data=json.dumps({"name": "Test User", "phone": "9876543210", "language": "hinglish"}).encode(),
        headers={"Content-Type": "application/json"},
    )
    resp = urllib.request.urlopen(req)
    lead = json.loads(resp.read())
    lead_id = lead["id"]
    print(f"[OK] Lead created: id={lead_id}, name={lead['name']}")

    # 2. Connect WebSocket
    import websockets
    async with websockets.connect(f"ws://localhost:8000/ws/call/{lead_id}") as ws:
        print("[OK] WebSocket connected")

        # 3. Send a user message
        await ws.send(json.dumps({"event": "user_text", "text": "Haan boliye, kaun bol raha hai?"}))
        print("[SENT] User text: 'Haan boliye, kaun bol raha hai?'")

        # 4. Collect responses
        for i in range(5):
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=30)
                data = json.loads(msg)
                event = data.get("event", "unknown")
                print(f"\n[RECV] Event: {event}")
                if "text" in data:
                    print(f"  Text: {str(data['text'])[:300]}")
                if "score" in data:
                    print(f"  Score: {data['score']} ({data.get('category', '')})")
                if "objection_id" in data:
                    print(f"  Objection: {data['objection_id']}")
            except asyncio.TimeoutError:
                print("[TIMEOUT] No more messages")
                break

        # 5. End call
        print("\n[SENDING] end_call...")
        await ws.send(json.dumps({"event": "end_call"}))
        try:
            summary_msg = await asyncio.wait_for(ws.recv(), timeout=30)
            summary = json.loads(summary_msg)
            print(f"[RECV] Summary event: {summary['event']}")
            if "data" in summary:
                print(f"  Final score: {summary['data'].get('final_score')}")
                print(f"  Category: {summary['data'].get('category')}")
        except asyncio.TimeoutError:
            print("[TIMEOUT] Summary timeout")

    print("\n[DONE] Test complete!")

if __name__ == "__main__":
    asyncio.run(test())

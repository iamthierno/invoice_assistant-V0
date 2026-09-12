from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
import json
import asyncio
from typing import Optional

# Import the agent factory
from core.main_agent import get_agent

router = APIRouter()

class CommandRequest(BaseModel):
    command: str
    invoice_id: Optional[str] = None

@router.post("/agent/command")
async def process_command(request: CommandRequest):
    """
    Process a natural language command using the Deep Agent.
    Returns a stream of NDJSON events.
    """
    agent = get_agent()
    
    # Construct the input for the agent
    # We include the invoice_id in the user message context if provided
    user_message = request.command
    if request.invoice_id:
        user_message = f"[CONTEXT] Current Invoice ID: {request.invoice_id}\n\n[USER COMMAND] {request.command}"
    
    async def event_stream():
        try:
            config = {"configurable": {"thread_id": "default_session"}}
            
            async for event in agent.astream(
                {"messages": [("user", user_message)]},
                config=config
            ):
                with open("agent_debug.log", "a", encoding="utf-8") as f:
                    f.write(f"DEBUG EVENT: {event}\n")
                print(f"DEBUG EVENT: {event}", flush=True)
                # 1. Handle Text Messages from Model
                if "model" in event and "messages" in event["model"]:
                    messages = event["model"]["messages"]
                    if messages:
                        last_msg = messages[-1]
                        if hasattr(last_msg, "content") and last_msg.content:
                            content = last_msg.content
                            yield json.dumps({"type": "text", "content": content}) + "\n"
                            
                            # Extract ID from model text if present (for manual reporting or sync)
                            import re
                            match = re.search(r"ID:\s*([a-f0-9\-]{36})", content, re.IGNORECASE)
                            if match:
                                yield json.dumps({
                                    "type": "invoiceCreated",
                                    "invoiceId": match.group(1)
                                }) + "\n"

                # 2. Handle Tool Execution (Signal refresh & extract ID)
                if "tools" in event:
                    messages = event["tools"]["messages"]
                    for msg in messages:
                        if hasattr(msg, "content") and msg.content:
                            content = msg.content
                            
                            # A. Try JSON parsing
                            try:
                                data = json.loads(content)
                                if isinstance(data, list) and len(data) > 0:
                                    first_item = data[0]
                                    if "id" in first_item:
                                        yield json.dumps({
                                            "type": "invoiceCreated",
                                            "invoiceId": str(first_item["id"])
                                        }) + "\n"
                            except json.JSONDecodeError:
                                # B. Try Regex fallback
                                import re
                                match = re.search(r"([a-f0-9\-]{36})", content)
                                if match:
                                    yield json.dumps({
                                        "type": "invoiceCreated",
                                        "invoiceId": match.group(1)
                                    }) + "\n"

                    yield json.dumps({"type": "invoiceUpdated"}) + "\n"

        except Exception as e:
            yield json.dumps({"type": "error", "content": str(e)}) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")

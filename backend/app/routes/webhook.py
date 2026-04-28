from fastapi import APIRouter, Request, Header
import hmac, hashlib
from app.config.settings import settings
from app.engine.executor import execute_workflow

router = APIRouter()


@router.post("/webhook/razorpay")
async def webhook(request: Request, x_razorpay_signature: str = Header(None)):
    body = await request.body()

    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if expected != x_razorpay_signature:
        return {"error": "invalid signature"}

    data = await request.json()

    if data.get("event") == "payment.failed":

        workflow = {
            "trigger": "payment_failed",
            "actions": [
                {"type": "send_email"},
                {"type": "send_whatsapp"}
            ]
        }

        result = execute_workflow(workflow)

        return {"status": "done", "result": result}

    return {"status": "ignored"}
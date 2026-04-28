import json
import re
from groq import Groq
from app.config.settings import settings

client = Groq(api_key=settings.GROQ_API_KEY)


# ---------------- JSON EXTRACTOR ---------------- #
def _extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        return json.loads(match.group())
    except:
        return None


# ---------------- FALLBACK TRIGGER DETECTOR ---------------- #
def detect_trigger(text: str):
    text = text.lower()

    if any(k in text for k in [
        "sign up", "signup", "signs up", "signed up",
        "register", "registration", "create account"
    ]):
        return "user_signup"

    if any(k in text for k in [
        "payment fail", "payment failed", "transaction failed"
    ]):
        return "payment_failed"

    if any(k in text for k in [
        "order created", "new order", "order placed"
    ]):
        return "order_created"

    return "manual"


# ---------------- MAIN PARSER ---------------- #
def parse_workflow(text: str):

    prompt = f"""
You are an AI workflow generator.

STRICT RULES:
- Extract BOTH trigger and actions
- DO NOT miss any action
- Return ONLY valid JSON
- No explanation

SUPPORTED TRIGGERS:
user_signup, payment_failed, order_created, manual

SUPPORTED ACTIONS:
send_email, send_whatsapp, create_customer, send_invoice, notify_admin, retry_payment, log_event

MAPPING:
signup/register/create account → create_customer
email → send_email
whatsapp/message → send_whatsapp
log/activity → log_event
invoice → send_invoice
notify → notify_admin
retry → retry_payment

EXAMPLE:

Input:
"When user signs up, create account, send email"

Output:
{{
  "trigger": "user_signup",
  "actions": [
    {{ "type": "create_customer" }},
    {{ "type": "send_email" }}
  ]
}}

Now convert:
{text}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.choices[0].message.content
    parsed = _extract_json(content)

    # ---------------- SAFETY FALLBACK ---------------- #
    if not parsed:
        return {
            "trigger": detect_trigger(text),
            "actions": [{"type": "log_event"}]
        }

    # 🔥 FIX TRIGGER IF AI FAILS
    if parsed.get("trigger") in [None, "", "manual"]:
        parsed["trigger"] = detect_trigger(text)

    # 🔥 ENSURE ACTIONS EXIST
    if not parsed.get("actions"):
        parsed["actions"] = [{"type": "log_event"}]

    return parsed
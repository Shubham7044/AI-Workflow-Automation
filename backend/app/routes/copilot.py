from fastapi import APIRouter
from app.config.firebase import db
from datetime import datetime
import uuid
import random
import re

from app.engine.executor import execute_workflow
from app.ai.parser import parse_workflow

router = APIRouter()


# ---------------- NAME EXTRACTION ---------------- #
def extract_name(text: str):
    """
    Extracts customer name from phrases like:
    - customer John
    - for John
    - user John
    """
    patterns = [
        r"customer\s+([A-Za-z]+)",
        r"for\s+([A-Za-z]+)",
        r"user\s+([A-Za-z]+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).capitalize()

    return None


# ---------------- RUN WORKFLOW ---------------- #
@router.post("/run")
def run_workflow(data: dict):
    user_input = data.get("input", "").strip()

    if not user_input:
        return {"error": "Input is required"}

    print(f"\n🧠 User Input: {user_input}")

    # 🔥 AI → Workflow
    workflow = parse_workflow(user_input)
    print(f"⚙️ Generated Workflow: {workflow}")

    # 🔥 AUTO EXTRACT NAME
    extracted_name = extract_name(user_input)

    # 🔥 CONTEXT (FINAL VERSION)
    context = {
        "email": data.get("email"),
        "phone": data.get("phone"),
        "input": user_input,

        # ✅ PRIORITY: user > extracted > fallback
        "customer_name": (
            data.get("customer_name")
            or extracted_name
            or "Valued Customer"
        ),

        "amount": data.get("amount") or random.randint(1000, 5000),
        "invoice_id": data.get("invoice_id") or f"INV-{random.randint(1000, 9999)}",

        "should_retry": True
    }

    # ---------------- VALIDATION ---------------- #

    if context["email"] and "@" not in context["email"]:
        return {"error": "Invalid email format"}

    if context["phone"] and not context["phone"].startswith("+"):
        return {"error": "Phone must be in international format (+91...)"}

    try:
        context["amount"] = float(context["amount"])
    except:
        return {"error": "Amount must be a number"}

    print(f"📦 Context BEFORE execution: {context}")

    # ---------------- EXECUTION ---------------- #
    execution_result = execute_workflow(workflow, context=context)

    total_steps = len(execution_result)
    timestamp = datetime.utcnow().isoformat()
    execution_id = str(uuid.uuid4())

    # 🔥 STATUS CALCULATION
    overall_status = "completed"
    failed_steps = 0

    for step in execution_result:
        if step.get("status") in ["failed", "error"]:
            failed_steps += 1

    if failed_steps > 0:
        overall_status = "partial_failure"

    # ---------------- SAVE ---------------- #
    doc = {
        "id": execution_id,
        "workflow": workflow,
        "execution": {
            "steps": execution_result,
            "total_steps": total_steps,
            "failed_steps": failed_steps,
            "status": overall_status
        },
        "context": context,
        "timestamp": timestamp
    }

    db.collection("workflow_history").document(execution_id).set(doc)

    # ---------------- RESPONSE ---------------- #
    return {
        "execution_id": execution_id,
        "workflow": workflow,
        "execution": {
            "status": overall_status,
            "steps": execution_result,
            "total_steps": total_steps,
            "failed_steps": failed_steps,
            "timestamp": timestamp
        }
    }


# ---------------- HISTORY ---------------- #

@router.get("/history")
def get_history():
    docs = db.collection("workflow_history").stream()
    history = [doc.to_dict() for doc in docs]
    history.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return history


# ---------------- RENAME ---------------- #

@router.put("/history/{doc_id}")
def rename_workflow(doc_id: str, data: dict):
    ref = db.collection("workflow_history").document(doc_id)
    doc = ref.get()

    if not doc.exists:
        return {"error": "Not found"}

    existing = doc.to_dict()

    new_name = data.get("name")
    if not new_name:
        return {"error": "Name is required"}

    existing["workflow"]["trigger"] = new_name
    ref.set(existing)

    return {"message": "renamed successfully"}


# ---------------- DELETE ---------------- #

@router.delete("/history/{doc_id}")
def delete_workflow(doc_id: str):
    ref = db.collection("workflow_history").document(doc_id)

    if not ref.get().exists:
        return {"error": "Not found"}

    ref.delete()

    return {"message": "deleted successfully"}
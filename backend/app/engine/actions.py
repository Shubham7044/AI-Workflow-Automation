# from app.integrations.gmail import send_email
# from app.integrations.whatsapp import send_whatsapp
# from app.ai.message_generator import generate_message


# # 🔥 CENTRAL SENDER (BEST PRACTICE)
# def send_notifications(context, subject, message):
#     if context.get("email"):
#         send_email(
#             to=context["email"],
#             subject=subject,
#             body=message
#         )
#         print(f"📧 Email sent to {context['email']}")

#     if context.get("phone"):
#         send_whatsapp(
#             to=f"whatsapp:{context['phone']}",
#             message=message
#         )
#         print(f"📱 WhatsApp sent to {context['phone']}")


# # ---------------- ACTION HANDLERS ---------------- #

# def handle_email(context):
#     if not context.get("email"):
#         return {"action": "send_email", "status": "failed"}

#     message = generate_message("send_email", context)

#     send_notifications(context, "Email Notification", message)

#     return {"action": "send_email", "status": "sent"}


# def handle_whatsapp(context):
#     if not context.get("phone"):
#         return {"action": "send_whatsapp", "status": "failed"}

#     message = generate_message("send_whatsapp", context)

#     send_whatsapp(
#         to=f"whatsapp:{context['phone']}",
#         message=message
#     )

#     print(f"📱 WhatsApp sent to {context['phone']}")

#     return {"action": "send_whatsapp", "status": "sent"}


# def handle_customer(context):
#     print("👤 Customer created")
#     return {"action": "create_customer", "status": "done"}


# def handle_invoice(context):
#     print("🧾 Invoice generated")

#     message = generate_message("send_invoice", context)

#     send_notifications(context, "Invoice Generated", message)

#     return {"action": "send_invoice", "status": "sent"}


# def handle_notify(context):
#     print("🚨 Notifying admin")

#     message = generate_message("notify_admin", context)

#     send_notifications(context, "Admin Alert 🚨", message)

#     return {"action": "notify_admin", "status": "sent"}


# def handle_retry(context):
#     if context.get("should_retry", False):
#         print("🔁 Payment retried")

#         message = generate_message("retry_payment", context)

#         # 🔥 FIX: NOW SENDS BOTH EMAIL + WHATSAPP
#         send_notifications(context, "Payment Retry", message)

#         return {"action": "retry_payment", "status": "success"}

#     return {"action": "retry_payment", "status": "skipped"}


# def handle_log(context):
#     print("📝 Event logged")
#     return {"action": "log_event", "status": "logged"}


# # ---------------- DISPATCHER ---------------- #

# ACTION_MAP = {
#     "send_email": handle_email,
#     "send_whatsapp": handle_whatsapp,
#     "create_customer": handle_customer,
#     "send_invoice": handle_invoice,
#     "notify_admin": handle_notify,
#     "retry_payment": handle_retry,
#     "log_event": handle_log,
# }


# def handle_action(action, context=None):
#     action_type = action.get("type")
#     context = context or {}

#     print(f"🚀 Executing: {action_type}")

#     handler = ACTION_MAP.get(action_type)

#     if not handler:
#         print(f"⚠️ Unknown action: {action_type}")
#         return {"action": action_type, "status": "unknown"}

#     try:
#         return handler(context)

#     except Exception as e:
#         print(f"❌ Error in {action_type}: {str(e)}")

#         return {
#             "action": action_type,
#             "status": "error",
#             "error": str(e),
#         }







from app.integrations.gmail import send_email
from app.integrations.whatsapp import send_whatsapp
from app.ai.message_generator import generate_message


def send_notifications(context, subject, message):
    if context.get("email"):
        send_email(context["email"], subject, message)
        print(f"📧 Email sent to {context['email']}")

    if context.get("phone"):
        send_whatsapp(context["phone"], message)


# ---------------- ACTIONS ---------------- #

def handle_email(context):
    if not context.get("email"):
        return {"action": "send_email", "status": "failed"}

    msg = generate_message("send_email", context)
    send_notifications(context, "Email Notification", msg)

    return {"action": "send_email", "status": "sent"}


def handle_customer(context):
    print("👤 Customer created")
    return {"action": "create_customer", "status": "done"}


def handle_invoice(context):
    print("🧾 Invoice generated")

    msg = generate_message("send_invoice", context)
    send_notifications(context, "Invoice Generated", msg)

    return {"action": "send_invoice", "status": "sent"}


def handle_notify(context):
    print("🚨 Notifying admin")

    msg = generate_message("notify_admin", context)
    send_notifications(context, "Admin Alert 🚨", msg)

    return {"action": "notify_admin", "status": "sent"}


def handle_retry(context):
    if not context.get("should_retry"):
        return {"action": "retry_payment", "status": "skipped"}

    print("🔁 Payment retried")

    msg = generate_message("retry_payment", context)
    send_notifications(context, "Payment Retry", msg)

    return {"action": "retry_payment", "status": "success"}


def handle_log(context):
    print("📝 Event logged")
    return {"action": "log_event", "status": "logged"}


ACTION_MAP = {
    "send_email": handle_email,
    "create_customer": handle_customer,
    "send_invoice": handle_invoice,
    "notify_admin": handle_notify,
    "retry_payment": handle_retry,
    "log_event": handle_log,
}


def handle_action(action, context=None):
    action_type = action.get("type")
    context = context or {}

    print(f"🚀 Executing: {action_type}")

    handler = ACTION_MAP.get(action_type)

    if not handler:
        return {"action": action_type, "status": "unknown"}

    try:
        return handler(context)
    except Exception as e:
        return {"action": action_type, "status": "error", "error": str(e)}
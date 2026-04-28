def generate_message(action_type, context):

    name = context.get("customer_name") or "Valued Customer"
    amount = context.get("amount") or 0
    invoice = context.get("invoice_id") or "INV-0000"

    # ---------------- WELCOME EMAIL ---------------- #
    if action_type == "send_email" and "sign" in context.get("input", "").lower():
        return f"""
Subject: Welcome to Our Community!

Dear {name},

Thank you for registering with us. We are excited to have you on board and look forward to serving you.

If you have any questions or need assistance, feel free to reach out anytime.

Best regards,  
Your Team
""".strip()

    # ---------------- INVOICE EMAIL ---------------- #
    if action_type == "send_invoice":
        return f"""
Subject: Your Invoice {invoice}

Dear {name},

We’re pleased to inform you that your invoice has been successfully generated.

Invoice ID: {invoice}  
Amount: ₹{amount}

Please review the details and let us know if you need any assistance.

Best regards,  
Your Billing Team
""".strip()

    # ---------------- RETRY PAYMENT ---------------- #
    if action_type == "retry_payment":
        return f"""
Subject: Payment Retry Initiated

Dear {name},

We noticed a payment issue and have initiated a retry for ₹{amount}.

Please check your payment method or try again if needed.

Best regards,  
Support Team
""".strip()

    # ---------------- ADMIN ALERT ---------------- #
    if action_type == "notify_admin":
        return f"""
Subject: Admin Alert 🚨

A payment issue has been detected.

Invoice: {invoice}  
Amount: ₹{amount}  
Customer: {name}

Please take necessary action.

— System Notification
""".strip()

    # ---------------- FALLBACK ---------------- #
    return f"{action_type} executed successfully for {name}."
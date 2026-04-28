from twilio.rest import Client
from app.config.settings import settings

client = Client(settings.TWILIO_SID, settings.TWILIO_AUTH_TOKEN)


def send_whatsapp(to: str, message: str):
    try:
        # ✅ ALWAYS NORMALIZE
        to = to.replace("whatsapp:", "")
        to = f"whatsapp:{to}"

        client.messages.create(
            body=message,
            from_="whatsapp:+14155238886",
            to=to
        )

        print(f"📱 WhatsApp sent to {to}")

    except Exception as e:
        print(f"❌ WhatsApp error: {e}")
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 🔥 Gmail
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # 🔥 Twilio
    TWILIO_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_PHONE: str

    # 🔥 Razorpay
    RAZORPAY_KEY_ID: str
    RAZORPAY_KEY_SECRET: str
    RAZORPAY_WEBHOOK_SECRET: str

    # 🔥 AI
    GROQ_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
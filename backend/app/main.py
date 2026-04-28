from dotenv import load_dotenv
load_dotenv()  # ✅ MUST be FIRST

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.copilot import router

# 🔥 CREATE APP
app = FastAPI(
    title="AI Integration Copilot",
    version="1.0.0"
)

# ✅ CORS FIX (Frontend React)
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ ROUTES
app.include_router(router)


# ✅ ROOT CHECK
@app.get("/")
def root():
    return {
        "status": "Backend running 🚀",
        "ai": "Groq LLaMA 3.1",
        "integrations": ["Gmail", "WhatsApp", "Razorpay", "Firebase"]
    }
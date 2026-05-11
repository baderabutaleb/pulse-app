import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routes.cards import router as cards_router
from routes.streak import router as streak_router
from scheduler import start_scheduler, stop_scheduler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Pulse API", lifespan=lifespan)

origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cards_router)
app.include_router(streak_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/admin/generate")
async def admin_generate(target_date: str | None = None):
    """Manually trigger card generation. Useful for seeding a fresh database."""
    from datetime import date
    from generator import generate_cards_for_date

    d = date.fromisoformat(target_date) if target_date else None
    cards = generate_cards_for_date(d)
    return {"generated": len(cards), "date": (d or date.today()).isoformat()}

from datetime import datetime, timezone

from fastapi import APIRouter, Query
from pydantic import BaseModel
from database import supabase

router = APIRouter()


class StreakPingBody(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD


@router.get("/api/streak")
async def get_streak(user_id: str = Query(...)):
    result = (
        supabase.table("streaks")
        .select("user_id, streak_count, last_celebrated_date")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    if result.data:
        return result.data
    return {"user_id": user_id, "streak_count": 0, "last_celebrated_date": None}


@router.post("/api/streak/ping")
async def ping_streak(body: StreakPingBody):
    result = (
        supabase.table("streaks")
        .select("user_id, streak_count, last_celebrated_date")
        .eq("user_id", body.user_id)
        .maybe_single()
        .execute()
    )

    # Already celebrated today — return unchanged
    if result.data and result.data["last_celebrated_date"] == body.date:
        return result.data

    current_count = result.data["streak_count"] if result.data else 0
    new_count = current_count + 1

    supabase.table("streaks").upsert(
        {
            "user_id": body.user_id,
            "streak_count": new_count,
            "last_celebrated_date": body.date,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="user_id",
    ).execute()

    return {
        "user_id": body.user_id,
        "streak_count": new_count,
        "last_celebrated_date": body.date,
    }

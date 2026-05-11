from datetime import date

from fastapi import APIRouter
from pydantic import BaseModel
from database import supabase

router = APIRouter()


class StreakPingBody(BaseModel):
    device_id: str


@router.post("/api/streak/ping")
async def ping_streak(body: StreakPingBody):
    today = date.today()
    device_id = body.device_id

    result = (
        supabase.table("user_streaks")
        .select("*")
        .eq("device_id", device_id)
        .maybe_single()
        .execute()
    )

    if result.data:
        row = result.data
        last_seen = date.fromisoformat(row["last_seen_date"])

        if last_seen < today:
            delta = (today - last_seen).days
            new_streak = row["streak_count"] + 1 if delta == 1 else 1

            supabase.table("user_streaks").update(
                {"streak_count": new_streak, "last_seen_date": today.isoformat()}
            ).eq("device_id", device_id).execute()

            return {
                "streak_count": new_streak,
                "first_seen_date": row["first_seen_date"],
                "last_seen_date": today.isoformat(),
            }

        return {
            "streak_count": row["streak_count"],
            "first_seen_date": row["first_seen_date"],
            "last_seen_date": row["last_seen_date"],
        }

    # New device
    supabase.table("user_streaks").insert(
        {
            "device_id": device_id,
            "streak_count": 1,
            "last_seen_date": today.isoformat(),
            "first_seen_date": today.isoformat(),
        }
    ).execute()

    return {
        "streak_count": 1,
        "first_seen_date": today.isoformat(),
        "last_seen_date": today.isoformat(),
    }

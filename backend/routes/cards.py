from datetime import date, timedelta

from fastapi import APIRouter, HTTPException
from database import supabase

router = APIRouter()


def _fetch_cards_for_date(d: date) -> list | None:
    result = (
        supabase.table("daily_cards")
        .select("cards, date")
        .eq("date", d.isoformat())
        .maybe_single()
        .execute()
    )
    return result.data


@router.get("/api/cards/today")
async def get_today_cards():
    today = date.today()

    # Try today first, then yesterday
    for d in (today, today - timedelta(days=1)):
        row = _fetch_cards_for_date(d)
        if row:
            return {
                "cards": row["cards"],
                "date": row["date"],
                "is_today": d == today,
            }

    # Final fallback: most recent row in the table
    result = (
        supabase.table("daily_cards")
        .select("cards, date")
        .order("date", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        row = result.data[0]
        return {"cards": row["cards"], "date": row["date"], "is_today": False}

    raise HTTPException(status_code=503, detail="No cards available yet — run generation first")


@router.get("/api/cards/date/{target_date}")
async def get_cards_by_date(target_date: str):
    try:
        d = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")

    row = _fetch_cards_for_date(d)
    if not row:
        raise HTTPException(status_code=404, detail=f"No cards for {target_date}")

    return {"cards": row["cards"], "date": row["date"]}

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def _run_generation():
    """Wrapped so import errors surface clearly at startup."""
    from generator import generate_cards_for_date

    try:
        cards = generate_cards_for_date()
        logger.info("Generated %d cards for today", len(cards))
    except Exception:
        logger.exception("Card generation failed")


def start_scheduler():
    scheduler.add_job(
        _run_generation,
        CronTrigger(hour=4, minute=0, timezone="UTC"),
        id="daily_cards",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started — daily card generation at 04:00 UTC")


def stop_scheduler():
    scheduler.shutdown(wait=False)

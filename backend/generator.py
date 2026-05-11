import json
import re
import time
import logging
from datetime import date as _date
import anthropic
from database import supabase
import os

logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are a world-class news curator. Search the web and find the 10 most important real news stories from today. Use reputable sources: Reuters, AP, BBC, Al Jazeera, The Guardian, Arab Times, Kuwait Times, Sky Sports. Return ONLY a valid JSON array of exactly 10 objects with these fields: id, category, headline, summary (2 sentences max), source_name, source_url, theme_color (dark-friendly hex), emoji. No markdown, no explanation, just the JSON array."""

def _extract_json(text: str) -> list:
    text = text.strip()
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()
    start = text.find('[')
    end = text.rfind(']') + 1
    if start != -1 and end > start:
        return json.loads(text[start:end])
    return json.loads(text)

def _call_with_retry(messages, max_retries=4):
    delay = 15
    for attempt in range(max_retries):
        try:
            return client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=2000,
                system=SYSTEM_PROMPT,
                tools=[{"type": "web_search_20250305", "name": "web_search"}],
                messages=messages
            )
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                logger.warning(f"Rate limited, waiting {delay}s before retry {attempt + 1}")
                time.sleep(delay)
                delay *= 2
            else:
                raise

def generate_cards_for_date(target_date=None) -> list:
    if target_date is None:
        target_date = _date.today()

    logger.info(f"Generating cards for {target_date}")

    messages = [
        {
            "role": "user",
            "content": f"Date: {target_date.strftime('%B %d, %Y')}. Generate 10 Pulse news cards. Fixed slots: 1=AI/Tech, 2=Kuwait, 3=World Update, 4=Major Ongoing Story, 5=Football, 6=Life Fact. Slots 7-10: your pick of most significant global stories today. Search the web for real current news. Return ONLY a JSON array."
        }
    ]

    while True:
        response = _call_with_retry(messages)
        logger.info(f"stop_reason: {response.stop_reason}, blocks: {[b.type for b in response.content]}")
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            raw_text = ""
            for block in response.content:
                if hasattr(block, "text") and block.text:
                    raw_text += block.text
            logger.info(f"Raw text preview: {raw_text[:300]}")
            cards = _extract_json(raw_text)
            break

        elif response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": "Search executed."
                    })
            if tool_results:
                messages.append({"role": "user", "content": tool_results})
            time.sleep(3)
        else:
            logger.warning(f"Unexpected stop_reason: {response.stop_reason}")
            break

    supabase.table("daily_cards").upsert({
        "date": str(target_date),
        "cards": cards
    }, on_conflict="date").execute()

    logger.info(f"Stored {len(cards)} cards for {target_date}")
    return cards

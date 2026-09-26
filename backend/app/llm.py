import os
import json
import re
import asyncio
from typing import Dict, Any, AsyncIterator, Optional
from backend.app.mock_data import (
    MOCK_SCAN_DATA,
    MOCK_COURT_DEBATES,
    MOCK_WHATIF_SCENARIOS,
    MOCK_LAWYER_BRIEF_MD,
)

# Configuration from environment
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-120b").strip()
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()

# Determine MOCK_MODE: True if explicit or if credentials are empty/placeholder
raw_mock = os.getenv("MOCK_MODE", "").lower()
if raw_mock in ("true", "1", "yes"):
    MOCK_MODE = True
elif raw_mock in ("false", "0", "no") and GROQ_API_KEY and not GROQ_API_KEY.startswith("your-") and not GROQ_API_KEY.startswith("gsk_your-"):
    MOCK_MODE = False
elif GROQ_API_KEY and not GROQ_API_KEY.startswith("your-") and not GROQ_API_KEY.startswith("gsk_your-") and raw_mock not in ("true", "1", "yes"):
    MOCK_MODE = False
else:
    MOCK_MODE = True


def is_mock_mode() -> bool:
    return MOCK_MODE


_client = None
_async_client = None


def get_client():
    """
    Initializes and returns the standard OpenAI client configured for the Groq API.
    """
    global _client
    if _client is None and not MOCK_MODE:
        try:
            from openai import OpenAI
            _client = OpenAI(
                base_url=GROQ_BASE_URL,
                api_key=GROQ_API_KEY,
            )
        except Exception as e:
            print(f"Error initializing OpenAI client for Groq: {e}. Falling back to MOCK_MODE.")
            return None
    return _client


def get_async_client():
    """
    Initializes and returns the standard AsyncOpenAI client configured for the Groq API.
    """
    global _async_client
    if _async_client is None and not MOCK_MODE:
        try:
            from openai import AsyncOpenAI
            _async_client = AsyncOpenAI(
                base_url=GROQ_BASE_URL,
                api_key=GROQ_API_KEY,
            )
        except Exception as e:
            print(f"Error initializing AsyncOpenAI client for Groq: {e}. Falling back to MOCK_MODE.")
            return None
    return _async_client


# Convenient alias
get_ai_client = get_async_client


def _clean_json_str(content: str) -> str:
    """Strip markdown code fence blocks if any."""
    content = content.strip()
    if content.startswith("```"):
        lines = content.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        content = "\n".join(lines).strip()
    return content


def _is_rate_limit_error(e: Exception) -> bool:
    """Helper to detect Groq / OpenAI rate limit errors (HTTP 429)."""
    try:
        import openai
        if isinstance(e, openai.RateLimitError):
            return True
    except Exception:
        pass
    msg = str(e).lower()
    return "429" in msg or "rate limit" in msg or "rate_limit" in msg or "too many requests" in msg


async def chat_json(system: str, user: str, schema_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes an LLM call expecting a JSON object response using MODEL_NAME with Groq API.
    In MOCK_MODE, matches the query context and returns realistic canned schemas.
    Includes rate limit retry and fallback error handling.
    """
    client = get_async_client()
    if not client or MOCK_MODE:
        # Mock mode dispatcher
        sys_lower = system.lower()
        user_lower = user.lower()

        # 1. Scan request
        if "careful contract analyst" in sys_lower or "cross-clause issues" in sys_lower or "scanner" in sys_lower:
            return MOCK_SCAN_DATA

        # 2. Judge verdict
        if "neutral judge" in sys_lower or "verdict" in sys_lower:
            match = re.search(r"\bC(\d+)\b", user, re.IGNORECASE)
            clause_id = f"C{match.group(1)}" if match else "C4"
            debate = MOCK_COURT_DEBATES.get(clause_id)
            if debate:
                return debate["verdict"]
            return {
                "verdict": "genuinely_ambiguous",
                "confidence": "medium",
                "reasoning": "The clause contains competing interpretations and non-standard phrasing.",
                "what_would_settle_it": "Clarify obligations and numerical thresholds in a written addendum.",
                "evidence": "not specified",
                "needs_lawyer": True,
                "unverified": False,
            }

        # 3. What-if request
        if "scenario" in sys_lower or "whatif" in sys_lower:
            if "leave" in user_lower or "month" in user_lower or "early" in user_lower or "vacat" in user_lower:
                return MOCK_WHATIF_SCENARIOS["leave"]
            elif "deposit" in user_lower or "deduct" in user_lower or "keep" in user_lower:
                return MOCK_WHATIF_SCENARIOS["deposit"]
            elif "sublet" in user_lower or "sublease" in user_lower:
                return MOCK_WHATIF_SCENARIOS["sublet"]
            else:
                return {
                    "outcomes": [
                        {
                            "step": f"Tenant inquires or acts regarding: {user[:60]}...",
                            "cost_or_penalty": "not specified",
                            "deadline_or_notice": "not specified",
                            "clause_id": "C1",
                            "evidence": "not specified",
                            "confidence": "medium",
                            "unverified": False,
                        }
                    ],
                    "unknowns": [
                        "The contract does not provide specific procedures or penalties for this particular scenario.",
                        "Whether standard local tenancy legislation supersedes silence in this agreement.",
                    ],
                    "needs_lawyer": True,
                }

        # 4. Brief request
        if "brief" in sys_lower or "markdown" in sys_lower:
            return {"markdown": MOCK_LAWYER_BRIEF_MD}

        return {"status": "ok", "message": "mock response"}

    # Real Groq API call using standard OpenAI client
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            response = await client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(_clean_json_str(content))
        except Exception as e:
            if _is_rate_limit_error(e):
                if attempt < max_retries:
                    wait_time = (attempt + 1) * 2.0
                    print(f"Groq API rate limit (429) encountered. Retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})...")
                    await asyncio.sleep(wait_time)
                    continue
                else:
                    print(f"Groq API rate limit exceeded after {max_retries} retries: {e}. Falling back to mock data.")
                    return MOCK_SCAN_DATA
            print(f"Groq API chat_json error: {e}. Falling back to mock data.")
            return MOCK_SCAN_DATA

    return MOCK_SCAN_DATA


async def chat_stream(system: str, user: str) -> AsyncIterator[str]:
    """
    Executes an LLM streaming call yielding token strings using MODEL_NAME with Groq API.
    In MOCK_MODE, streams canned advocate speeches progressively with realistic delays.
    Includes rate limit detection and graceful handling.
    """
    client = get_async_client()
    if not client or MOCK_MODE:
        sys_lower = system.lower()
        match = re.search(r"\bC(\d+)\b", user, re.IGNORECASE)
        clause_id = f"C{match.group(1)}" if match else "C4"
        debate = MOCK_COURT_DEBATES.get(clause_id)

        if "tenant's advocate" in sys_lower:
            if debate:
                speech_text = debate["tenant_speech"]
            else:
                speech_text = (
                    f"May it please the court. Regarding {clause_id}, the clause imposes burdens on the tenant "
                    f"without reciprocal safeguards. Non-lawyers reading this clause are exposed to unpredictable liabilities. "
                    f"The text must be read narrowly in favor of the tenant's fundamental quiet enjoyment and financial certainty."
                )
        elif "landlord's advocate" in sys_lower:
            if debate:
                speech_text = debate["landlord_speech"]
            else:
                speech_text = (
                    f"Respectfully, the tenant advocate's reading imposes extra-contractual duties not found in the text. "
                    f"The clear intent of {clause_id} is to protect the landlord's property rights and operational costs. "
                    f"Both parties voluntarily agreed to these exact terms."
                )
        else:
            speech_text = f"Proceeding with analysis of {clause_id} based strictly on the text inside the agreement."

        words = speech_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield chunk
            await asyncio.sleep(0.018)
        return

    # Real Groq API streaming call using standard OpenAI client
    try:
        stream = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            stream=True,
            temperature=0.2,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        if _is_rate_limit_error(e):
            print(f"Groq API streaming rate limit exceeded (429): {e}. Streaming advisory.")
            yield "[Groq API rate limit reached. Proceeding with text-based analysis.] "
        else:
            print(f"Groq API chat_stream error: {e}. Streaming fallback text.")
        fallback = f"[Stream connection fallback: arguing clause position textually.]"
        for w in fallback.split():
            yield w + " "
            await asyncio.sleep(0.02)

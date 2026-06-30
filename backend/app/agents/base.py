"""Base agent — shared infrastructure for all medical agents."""
from openai import OpenAI
from functools import lru_cache
from ..config import get_settings


@lru_cache
def get_openrouter_client() -> OpenAI:
    settings = get_settings()
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set in environment")
    return OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )


class BaseAgent:
    """Base class for all agents. Provides model access via OpenRouter."""

    def __init__(self):
        self.settings = get_settings()
        self.client = get_openrouter_client()
        self.model = self.settings.CLAUDE_MODEL
        self.max_tokens = self.settings.CLAUDE_MAX_TOKENS

    def call_claude(self, system: str, messages: list[dict], max_tokens: int | None = None) -> str:
        """Call Claude via OpenRouter with the given system prompt and message history."""
        all_messages = [{"role": "system", "content": system}] + messages
        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens or self.max_tokens,
            messages=all_messages,
        )
        return response.choices[0].message.content or ""

    def call_claude_vision(self, system: str, image_base64: str, media_type: str, prompt: str, max_tokens: int | None = None) -> str:
        """Call Claude with an image attachment via OpenRouter."""
        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens or self.max_tokens,
            messages=[
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{media_type};base64,{image_base64}"},
                        },
                        {"type": "text", "text": prompt},
                    ],
                },
            ],
        )
        return response.choices[0].message.content or ""

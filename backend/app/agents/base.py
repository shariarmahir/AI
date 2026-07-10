"""Base agent — shared infrastructure for all medical agents."""
from openai import OpenAI
from functools import lru_cache
from ..config import get_settings


@lru_cache
def get_llm_client() -> OpenAI:
    """OpenAI-compatible client. Prefers NVIDIA NIM, falls back to OpenRouter."""
    settings = get_settings()
    if settings.NVIDIA_API_KEY:
        return OpenAI(
            base_url=settings.NIM_BASE_URL,
            api_key=settings.NVIDIA_API_KEY,
        )
    if settings.OPENROUTER_API_KEY:
        return OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY,
        )
    raise ValueError("No LLM API key set: provide NVIDIA_API_KEY or OPENROUTER_API_KEY")


class BaseAgent:
    """Base class for all agents. Provides model access via NVIDIA NIM or OpenRouter."""

    def __init__(self):
        self.settings = get_settings()
        self.client = get_llm_client()
        if self.settings.NVIDIA_API_KEY:
            self.model = self.settings.NIM_MODEL
            self.vision_model = self.settings.NIM_VISION_MODEL
        else:
            self.model = self.settings.CLAUDE_MODEL
            self.vision_model = self.settings.CLAUDE_MODEL
        self.max_tokens = self.settings.CLAUDE_MAX_TOKENS

    def call_claude(self, system: str, messages: list[dict], max_tokens: int | None = None) -> str:
        """Call the text model with the given system prompt and message history."""
        all_messages = [{"role": "system", "content": system}] + messages
        response = self.client.chat.completions.create(
            model=self.model,
            max_tokens=max_tokens or self.max_tokens,
            messages=all_messages,
        )
        return response.choices[0].message.content or ""

    def call_claude_vision(self, system: str, image_base64: str, media_type: str, prompt: str, max_tokens: int | None = None) -> str:
        """Call the vision model with an image attachment."""
        response = self.client.chat.completions.create(
            model=self.vision_model,
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

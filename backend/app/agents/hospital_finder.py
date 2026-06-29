"""Hospital Finder Agent — queries Google Places API for nearby hospitals."""
import httpx
from .base import BaseAgent
from ..config import get_settings


class HospitalFinderAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        self.api_key = get_settings().GOOGLE_MAPS_API_KEY

    def find_nearby(self, lat: float, lng: float, specialty: str = "hospital",
                    radius_meters: int = 8000) -> list[dict]:
        """Find hospitals matching a specialty near the given coordinates."""
        if not self.api_key:
            return []

        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{lat},{lng}",
            "radius": radius_meters,
            "type": "hospital",
            "keyword": specialty,
            "key": self.api_key
        }

        try:
            response = httpx.get(url, params=params, timeout=10.0)
            data = response.json()
        except Exception as e:
            print(f"Hospital search error: {e}")
            return []

        results = data.get("results", [])[:8]
        return [self._format(p) for p in results]

    def _format(self, place: dict) -> dict:
        loc = place.get("geometry", {}).get("location", {})
        return {
            "name": place.get("name"),
            "address": place.get("vicinity", ""),
            "rating": place.get("rating"),
            "total_ratings": place.get("user_ratings_total", 0),
            "open_now": place.get("opening_hours", {}).get("open_now"),
            "location": {"lat": loc.get("lat"), "lng": loc.get("lng")},
            "place_id": place.get("place_id"),
            "maps_url": f"https://www.google.com/maps/place/?q=place_id:{place.get('place_id')}"
        }

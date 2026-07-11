"""Hospital Finder Agent.

Primary source is the Google Places API (live ratings and open/closed status).
When that is unavailable — no API key, network failure, quota exhausted, or an
empty result set — it falls back to a curated local dataset of Dhaka hospitals
ranked by great-circle distance.

The fallback exists because the previous behaviour returned [] on any failure,
which the UI rendered as "No facilities found" — indistinguishable from "there
are genuinely no hospitals near you". For a user in an emergency that is the
worst possible failure mode.
"""
import json
import math
from functools import lru_cache
from pathlib import Path

import httpx

from .base import BaseAgent
from ..config import get_settings

EARTH_RADIUS_M = 6_371_000

# Free-text specialties arriving from the UI filters and the triage agent, mapped
# onto the canonical tokens stored in hospitals_dhaka.json. Keys are matched as
# substrings against the lowercased query, longest first.
SPECIALTY_ALIASES: dict[str, str] = {
    "cardiology": "cardiology",
    "cardiac": "cardiology",
    "heart": "cardiology",
    "chest pain": "cardiology",
    "neurology": "neurology",
    "neuro": "neurology",
    "stroke": "neurology",
    "orthopedic": "orthopedics",
    "orthopaedic": "orthopedics",
    "bone": "orthopedics",
    "fracture": "orthopedics",
    "pediatric": "pediatrics",
    "paediatric": "pediatrics",
    "child": "pediatrics",
    "obstetric": "obstetrics",
    "pregnan": "obstetrics",
    "gynecolog": "gynecology",
    "gynaecolog": "gynecology",
    "oncolog": "oncology",
    "cancer": "oncology",
    "nephrolog": "nephrology",
    "kidney": "nephrology",
    "dialysis": "nephrology",
    "urolog": "urology",
    "gastro": "gastroenterology",
    "stomach": "gastroenterology",
    "pulmonolog": "pulmonology",
    "respiratory": "pulmonology",
    "asthma": "pulmonology",
    "lung": "pulmonology",
    "breathing": "pulmonology",
    "dermatolog": "dermatology",
    "skin": "dermatology",
    "ophthalmolog": "ophthalmology",
    "eye": "ophthalmology",
    "ent": "ent",
    "psychiatr": "psychiatry",
    "mental": "psychiatry",
    "burn": "burn",
    "trauma": "trauma",
    "accident": "trauma",
    "injury": "trauma",
    "infectious": "infectious_disease",
    "dengue": "infectious_disease",
    "fever": "infectious_disease",
    "endocrin": "endocrinology",
    "diabet": "endocrinology",
    "thyroid": "endocrinology",
    "rheumat": "rheumatology",
    "dental": "dental",
    "teeth": "dental",
    "emergency": "emergency",
    "clinic": "general",
    "pharmacy": "general",
    "hospital": "general",
    "general": "general",
}


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in metres. Straight-line, not driving distance."""
    p1, p2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(d_lambda / 2) ** 2
    return EARTH_RADIUS_M * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def canonical_specialty(query: str) -> str | None:
    """Map a free-text specialty onto a dataset token, or None if unrecognised."""
    q = (query or "").lower().strip()
    if not q:
        return None
    for alias in sorted(SPECIALTY_ALIASES, key=len, reverse=True):
        if alias in q:
            return SPECIALTY_ALIASES[alias]
    return None


@lru_cache(maxsize=1)
def load_hospitals() -> list[dict]:
    """Load and cache the local hospital dataset. Empty list if unreadable."""
    path = Path(get_settings().HOSPITALS_DATA_PATH)
    try:
        with path.open(encoding="utf-8") as f:
            return json.load(f)["hospitals"]
    except (OSError, json.JSONDecodeError, KeyError) as e:
        print(f"[hospital_finder] could not load local dataset {path}: {e}")
        return []


class HospitalFinderAgent(BaseAgent):

    def __init__(self):
        super().__init__()
        self.api_key = get_settings().GOOGLE_MAPS_API_KEY

    def find_nearby(self, lat: float, lng: float, specialty: str = "hospital",
                    radius_meters: int = 8000) -> list[dict]:
        """Hospitals matching a specialty near the given coordinates.

        Never returns [] while the local dataset has any entry within reach:
        an empty result must mean "genuinely nothing nearby", not "lookup broke".
        """
        if self.api_key:
            places = self._search_google(lat, lng, specialty, radius_meters)
            if places:
                return places

        return self.search_local(lat, lng, specialty, radius_meters)

    # ─────── Google Places (primary) ───────

    def _search_google(self, lat: float, lng: float, specialty: str,
                       radius_meters: int) -> list[dict]:
        try:
            response = httpx.get(
                "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
                params={
                    "location": f"{lat},{lng}",
                    "radius": radius_meters,
                    "type": "hospital",
                    "keyword": specialty,
                    "key": self.api_key,
                },
                timeout=10.0,
            )
            data = response.json()
        except Exception as e:
            print(f"[hospital_finder] Google Places failed, using local data: {e}")
            return []

        status = data.get("status")
        if status not in ("OK", "ZERO_RESULTS"):
            # REQUEST_DENIED / OVER_QUERY_LIMIT / INVALID_REQUEST — the key or
            # quota is broken, so fall through to local rather than showing none.
            print(f"[hospital_finder] Google Places status={status}, using local data")
            return []

        return [self._format_place(p, lat, lng) for p in data.get("results", [])[:8]]

    def _format_place(self, place: dict, origin_lat: float, origin_lng: float) -> dict:
        loc = place.get("geometry", {}).get("location", {})
        p_lat, p_lng = loc.get("lat"), loc.get("lng")
        distance = (
            round(haversine_meters(origin_lat, origin_lng, p_lat, p_lng))
            if p_lat is not None and p_lng is not None
            else None
        )
        place_id = place.get("place_id", "")
        return {
            "name": place.get("name"),
            "address": place.get("vicinity", ""),
            "rating": place.get("rating"),
            "total_ratings": place.get("user_ratings_total", 0),
            "open_now": place.get("opening_hours", {}).get("open_now"),
            "location": {"lat": p_lat, "lng": p_lng},
            "place_id": place_id,
            "maps_url": f"https://www.google.com/maps/place/?q=place_id:{place_id}",
            "distance_meters": distance,
            "source": "google",
        }

    # ─────── Local dataset (fallback) ───────

    def search_local(self, lat: float, lng: float, specialty: str = "hospital",
                     radius_meters: int = 8000, limit: int = 8) -> list[dict]:
        """Nearest hospitals from the curated dataset, ranked by distance.

        Widens the radius before it gives up, and if the specialty matches nothing
        it degrades to the nearest 24/7 emergency hospitals — never to an empty list.
        """
        hospitals = load_hospitals()
        if not hospitals:
            return []

        wanted = canonical_specialty(specialty)
        browsing = wanted in (None, "general")
        scored = [
            (haversine_meters(lat, lng, h["lat"], h["lng"]), h) for h in hospitals
        ]

        def matches(h: dict) -> bool:
            return browsing or wanted in h["specialties"]

        def rank(pair: tuple[float, dict]) -> tuple:
            distance, h = pair
            if browsing:
                return (distance,)
            # A centre *dedicated* to this specialty (the Heart Foundation for chest
            # pain) is worth extra travel over a general hospital that merely lists
            # it. Dedication means the specialty leads a short specialty list — not
            # merely that the hospital is type=specialized, which would also promote
            # a diabetes institute that happens to offer cardiology.
            specs = h["specialties"]
            dedicated = specs and specs[0] == wanted and len(specs) <= 4
            return (distance - 3000,) if dedicated else (distance,)

        candidates = [p for p in scored if p[0] <= radius_meters and matches(p[1])]

        if not candidates:
            # Nothing matched in radius: a correct-specialty hospital further away
            # beats a nearby one that cannot treat the patient.
            candidates = [p for p in scored if matches(p[1])]

        if not candidates:
            # The specialty exists nowhere in the dataset. Degrade to the nearest
            # 24/7 emergency departments — never to an empty list, and never to a
            # facility that is closed or cannot accept an emergency.
            candidates = [p for p in scored if p[1]["emergency_24_7"]]

        candidates.sort(key=rank)
        return [self._format_local(h, d) for d, h in candidates[:limit]]

    def _format_local(self, h: dict, distance_m: float) -> dict:
        return {
            "name": h["name"],
            "address": h["address"],
            "rating": None,          # no crowd-sourced ratings in the local dataset
            "total_ratings": 0,
            "open_now": True if h["emergency_24_7"] else None,
            "location": {"lat": h["lat"], "lng": h["lng"]},
            "place_id": f"local:{h['id']}",
            "maps_url": (
                "https://www.google.com/maps/search/?api=1"
                f"&query={h['lat']},{h['lng']}"
            ),
            "distance_meters": round(distance_m),
            "source": "local",
            "phone": h["emergency_phone"],
            "emergency_24_7": h["emergency_24_7"],
            "has_ambulance": h["has_ambulance"],
            "specialties": h["specialties"],
        }

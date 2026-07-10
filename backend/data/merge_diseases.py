"""Merge diseases_bd_extra*.json into diseases.json and regenerate qa_pairs.json.

diseases.json is the single source of truth consumed by the RAG ingestion,
the /api/diseases route, the disease recommender, and the health check. The
diseases_bd_extra*.json files hold Bangladesh-specific additions (chronic,
endemic, area-wise, and emergency conditions) authored separately so they are
easy to review. Run this after editing any extra file:

    python data/merge_diseases.py

It backs up the originals (.bak) the first time, merges new disease IDs into
diseases.json, and rebuilds qa_pairs.json from every disease's embedded `qa`
list so the Q&A knowledge base always matches the disease set.
"""
import json
import shutil
from pathlib import Path

DATA = Path(__file__).parent
BASE_F = DATA / "diseases.json"
QA_F = DATA / "qa_pairs.json"


def main() -> None:
    for f in (BASE_F, QA_F):
        bak = f.with_suffix(f.suffix + ".bak")
        if not bak.exists():
            shutil.copy(f, bak)

    base = json.loads(BASE_F.read_text(encoding="utf-8"))
    seen = {d["id"] for d in base}
    added = []
    for extra in sorted(DATA.glob("diseases_bd_extra*.json")):
        for d in json.loads(extra.read_text(encoding="utf-8")):
            if d["id"] not in seen:
                base.append(d)
                seen.add(d["id"])
                added.append(d["id"])

    qa = []
    for d in base:
        for item in d.get("qa", []):
            qa.append({
                "disease_id": d["id"],
                "disease_name_en": d["name_en"],
                "disease_name_bn": d["name_bn"],
                "category": d["category"],
                "specialty": d["specialty"],
                "question": item["q"],
                "answer": item["a"],
            })

    BASE_F.write_text(json.dumps(base, ensure_ascii=False, indent=2), encoding="utf-8")
    QA_F.write_text(json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Merged. diseases: {len(base)} (added {len(added)}: {added}); qa pairs: {len(qa)}")


if __name__ == "__main__":
    main()

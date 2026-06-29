# CJP Healthcare AI — MedSakhi (মেডসখি)

**Production-grade MVP: AI-assisted health triage and information platform for women in Bangladesh.**

Built with Next.js 14, FastAPI, ChromaDB (RAG), and Claude Sonnet 4.6. 100 Bangladesh-relevant diseases indexed. 1,000+ Q&A pairs in the knowledge base. Multilingual (Bangla + English).

> ⚠️ **MVP / demo scope.** This is *not* a regulated medical device. It does not diagnose. It is an information and routing platform that helps users understand symptoms and reach the right doctor faster. DGDA approval, clinical validation, and HIPAA-grade infrastructure are explicitly out of scope for this build.

---

## Architecture

```
┌────────────────────┐         ┌────────────────────┐         ┌──────────────────┐
│   Next.js 14 UI    │◄───────►│  FastAPI Backend   │◄───────►│  Claude Sonnet   │
│  - Chat            │  HTTP   │  - 5 Agents        │  HTTPS  │   4.6 + Vision   │
│  - Triage          │         │  - RAG retrieval   │         └──────────────────┘
│  - Image Analysis  │         │  - Safety layer    │         ┌──────────────────┐
│  - Hospital finder │         │  - Confidence      │◄───────►│  Google Places   │
└────────────────────┘         └─────────┬──────────┘         └──────────────────┘
                                         │
                                         ▼
                               ┌────────────────────┐
                               │  ChromaDB (local)  │
                               │  - 100 diseases    │
                               │  - 1000 Q&A pairs  │
                               │  - Multilingual    │
                               │    embeddings      │
                               └────────────────────┘
```

### Why these choices

| Layer | Choice | Why |
|---|---|---|
| LLM | Claude Sonnet 4.6 | Strong medical reasoning, vision built-in, lower hallucination than alternatives |
| Embeddings | `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` | Free, runs locally, works for Bangla + English in one model |
| Vector DB | ChromaDB persistent | Local, free, no external service to provision for an MVP |
| Image classification | Claude vision (not custom CNN) | Training a 100-class medical CNN would take 6+ months and clinical datasets you don't have. Claude vision + your disease taxonomy gets you 80% there in days. |
| Frontend | Next.js 14 App Router + Tailwind | Fast iteration, server components, easy investor demos |
| Backend | FastAPI | Async, Pydantic schemas, auto OpenAPI docs |

---

## Project structure

```
cjp-healthcare-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry + lifespan ingestion
│   │   ├── config.py                # Settings
│   │   ├── agents/                  # 5 modular agents
│   │   │   ├── base.py
│   │   │   ├── symptom_analyzer.py
│   │   │   ├── disease_recommender.py
│   │   │   ├── triage_agent.py
│   │   │   ├── hospital_finder.py
│   │   │   └── image_analyzer.py
│   │   ├── rag/                     # ChromaDB + embeddings + retrieval
│   │   │   ├── chroma_client.py
│   │   │   ├── embeddings.py
│   │   │   ├── ingestion.py
│   │   │   └── retrieval.py
│   │   ├── routes/                  # API endpoints
│   │   │   ├── chat.py
│   │   │   ├── triage.py
│   │   │   ├── image.py
│   │   │   ├── hospitals.py
│   │   │   ├── diseases.py
│   │   │   └── health.py
│   │   ├── safety/                  # Guardrails layer
│   │   │   ├── guardrails.py        # Emergency detection
│   │   │   ├── confidence.py        # Confidence scoring
│   │   │   └── disclaimers.py       # EN/BN auto-language
│   │   ├── prompts/system_prompts.py
│   │   └── schemas/models.py        # Pydantic models
│   ├── data/
│   │   ├── generate_diseases.py     # Generator script
│   │   ├── diseases.json            # 100 diseases across 18 specialties
│   │   └── qa_pairs.json            # 1000 Q&A pairs
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx               # Disclaimer + nav on every page
│   │   ├── page.tsx                 # Landing
│   │   ├── chat/page.tsx
│   │   ├── triage/page.tsx          # ⭐ Demo gold
│   │   ├── image-analysis/page.tsx
│   │   └── hospitals/page.tsx
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Disclaimer.tsx
│   │   ├── ConfidenceBadge.tsx
│   │   ├── EmergencyAlert.tsx
│   │   └── HospitalList.tsx
│   ├── lib/api.ts                   # API client + TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Quick start

### Option 1 — Docker (recommended)

```bash
# 1. Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env and add your two API keys:
#   ANTHROPIC_API_KEY=sk-ant-...
#   GOOGLE_MAPS_API_KEY=AIza...

# 2. Build and run
docker compose up --build

# 3. Open
# Frontend → http://localhost:3000
# Backend docs → http://localhost:8000/docs
```

First-run build takes ~5 minutes (downloading the embedding model into the image). Subsequent starts are near-instant.

### Option 2 — Local development

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # then edit .env
uvicorn app.main:app --reload --port 8000
```

The first request triggers RAG ingestion of the 100 diseases + 1000 Q&As. Watch logs for: `✅ Ingested 1100 documents`.

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## Getting API keys

| Key | Where | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | https://console.anthropic.com → API Keys | Pay-per-use. ~500 BDT covers thousands of demo queries. |
| `GOOGLE_MAPS_API_KEY` | https://console.cloud.google.com → enable "Places API" → Credentials | Free tier covers ~10k calls/month. |

---

## API endpoints

Auto-generated docs at http://localhost:8000/docs (FastAPI Swagger).

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/chat` | Conversational health Q&A with RAG + memory |
| POST | `/api/triage` | ⭐ Symptoms → specialty + urgency + hospitals (combined demo endpoint) |
| POST | `/api/image/analyze` | Multipart upload: prescription / lab report / injury / skin |
| POST | `/api/hospitals/search` | Find hospitals via Google Places |
| GET | `/api/diseases` | Browse 100-disease knowledge base (filter by category/specialty/search) |
| GET | `/api/diseases/{id}` | Detailed info for one disease |
| GET | `/api/diseases/categories/list` | All 18 medical categories |
| GET | `/` | Health check |

### Sample request (triage)

```bash
curl -X POST http://localhost:8000/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "Boker bame chap chap betha, siri uthte koshto hocche",
    "age": 45,
    "gender": "female",
    "lat": 23.8103,
    "lng": 90.4125
  }'
```

Returns specialty (`cardiology`), urgency (`high`), possible conditions, red flags, self-care, questions for the doctor, **and** 5 nearby cardiac hospitals with ratings and Google Maps links.

---

## Safety architecture

Every chat/triage response passes through three layers:

1. **Pre-call guardrails** (`app/safety/guardrails.py`)
   - Emergency keyword detection (EN + BN): chest pain, heavy bleeding, suicidal ideation, eclampsia signs, stroke signs
   - Unsafe request filtering (e.g., dosage requests)

2. **Confidence scoring** (`app/safety/confidence.py`)
   - Based on RAG retrieval similarity scores
   - High / Medium / Low badge surfaced to user

3. **Post-call disclaimers** (`app/safety/disclaimers.py`)
   - Auto-detected language (Bangla Unicode range U+0980–U+09FF)
   - Doctor consultation recommendation appended to every symptom-related response

The disclaimer banner is also persistent on every page of the frontend.

---

## RAG pipeline

On backend startup (lifespan hook):
1. Connect to ChromaDB persistent client (`./chroma_db`)
2. If collection empty → ingest `data/diseases.json` (100 docs) + `data/qa_pairs.json` (1000 docs)
3. Embed each doc with multilingual MiniLM
4. Store with metadata: `type` (disease|qa), `category`, `specialty`, `disease_id`

On each query:
1. Embed user query
2. Top-k retrieval (default k=5) with optional metadata filters
3. Build context block → inject into Claude system prompt
4. Confidence = mean of top retrieval similarities

To re-ingest after editing data:
```bash
docker compose exec backend python -m app.rag.ingestion
# or locally: cd backend && python -m app.rag.ingestion
```

---

## Knowledge base contents

**100 diseases** across 18 specialties:

| Category | Examples |
|---|---|
| Cardiovascular | Coronary artery disease, hypertension, heart failure |
| Gynecology | PCOS, endometriosis, UTI, vaginal infections |
| Obstetrics | Gestational diabetes, preeclampsia, postpartum depression |
| Infectious | Dengue, typhoid, malaria, TB, hepatitis B, COVID-19 |
| Endocrine | Type 2 diabetes, hypothyroidism, PCOS-related insulin resistance |
| Respiratory | Asthma, COPD, pneumonia |
| Dermatology | Eczema, fungal infections, melasma |
| ... (12 more) | |

**1,000 Q&A pairs** distributed across these diseases (~10 per disease), covering: symptoms, causes, when to see a doctor, treatment overview (informational), self-care, prevention, Bangladesh-specific risk factors.

To expand to 10,000 Q&As: edit `backend/data/generate_diseases.py` to increase questions-per-disease, or add a Claude-generation script that produces synthetic Q&As from the disease metadata.

---

## Demo script for investors (90 seconds)

> **Set the scene:** "In Bangladesh, women often delay seeing doctors. They don't know which specialist they need, the nearest specialist hospital, or whether their symptom is serious. MedSakhi closes that gap."

**[Show triage page]**

1. Type Bangla input: `boker bame chap chap betha, siri uthte koshto, age 45`
2. Click *Run Triage*
3. In 8 seconds, the screen shows:
   - ⭐ **Recommended specialty: Cardiology** (large, prominent)
   - 🔴 **Urgency: HIGH**
   - Possible conditions: angina, coronary artery disease (framed as possibilities, not diagnosis)
   - Red flags: when to go to ER
   - Self-care while waiting
   - Questions to ask her doctor
   - **5 cardiology hospitals nearby**, with ratings, open-now status, and one-tap Google Maps directions

> "That entire patient journey — symptom understanding, specialty matching, hospital discovery — is compressed into one screen. The AI is grounded on 100 Bangladesh-relevant conditions, runs guardrails for emergencies, and shows confidence levels so users know how much to trust the answer."

**[Show image analysis]**

1. Upload a prescription photo
2. Returns: structured medication list, dosages, doctor's notes, warnings, follow-up timing

> "Many of our users can't read English prescriptions. This makes them legible."

**Cost slide:**
- Per-query cost: ~2 BDT in API spend
- At 200 BDT/month premium tier with average 100 queries/user = ~80% margin
- Total demo cost tonight: under 500 BDT

---

## Customization

| Want to… | Edit |
|---|---|
| Change AI personality / language style | `backend/app/prompts/system_prompts.py` |
| Add more diseases | `backend/data/generate_diseases.py`, re-run, restart |
| Add a new agent (e.g., medication interaction checker) | Create `backend/app/agents/your_agent.py` inheriting `BaseAgent`, add route in `app/routes/` |
| Change branding | `frontend/tailwind.config.ts` (brand colors), `frontend/app/layout.tsx` (title), `frontend/components/Nav.tsx` (logo) |
| Add user auth | Not in MVP. Add Clerk or Auth.js to frontend, JWT middleware to backend. |
| Switch to Pinecone / cloud vector DB | Replace `backend/app/rag/chroma_client.py` |

---

## What this MVP does NOT do (yet)

Be honest with investors. These are post-funding scope:

- ❌ User authentication & persistent profiles (no DB yet beyond Chroma)
- ❌ HIPAA / data privacy certifications
- ❌ DGDA medical device registration
- ❌ Clinical validation studies
- ❌ Insurance / appointment booking integration
- ❌ Doctor-side dashboard or telemedicine
- ❌ Voice input (Whisper integration is one Claude Code prompt away)
- ❌ Production observability (Sentry, logging pipeline, rate limiting)

---

## Tech debt to address before launch

1. Add SQLite/Postgres for query logging (currently nothing persists beyond ChromaDB)
2. Rate limiting on FastAPI routes (currently open)
3. Auth middleware
4. Move from in-memory `multer`-equivalent to S3 for image uploads
5. Add Sentry for error tracking
6. Caching layer (Redis) for frequent triage patterns
7. Expand Q&A from 1,000 → 10,000+ using Claude generation
8. Unit + integration tests (only structural tests/ folder exists)

---

## License

Proprietary — © CJP Healthtech 2026.

Built for investor demonstration. Not for clinical use.

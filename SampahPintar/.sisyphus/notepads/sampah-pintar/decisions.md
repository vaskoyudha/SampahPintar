# SampahPintar — Decisions

## [2026-02-22] Session ses_37adcd2e6ffeOHieb1PvFeMEUZ — Plan decisions

### Architecture
- In-memory store (no Supabase) for MVP — `src/lib/sampah-pintar/store.ts`
- Mock CV classifier — deterministic, seeded by djb2 hash of image buffer
- OpenAI GPT-4o-mini via native fetch (no SDK), fallback hardcoded response when no API key
- Rate limiting: inline per-route Map-based implementation (not shared utility)

### Scope
- 5 page routes under /sampah-pintar/
- 6 API routes under /api/v1/sampah-pintar/
- TPA cities: Jakarta (Bantar Gebang), Surabaya (Benowo), Bandung (Sarimukti), Semarang (Jatibarang), Makassar (Tamangapa)
- Waste categories (SIPSN): organik, plastik, kertas, logam, kaca, b3, residu

### Material Filter (Momus finding)
- Task 11 API accepts single `material` param
- Task 17 UI has multiple checkboxes
- Resolution: API accepts comma-separated materials OR single value. Page passes comma-joined string when multiple checked, omits param when all checked.

# SampahPintar — Household Waste Composition Analyzer & TPA Capacity Predictor

## TL;DR

> **Quick Summary**: Build a 5-module waste management system inside the existing AirBersih Next.js app: mock waste photo classifier → neighborhood composition dashboard → TPA capacity predictor for 5 Indonesian metro cities → OpenAI-powered policy recommendation engine → recycling facility geospatial locator with material filter.
> 
> **Deliverables**:
> - Photo upload + mock CV classifier with 7 SIPSN waste categories
> - Manual data entry form for neighborhood waste composition
> - Interactive composition dashboard with Chart.js visualizations per kelurahan
> - TPA capacity exhaustion predictor for Jakarta, Surabaya, Bandung, Semarang, Makassar
> - LLM policy recommendation engine (OpenAI GPT-4o-mini) with structured JSON output
> - Recycling facility map (MapLibre + OSM) with material acceptance filter
> - Full i18n support (Bahasa Indonesia + English)
> - 6 API endpoints under /api/v1/sampah-pintar/
> - Navigation integration with AirBersih navbar
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Types/Seed Data → API Routes → Dashboard/TPA/Policy Pages → Integration Verification

---

## Context

### Original Request
Build SampahPintar: a household waste composition analyzer + TPA (landfill) capacity predictor. Computer vision model identifies waste types from photo uploads → composition dashboard per neighborhood → ML model predicts TPA capacity exhaustion date for major Indonesian cities → policy recommendation LLM generates waste reduction targets → recycling facility geospatial locator with material acceptance filter.

### Interview Summary
**Key Discussions**:
- **Tech Stack**: Next.js 16 App Router inside existing AirBersih project (no separate Python backend for MVP)
- **CV Approach**: Mock/simulated classifier for MVP — returns realistic waste category distributions
- **Scope**: All 5 modules in a single plan
- **LLM**: OpenAI GPT-4o-mini via server-side API route
- **Target Cities**: Jakarta (Bantar Gebang), Surabaya (Benowo), Bandung (Sarimukti), Semarang (Jatibarang), Makassar (Tamangapa)
- **Auth**: None — fully public
- **Data Entry**: Photo upload + manual entry forms
- **Tests**: No unit tests; Agent-Executed QA (Playwright + curl) only
- **Route Structure**: /sampah-pintar/* namespace

**Research Findings**:
- AirBersih uses Next.js 16, React 19, TypeScript, Supabase, MapLibre GL, Chart.js, Tailwind v4, Lucide icons
- Existing patterns: client-layout.tsx for providers, lib/types.ts for interfaces, /api/v1/ REST convention
- SIPSN standard: 7 waste categories (Organik, Plastik, Kertas/Karton, Logam, Kaca, B3, Residu)
- TPA formula: Population × 0.7 kg/person/day × (1 - recycling_rate) / compaction_density
- OSM Overpass API has active Indonesian recycling facility mapping (Bank Sampah)

### Metis Review
**Identified Gaps (addressed):**
- **App root path**: SampahPintar routes go into `C:\Project Vasko\AirBersih\src\app\sampah-pintar\` (the parent AirBersih app root)
- **Public-write strategy**: All writes go through server API routes (not direct Supabase anon writes) to prevent spam and enable validation
- **Photo storage**: Discard after mock classification for MVP — no Supabase Storage
- **Overpass caching**: Server-side proxy with in-memory cache (5 min TTL) + timeout handling + empty-result fallback
- **Client-only patterns**: MapLibre and Chart.js behind `'use client'` + dynamic import with `ssr: false`
- **Rate limiting**: Simple in-memory rate limiter on OpenAI and Overpass proxy routes (10 req/min per IP)
- **Kelurahan data**: Canonical seed list per city (not free-text) — fixed hierarchy: Kota → Kecamatan → Kelurahan
- **TPA constants**: Fixed per-city values (not user-adjustable) with published source disclaimers
- **OpenAI output**: Structured JSON with `language` field matching i18n locale; includes disclaimer about AI-generated content
- **Data integrity**: All submissions have `is_verified: false` default; visible immediately but clearly marked
- **Rounding/determinism**: Mock CV uses seeded random based on file hash for deterministic results per image

---

## Work Objectives

### Core Objective
Build a fully functional 5-module waste management analysis tool inside AirBersih's Next.js app, with mock/seed data providing realistic but simulated outputs, ready for future integration with real CV models and live data sources.

### Concrete Deliverables
- 5 page routes under `/sampah-pintar/`
- 6 API routes under `/api/v1/sampah-pintar/`
- TypeScript types for all data models
- Seed data for 5 cities with realistic TPA and kelurahan data
- Mock CV classification engine
- Chart.js dashboard components
- MapLibre recycling facility map with material filter
- OpenAI integration for policy recommendations
- i18n strings for all modules in id/en

### Definition of Done
- [ ] All 5 pages render without console errors
- [ ] All 6 API endpoints return correct JSON with proper status codes
- [ ] Photo upload → mock classification → visible in dashboard flow works end-to-end
- [ ] TPA predictor shows capacity exhaustion timelines for all 5 cities
- [ ] Policy recommendation returns structured JSON in correct language
- [ ] Recycling map displays facilities with working material filter
- [ ] `npm run build` passes with zero errors
- [ ] All pages accessible via AirBersih navigation

### Must Have
- 7 SIPSN waste categories consistently used across all modules
- Server-side-only OpenAI API key handling
- MapLibre/Chart.js client-only rendering (no SSR crashes)
- Proper error states for all API failures
- Responsive design matching AirBersih dark theme
- i18n for all user-facing strings

### Must NOT Have (Guardrails)
- NO real CV model training or inference — mock only
- NO direct Supabase writes from client — server API routes only
- NO user authentication or accounts
- NO Python backend or microservices
- NO live SIPSN/BPS API ingestion
- NO routing/navigation/directions in recycling locator — location pins only
- NO admin panel or moderation tools
- NO `as any` or `@ts-ignore` in TypeScript
- NO console.log in production code (use proper error handling)
- NO hardcoded API keys — env vars only

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: NONE
- **Framework**: N/A
- **QA Method**: Agent-Executed QA only (Playwright for UI, curl for API)

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Build**: `npm run build` must pass after every wave

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — types, seed data, shared components):
├── Task 1: TypeScript types & interfaces [quick]
├── Task 2: Seed data — TPA cities & kelurahan [quick]
├── Task 3: Seed data — recycling facilities [quick]
├── Task 4: Mock CV classification engine [quick]
├── Task 5: SampahPintar layout + navigation integration [quick]
└── Task 6: i18n strings for all modules [quick]

Wave 2 (API Routes — all independent once types exist):
├── Task 7: API — /classify (photo upload + mock CV) [unspecified-high]
├── Task 8: API — /composition (aggregation query) [quick]
├── Task 9: API — /tpa-forecast (capacity prediction) [unspecified-high]
├── Task 10: API — /policy-recommend (OpenAI integration) [deep]
├── Task 11: API — /recycling-facilities (OSM proxy + cache) [unspecified-high]
└── Task 12: API — /manual-entry (composition form submit) [quick]

Wave 3 (Pages — UI consuming APIs):
├── Task 13: Page — /sampah-pintar (landing + upload) [visual-engineering]
├── Task 14: Page — /sampah-pintar/dashboard (Chart.js composition) [visual-engineering]
├── Task 15: Page — /sampah-pintar/tpa (capacity predictor) [visual-engineering]
├── Task 16: Page — /sampah-pintar/kebijakan (policy recommendations) [visual-engineering]
└── Task 17: Page — /sampah-pintar/daur-ulang (recycling map) [visual-engineering]

Wave 4 (Integration + Build):
├── Task 18: End-to-end integration wiring + build verification [deep]

Wave FINAL (Verification — 4 parallel reviews):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real manual QA [unspecified-high]
└── Task F4: Scope fidelity check [deep]

Critical Path: T1→T7→T13→T18→F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 6 (Waves 1 & 2)
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
|------|-----------|--------|------|
| T1 (Types) | — | T2-T17 | 1 |
| T2 (TPA Seed) | T1 | T9, T15 | 1 |
| T3 (Recycling Seed) | T1 | T11, T17 | 1 |
| T4 (Mock CV) | T1 | T7 | 1 |
| T5 (Layout) | — | T13-T17 | 1 |
| T6 (i18n) | — | T13-T17 | 1 |
| T7 (Classify API) | T1, T4 | T13, T14 | 2 |
| T8 (Composition API) | T1 | T14 | 2 |
| T9 (TPA API) | T1, T2 | T15 | 2 |
| T10 (Policy API) | T1 | T16 | 2 |
| T11 (Recycling API) | T1, T3 | T17 | 2 |
| T12 (Manual Entry API) | T1 | T13 | 2 |
| T13 (Landing Page) | T5, T6, T7, T12 | T18 | 3 |
| T14 (Dashboard Page) | T5, T6, T7, T8 | T18 | 3 |
| T15 (TPA Page) | T5, T6, T9 | T18 | 3 |
| T16 (Policy Page) | T5, T6, T10 | T18 | 3 |
| T17 (Recycling Page) | T5, T6, T11 | T18 | 3 |
| T18 (Integration) | T13-T17 | F1-F4 | 4 |
| F1-F4 (Final) | T18 | — | FINAL |

### Agent Dispatch Summary

| Wave | Tasks | Categories |
|------|-------|------------|
| 1 | 6 | T1-T4 → `quick`, T5 → `quick`, T6 → `quick` |
| 2 | 6 | T7 → `unspecified-high`, T8 → `quick`, T9 → `unspecified-high`, T10 → `deep`, T11 → `unspecified-high`, T12 → `quick` |
| 3 | 5 | T13-T17 → `visual-engineering` |
| 4 | 1 | T18 → `deep` |
| FINAL | 4 | F1 → `oracle`, F2-F3 → `unspecified-high`, F4 → `deep` |

---

## TODOs

- [ ] 1. TypeScript Types & Interfaces

  **What to do**:
  - Create `src/lib/sampah-pintar/types.ts` with all TypeScript interfaces for the SampahPintar domain
  - Define `WasteCategory` enum: `organik | plastik | kertas | logam | kaca | b3 | residu`
  - Define `WasteClassification` interface: `{ category: WasteCategory; percentage: number; confidence: number }`
  - Define `ClassificationResult`: `{ id: string; classifications: WasteClassification[]; imageHash: string; kelurahan: string; kecamatan: string; city: string; timestamp: string; isVerified: boolean }`
  - Define `CompositionAggregate`: `{ kelurahan: string; kecamatan: string; city: string; sampleCount: number; composition: Record<WasteCategory, number>; period: string }`
  - Define `TPACity`: `{ id: string; name: string; tpaName: string; city: string; totalCapacityM3: number; usedCapacityM3: number; populationServed: number; dailyWasteTons: number; recyclingRate: number; compactionDensity: number; openDate: string }`
  - Define `TPAForecast`: `{ cityId: string; month: string; projectedUsedM3: number; projectedRemainingM3: number; fillPercentage: number }`
  - Define `TPAForecastResult`: `{ city: TPACity; forecasts: TPAForecast[]; exhaustionDate: string; yearsRemaining: number }`
  - Define `PolicyRecommendation`: `{ cityId: string; language: 'id' | 'en'; summary: string; targets: { category: WasteCategory; currentRate: number; targetRate: number; action: string }[]; disclaimer: string; generatedAt: string }`
  - Define `RecyclingFacility`: `{ id: string; name: string; lat: number; lng: number; address: string; acceptedMaterials: WasteCategory[]; type: 'bank_sampah' | 'tps3r' | 'recycling_center'; phone?: string; operatingHours?: string }`
  - Define `ManualEntryPayload`: `{ kelurahan: string; kecamatan: string; city: string; composition: Record<WasteCategory, number>; notes?: string }`
  - Define API response wrapper: `{ success: boolean; data?: T; error?: string; meta?: { timestamp: string } }`

  **Must NOT do**:
  - Do NOT use `any` type anywhere
  - Do NOT create runtime code — types only
  - Do NOT import external dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure TypeScript type definitions — no complex logic, single file
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5, 6)
  - **Blocks**: Tasks 2, 3, 4, 7, 8, 9, 10, 11, 12
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/types.ts` — AirBersih's existing type definitions. Follow the same export pattern and interface naming conventions (PascalCase, descriptive names)

  **External References**:
  - SIPSN waste categories: Organik, Plastik, Kertas/Karton, Logam, Kaca, B3 (Berbahaya), Residu

  **WHY Each Reference Matters**:
  - `src/lib/types.ts`: Copy the exact style — single-file barrel of interfaces, no classes, no runtime code

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Types file compiles without errors
    Tool: Bash
    Preconditions: AirBersih project with npm dependencies installed
    Steps:
      1. Run `npx tsc --noEmit src/lib/sampah-pintar/types.ts`
      2. Assert exit code is 0
    Expected Result: Zero TypeScript errors
    Failure Indicators: Non-zero exit code or error messages in stdout
    Evidence: .sisyphus/evidence/task-1-types-compile.txt

  Scenario: All named exports exist
    Tool: Bash
    Preconditions: types.ts exists
    Steps:
      1. Grep for exports: WasteCategory, ClassificationResult, TPACity, TPAForecast, RecyclingFacility, PolicyRecommendation, ManualEntryPayload, CompositionAggregate
      2. Assert all 8+ types are exported
    Expected Result: All types found as named exports
    Failure Indicators: Missing exports
    Evidence: .sisyphus/evidence/task-1-types-exports.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/lib/sampah-pintar/types.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 2. Seed Data — TPA Cities & Kelurahan Hierarchy

  **What to do**:
  - Create `src/lib/sampah-pintar/data/tpa-cities.ts` with realistic seed data for 5 Indonesian metro TPAs
  - Create `src/lib/sampah-pintar/data/kelurahan.ts` with canonical kelurahan hierarchy per city
  - Jakarta (Bantar Gebang): totalCapacity ~49M m³, opened 1989, ~70% full, population ~10.5M, dailyWaste ~7,000 tons, recyclingRate 0.08
  - Surabaya (Benowo): totalCapacity ~12M m³, opened 2001, ~65% full, population ~2.9M, dailyWaste ~2,100 tons, recyclingRate 0.12
  - Bandung (Sarimukti): totalCapacity ~8M m³, opened 2006, ~75% full, population ~2.5M, dailyWaste ~1,800 tons, recyclingRate 0.10
  - Semarang (Jatibarang): totalCapacity ~5.5M m³, opened 1992, ~80% full, population ~1.7M, dailyWaste ~1,200 tons, recyclingRate 0.07
  - Makassar (Tamangapa): totalCapacity ~4M m³, opened 1994, ~85% full, population ~1.5M, dailyWaste ~1,000 tons, recyclingRate 0.06
  - Kelurahan hierarchy: 5-8 kelurahan per city, organized as `{ city, kecamatan, kelurahan }` tuples
  - Each kelurahan should have sample composition data (realistic proportions): organik ~60%, plastik ~15%, kertas ~10%, logam ~3%, kaca ~2%, b3 ~2%, residu ~8%
  - Include `compactionDensity` per TPA (typically 0.6-0.8 tons/m³)
  - All data typed using interfaces from Task 1

  **Must NOT do**:
  - Do NOT fetch live data from any API
  - Do NOT claim data is official — include disclaimer comment in source

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Static data file creation with known values
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5, 6)
  - **Blocks**: Tasks 9, 15
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **Pattern References**:
  - `src/lib/constants/water-standards.ts` — AirBersih's existing constants file. Follow the same export-const pattern.

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:TPACity` — The interface this seed data implements
  - `src/lib/sampah-pintar/types.ts:CompositionAggregate` — Kelurahan composition structure

  **External References**:
  - SIPSN data portal (sipsn.menlhk.go.id) — real-world reference for TPA capacity ranges
  - BPS population data — population figures for realism

  **WHY Each Reference Matters**:
  - `water-standards.ts`: Shows how AirBersih structures constant data — array of typed objects, exported as const

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TPA seed data compiles and has 5 cities
    Tool: Bash
    Preconditions: Task 1 types exist
    Steps:
      1. Run `npx tsc --noEmit src/lib/sampah-pintar/data/tpa-cities.ts`
      2. Assert exit code is 0
      3. Grep for city names: jakarta, surabaya, bandung, semarang, makassar
    Expected Result: 5 TPACity objects, all fields populated
    Failure Indicators: Compilation errors or fewer than 5 cities
    Evidence: .sisyphus/evidence/task-2-tpa-seed.txt

  Scenario: Kelurahan hierarchy is complete
    Tool: Bash
    Preconditions: kelurahan.ts exists
    Steps:
      1. Run `npx tsc --noEmit src/lib/sampah-pintar/data/kelurahan.ts`
      2. Verify each city has 5-8 kelurahan entries
    Expected Result: Valid hierarchy with realistic composition data
    Failure Indicators: Missing cities or missing kelurahan
    Evidence: .sisyphus/evidence/task-2-kelurahan.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/lib/sampah-pintar/data/tpa-cities.ts`, `src/lib/sampah-pintar/data/kelurahan.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 3. Seed Data — Recycling Facilities
  **What to do**:
  - Create `src/lib/sampah-pintar/data/recycling-facilities.ts` with seed data for recycling facilities across 5 cities
  - 8-12 facilities per city (40-60 total), mix of types: `bank_sampah`, `tps3r`, `recycling_center`
  - Each facility has: `id`, `name`, `lat`, `lng`, `address`, `acceptedMaterials` (subset of WasteCategory[]), `type`, optional `phone`, optional `operatingHours`
  - Coordinates must be realistic — within each city's actual geographic bounds:
    - Jakarta: lat -6.1 to -6.4, lng 106.7 to 107.0
    - Surabaya: lat -7.2 to -7.4, lng 112.6 to 112.8
    - Bandung: lat -6.85 to -7.0, lng 107.55 to 107.7
    - Semarang: lat -6.9 to -7.1, lng 110.3 to 110.5
    - Makassar: lat -5.05 to -5.25, lng 119.35 to 119.5
  - Names should be realistic Indonesian recycling names (e.g., "Bank Sampah Melati", "TPS3R Kelurahan Cakung", "Recycling Center Surabaya Timur")
  - Each facility accepts 2-5 material types (not all 7) — this enables meaningful material filtering
  - Include `disclaimer` comment: seed data, not official government records
  - All typed using `RecyclingFacility` interface from Task 1

  **Must NOT do**:
  - Do NOT fetch from Overpass API or any external source — static seed data only
  - Do NOT include B3 (hazardous) in accepted materials — recycling facilities don't accept B3
  - Do NOT place coordinates outside realistic city bounds

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Static data file — no logic, just realistic seed entries
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5, 6)
  - **Blocks**: Tasks 11, 17
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:RecyclingFacility` — The interface this seed data implements

  **Pattern References**:
  - `src/lib/constants/water-standards.ts` — AirBersih's existing constants pattern (array of typed objects, exported as const)

  **External References**:
  - OpenStreetMap — real Bank Sampah and TPS3R locations for name/address realism
  - Jakarta, Surabaya, Bandung, Semarang, Makassar city bounds for coordinate accuracy

  **WHY Each Reference Matters**:
  - `RecyclingFacility` type enforces the exact shape — acceptedMaterials must be WasteCategory[], coordinates must be numbers
  - Coordinates must be within city bounds or MapLibre will render pins in the ocean

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Recycling facilities file compiles with correct count
    Tool: Bash
    Preconditions: Task 1 types exist
    Steps:
      1. Run `npx tsc --noEmit src/lib/sampah-pintar/data/recycling-facilities.ts`
      2. Assert exit code is 0
      3. Verify 40-60 total facilities across 5 cities
      4. Verify each facility has valid lat/lng within expected city bounds
    Expected Result: Compiles, 40-60 facilities, realistic coordinates
    Failure Indicators: Type errors, too few facilities, out-of-bounds coordinates
    Evidence: .sisyphus/evidence/task-3-recycling-seed.txt

  Scenario: Material diversity exists for meaningful filtering
    Tool: Bash
    Preconditions: recycling-facilities.ts exists
    Steps:
      1. Check that not all facilities accept the same materials
      2. Verify each facility has 2-5 accepted material types
      3. Verify no facility includes 'b3' in acceptedMaterials
    Expected Result: Diverse material acceptance enabling meaningful filter UX
    Failure Indicators: All facilities accept same materials, any facility accepts b3
    Evidence: .sisyphus/evidence/task-3-material-diversity.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/lib/sampah-pintar/data/recycling-facilities.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 4. Mock CV Classification Engine

  **What to do**:
  - Create `src/lib/sampah-pintar/mock-classifier.ts` — a deterministic mock waste classification function
  - Function signature: `classifyWaste(imageBuffer: Buffer): ClassificationResult`
  - Generate a seeded hash from the image buffer (use simple hash like djb2) for deterministic results — same image always returns same classification
  - Return realistic distributions: organik (45-65%), plastik (10-20%), kertas (8-15%), logam (2-5%), kaca (1-4%), b3 (1-3%), residu (5-12%)
  - Percentages must sum to exactly 100% (normalize after generation)
  - Confidence scores per category: 0.75-0.95 range
  - Generate a unique `id` (UUID v4) and `timestamp` (ISO string) per classification
  - Set `isVerified: false` for all mock results
  - Export helper: `getWasteCategoryLabel(category: WasteCategory, lang: 'id' | 'en'): string` for display names
  - Export constant: `WASTE_CATEGORY_COLORS: Record<WasteCategory, string>` for consistent chart colors

  **Must NOT do**:
  - Do NOT use any ML/AI libraries — pure math-based mock
  - Do NOT call external APIs
  - Do NOT use `Math.random()` without seed — must be deterministic per image

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single utility file with deterministic logic, no external deps
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5, 6)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:ClassificationResult` — Return type interface
  - `src/lib/sampah-pintar/types.ts:WasteCategory` — Category enum

  **WHY Each Reference Matters**:
  - Types define the exact shape the classifier must return — strict contract

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Mock classifier returns valid distribution
    Tool: Bash
    Preconditions: types.ts exists
    Steps:
      1. Run `npx tsc --noEmit src/lib/sampah-pintar/mock-classifier.ts`
      2. Assert exit code 0
      3. Verify function is exported
    Expected Result: Compiles with no errors, function exported
    Failure Indicators: Type errors, missing exports
    Evidence: .sisyphus/evidence/task-4-mock-cv.txt

  Scenario: Determinism — same input yields same output
    Tool: Bash
    Preconditions: mock-classifier.ts exists
    Steps:
      1. Write a small Node script that calls classifyWaste with the same buffer twice
      2. Compare both results
    Expected Result: Identical classification results for identical input
    Failure Indicators: Different results on same input
    Evidence: .sisyphus/evidence/task-4-determinism.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/lib/sampah-pintar/mock-classifier.ts`
  - Pre-commit: `npx tsc --noEmit`

- [ ] 5. SampahPintar Layout + Navigation Integration

  **What to do**:
  - Create `src/app/sampah-pintar/layout.tsx` — shared layout for all SampahPintar pages
  - Include sub-navigation bar with links to all 5 module pages: Beranda (home/upload), Dashboard, TPA, Kebijakan (policy), Daur Ulang (recycling)
  - Use `'use client'` directive for interactive nav state
  - Match AirBersih dark theme: black/dark gray background, white text, subtle borders
  - Responsive design: sidebar on desktop (>1024px), bottom tabs on mobile
  - Use Lucide React icons for each nav item: Upload, BarChart3, TrendingUp, FileText, MapPin
  - Active route highlighting using `usePathname()` from next/navigation
  - Update `src/components/layout/Navbar.tsx` to add "SampahPintar" link in the main AirBersih navigation
  - Create breadcrumb showing: AirBersih > SampahPintar > [Current Page]

  **Must NOT do**:
  - Do NOT create a separate root layout — nest within AirBersih's existing layout
  - Do NOT add authentication checks
  - Do NOT change AirBersih's global styles

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Layout component creation following existing patterns
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 6)
  - **Blocks**: Tasks 13, 14, 15, 16, 17
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/app/layout.tsx` — Root layout pattern to nest under
  - `src/app/client-layout.tsx` — Client component layout wrapper pattern
  - `src/components/layout/Navbar.tsx` — Main navigation to add SampahPintar link to

  **WHY Each Reference Matters**:
  - `layout.tsx`: Must nest properly under existing root layout — wrong nesting breaks the entire app
  - `Navbar.tsx`: Must add link without breaking existing navigation structure
  - `client-layout.tsx`: Shows the `'use client'` layout wrapper pattern used in this project

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Layout renders with sub-navigation
    Tool: Playwright
    Preconditions: Dev server running at localhost:3000
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar
      2. Assert nav element exists with selector `nav` or `[data-testid="sampah-nav"]`
      3. Assert 5 nav links present: Beranda, Dashboard, TPA, Kebijakan, Daur Ulang
      4. Assert dark theme (background-color is dark, text is light)
      5. Screenshot full page
    Expected Result: Layout visible with 5 navigation items, dark theme
    Failure Indicators: Missing nav, wrong number of links, light theme
    Evidence: .sisyphus/evidence/task-5-layout.png

  Scenario: AirBersih navbar has SampahPintar link
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000
      2. Assert link with text "SampahPintar" or "Sampah Pintar" exists in main navbar
      3. Click the link
      4. Assert URL is now /sampah-pintar
    Expected Result: SampahPintar accessible from main AirBersih navigation
    Failure Indicators: Link missing or navigates to wrong URL
    Evidence: .sisyphus/evidence/task-5-navbar-link.png
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/app/sampah-pintar/layout.tsx`, `src/components/layout/Navbar.tsx`
  - Pre-commit: `npm run build`

- [ ] 6. i18n Strings for All Modules

  **What to do**:
  - Add SampahPintar section to `src/lib/i18n/id.json` with all Indonesian strings
  - Add SampahPintar section to `src/lib/i18n/en.json` with all English strings
  - Strings needed for all 5 modules:
    - Navigation: beranda, dashboard, tpa, kebijakan, daurUlang
    - Upload page: uploadTitle, uploadDesc, uploadButton, classifying, classificationResult, manualEntry, manualEntryDesc, kelurahan, kecamatan, city, composition, notes, submit
    - Dashboard: dashboardTitle, dashboardDesc, selectCity, selectKelurahan, composition, sampleCount, period, noData
    - TPA: tpaTitle, tpaDesc, selectCity, capacityUsed, remainingCapacity, exhaustionDate, yearsRemaining, dailyWaste, recyclingRate
    - Policy: policyTitle, policyDesc, generateRecommendation, generating, recommendationResult, disclaimer, target, currentRate, targetRate, action
    - Recycling: recyclingTitle, recyclingDesc, filterByMaterial, allMaterials, facilitiesFound, noFacilities, bankSampah, tps3r, recyclingCenter
    - Waste categories: organik, plastik, kertas, logam, kaca, b3, residu (both label and description)
    - Common: loading, error, retry, noResults
  - Follow existing i18n key naming convention (camelCase, nested objects)

  **Must NOT do**:
  - Do NOT modify existing AirBersih i18n strings — only ADD new SampahPintar section
  - Do NOT use machine-translated content for Indonesian — use natural Bahasa Indonesia

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: JSON file additions — straightforward string work
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4, 5)
  - **Blocks**: Tasks 13, 14, 15, 16, 17
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/i18n/id.json` — Existing Indonesian strings. Follow the same nesting and key naming convention.
  - `src/lib/i18n/en.json` — Existing English strings. Same structure.
  - `src/lib/i18n/index.tsx` — i18n context implementation. Understand how keys are accessed to ensure compatibility.

  **WHY Each Reference Matters**:
  - i18n JSON files must follow exact nesting convention or the `useI18n()` hook won't find the new keys
  - `index.tsx`: Shows how `t('sampahPintar.uploadTitle')` lookups work — key path must match JSON structure

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: i18n files are valid JSON with SampahPintar section
    Tool: Bash
    Preconditions: i18n files exist
    Steps:
      1. Parse src/lib/i18n/id.json with `node -e "JSON.parse(require('fs').readFileSync('src/lib/i18n/id.json'))"` — assert valid JSON
      2. Parse src/lib/i18n/en.json — assert valid JSON
      3. Assert both files contain `sampahPintar` key at root level
      4. Verify key counts match between id.json and en.json sampahPintar sections
    Expected Result: Valid JSON, matching key structures, sampahPintar section present in both
    Failure Indicators: JSON parse error, missing sampahPintar key, mismatched keys between languages
    Evidence: .sisyphus/evidence/task-6-i18n.txt
  ```

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n`
  - Files: `src/lib/i18n/id.json`, `src/lib/i18n/en.json`
  - Pre-commit: `npm run build`

- [ ] 7. API Route — /classify (Photo Upload + Mock CV)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/classify/route.ts`
  - Handle POST with multipart form data (photo file + kelurahan + kecamatan + city fields)
  - Accept image types: jpeg, png, webp. Max size: 5MB. Reject others with 400.
  - Read the uploaded file buffer, pass to `classifyWaste()` from mock-classifier.ts
  - Return `ApiResponse<ClassificationResult>` with classifications, imageHash, location info
  - Validate required fields (kelurahan, kecamatan, city must be from canonical kelurahan list)
  - Store result in memory (simple array — no DB for MVP) for dashboard aggregation
  - Add rate limiter: max 10 requests/min per IP (simple Map-based with cleanup)
  - Handle errors: invalid file type (400), oversized file (413), missing fields (400), rate limit (429)
  - Use NextRequest/NextResponse from 'next/server'

  **Must NOT do**:
  - Do NOT persist to Supabase — in-memory storage only for MVP
  - Do NOT call any real ML model
  - Do NOT accept files larger than 5MB

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: API route with file upload handling, validation, rate limiting — moderate complexity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 8, 9, 10, 11, 12)
  - **Blocks**: Tasks 13, 14
  - **Blocked By**: Tasks 1, 4 (needs types + mock classifier)

  **References**:

  **Pattern References**:
  - `src/app/api/v1/risk/[desaCode]/route.ts` — AirBersih's existing API route pattern. Follow NextResponse.json() return style.

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:ClassificationResult` — Response data shape
  - `src/lib/sampah-pintar/mock-classifier.ts:classifyWaste` — The classification function to call
  - `src/lib/sampah-pintar/data/kelurahan.ts` — Canonical kelurahan list for validation

  **WHY Each Reference Matters**:
  - Existing API route shows the exact NextResponse pattern, status codes, and error response shapes used in this project
  - Mock classifier is the core dependency — must call it correctly and return its typed result

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Successful photo classification
    Tool: Bash (curl)
    Preconditions: Dev server running at localhost:3000
    Steps:
      1. Create a small test JPEG: `convert -size 100x100 xc:red /tmp/test-waste.jpg` (or use a pre-existing small image)
      2. curl -s -w "%{http_code}" -X POST http://localhost:3000/api/v1/sampah-pintar/classify -F "photo=@/tmp/test-waste.jpg" -F "kelurahan=Cakung Barat" -F "kecamatan=Cakung" -F "city=jakarta"
      3. Assert HTTP 200
      4. Assert response JSON has `success: true`
      5. Assert `data.classifications` array has exactly 7 items
      6. Assert percentages sum to 100
    Expected Result: 200 OK with 7-category classification totaling 100%
    Failure Indicators: Non-200 status, missing categories, percentages != 100
    Evidence: .sisyphus/evidence/task-7-classify-success.txt

  Scenario: Invalid file type rejected
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. Create a text file: echo "not an image" > /tmp/test.txt
      2. curl -s -w "%{http_code}" -X POST http://localhost:3000/api/v1/sampah-pintar/classify -F "photo=@/tmp/test.txt" -F "kelurahan=Cakung Barat" -F "kecamatan=Cakung" -F "city=jakarta"
      3. Assert HTTP 400
      4. Assert response has `success: false` and error message about invalid file type
    Expected Result: 400 Bad Request with descriptive error
    Failure Indicators: 200 status (accepted invalid file) or 500 (unhandled error)
    Evidence: .sisyphus/evidence/task-7-classify-invalid.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/classify/route.ts`
  - Pre-commit: `npm run build`

- [ ] 8. API Route — /composition (Aggregation Query)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/composition/route.ts`
  - Handle GET with query params: `city` (required), `kelurahan` (optional), `kecamatan` (optional)
  - Aggregate classification results from in-memory store + seed kelurahan data
  - Return `ApiResponse<CompositionAggregate[]>` — array of composition aggregates
  - If no classifications exist yet, return seed data from kelurahan.ts
  - Support filtering: by city (mandatory), by kecamatan, by specific kelurahan
  - Include `sampleCount` showing how many data points contributed
  - Validate city name against canonical city list (jakarta, surabaya, bandung, semarang, makassar)

  **Must NOT do**:
  - Do NOT query Supabase — use in-memory store + seed data
  - Do NOT aggregate across cities — always filter by single city

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple aggregation over in-memory arrays — straightforward logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 9, 10, 11, 12)
  - **Blocks**: Task 14
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **Pattern References**:
  - `src/app/api/v1/risk/[desaCode]/route.ts` — API route pattern

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:CompositionAggregate` — Response shape
  - `src/lib/sampah-pintar/data/kelurahan.ts` — Seed data fallback

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Get composition for Jakarta
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000/api/v1/sampah-pintar/composition?city=jakarta
      2. Assert HTTP 200
      3. Assert `data` is an array with 5-8 kelurahan entries
      4. Assert each entry has `composition` object with 7 category keys
    Expected Result: 200 with Jakarta kelurahan composition data
    Failure Indicators: Empty array, missing categories, wrong city data
    Evidence: .sisyphus/evidence/task-8-composition.txt

  Scenario: Invalid city returns 400
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "%{http_code}" http://localhost:3000/api/v1/sampah-pintar/composition?city=invalid
      2. Assert HTTP 400
    Expected Result: 400 Bad Request
    Failure Indicators: 200 with empty data or 500 error
    Evidence: .sisyphus/evidence/task-8-composition-invalid.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/composition/route.ts`
  - Pre-commit: `npm run build`

- [ ] 9. API Route — /tpa-forecast (Capacity Prediction)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/tpa-forecast/route.ts`
  - Handle GET with query params: `city` (required), `months` (optional, default 60 = 5 years)
  - Load TPA city data from seed, calculate monthly capacity projection using formula:
    - Monthly waste volume = (dailyWasteTons × 30) / compactionDensity × (1 - recyclingRate)
    - Each month: projectedUsedM3 += monthlyWasteVolume
    - Account for 1.2% annual population growth (compounding monthly)
  - Return `ApiResponse<TPAForecastResult>` with: city info, monthly forecast array, exhaustion date, years remaining
  - Calculate exhaustion date: month where projectedUsedM3 >= totalCapacityM3
  - If capacity already exceeded, return exhaustion as "past" with negative yearsRemaining
  - Validate city parameter against 5 supported cities

  **Must NOT do**:
  - Do NOT use ML libraries — pure mathematical projection
  - Do NOT claim results are predictions — they're projections based on fixed assumptions
  - Do NOT allow user-adjustable parameters

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Mathematical projection logic with multiple variables — needs careful implementation
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 10, 11, 12)
  - **Blocks**: Task 15
  - **Blocked By**: Tasks 1, 2 (needs types + TPA seed data)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:TPAForecastResult` — Response shape
  - `src/lib/sampah-pintar/data/tpa-cities.ts` — Source data for calculations

  **External References**:
  - TPA formula: Population × 0.7 kg/person/day × (1 - recyclingRate) / compactionDensity
  - Population growth rate: ~1.2% per year for Indonesian metros

  **WHY Each Reference Matters**:
  - TPA seed data provides the exact parameters per city — all calculations derive from these values

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TPA forecast for Jakarta
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000/api/v1/sampah-pintar/tpa-forecast?city=jakarta
      2. Assert HTTP 200
      3. Assert `data.city.tpaName` is "Bantar Gebang"
      4. Assert `data.forecasts` array has 60 entries (default 5 years)
      5. Assert `data.exhaustionDate` is a valid ISO date string
      6. Assert `data.yearsRemaining` is a number > 0
      7. Assert forecasts are monotonically increasing (each month higher fill than previous)
    Expected Result: 60-month forecast with realistic exhaustion date
    Failure Indicators: Non-monotonic data, missing exhaustion date, wrong city
    Evidence: .sisyphus/evidence/task-9-tpa-forecast.txt

  Scenario: Custom month range
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000/api/v1/sampah-pintar/tpa-forecast?city=makassar&months=24
      2. Assert `data.forecasts` array has 24 entries
    Expected Result: 24-month forecast for Makassar
    Failure Indicators: Wrong number of forecast entries
    Evidence: .sisyphus/evidence/task-9-tpa-custom.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/tpa-forecast/route.ts`
  - Pre-commit: `npm run build`

- [ ] 10. API Route — /policy-recommend (OpenAI Integration)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/policy-recommend/route.ts`
  - Handle POST with JSON body: `{ cityId: string, language: 'id' | 'en' }`
  - Load city's TPA data + composition data as context for the LLM
  - Call OpenAI GPT-4o-mini via `fetch` to `https://api.openai.com/v1/chat/completions` (no SDK needed)
  - Use OPENAI_API_KEY from `process.env` — never expose to client
  - System prompt instructs the model to return structured JSON matching `PolicyRecommendation` interface
  - Include: summary (2-3 paragraphs), per-category targets (current rate, target rate, specific action), disclaimer
  - Set `response_format: { type: 'json_object' }` for reliable JSON output
  - Language: respond in the requested language (id = Bahasa Indonesia, en = English)
  - Add rate limiter: max 5 requests/min per IP (OpenAI is expensive)
  - Handle errors: missing API key (500 with generic message), OpenAI timeout (504), rate limit (429), invalid city (400)
  - If OPENAI_API_KEY is not set, return a pre-written fallback recommendation (hardcoded) — allows development without key
  - Add AI-generated content disclaimer to every response

  **Must NOT do**:
  - Do NOT expose the API key in any response or error message
  - Do NOT use OpenAI SDK — use native fetch for minimal dependency
  - Do NOT allow arbitrary prompts from client — fixed system prompt only
  - Do NOT stream responses — return complete JSON

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: External API integration with security considerations, error handling, fallback logic, prompt engineering
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 11, 12)
  - **Blocks**: Task 16
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:PolicyRecommendation` — Response shape the LLM must produce
  - `src/lib/sampah-pintar/data/tpa-cities.ts` — City data for LLM context
  - `src/lib/sampah-pintar/data/kelurahan.ts` — Composition data for LLM context

  **External References**:
  - OpenAI Chat Completions API: https://platform.openai.com/docs/api-reference/chat/create
  - JSON mode: `response_format: { type: 'json_object' }`
  - Model: `gpt-4o-mini`

  **WHY Each Reference Matters**:
  - PolicyRecommendation type defines the EXACT JSON schema the LLM must output — system prompt must enforce this
  - TPA/kelurahan data provides the context the LLM needs to generate relevant, city-specific recommendations

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Policy recommendation with fallback (no API key)
    Tool: Bash (curl)
    Preconditions: Dev server running WITHOUT OPENAI_API_KEY set
    Steps:
      1. curl -s -X POST http://localhost:3000/api/v1/sampah-pintar/policy-recommend -H "Content-Type: application/json" -d '{"cityId": "jakarta", "language": "id"}'
      2. Assert HTTP 200
      3. Assert `data.cityId` is "jakarta"
      4. Assert `data.language` is "id"
      5. Assert `data.targets` is an array with entries
      6. Assert `data.disclaimer` is non-empty
    Expected Result: Fallback recommendation in Bahasa Indonesia with disclaimer
    Failure Indicators: 500 error, missing fields, English when Indonesian requested
    Evidence: .sisyphus/evidence/task-10-policy-fallback.txt

  Scenario: Invalid city rejected
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "%{http_code}" -X POST http://localhost:3000/api/v1/sampah-pintar/policy-recommend -H "Content-Type: application/json" -d '{"cityId": "nonexistent", "language": "en"}'
      2. Assert HTTP 400
    Expected Result: 400 Bad Request
    Failure Indicators: 200 or 500
    Evidence: .sisyphus/evidence/task-10-policy-invalid.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/policy-recommend/route.ts`
  - Pre-commit: `npm run build`

- [ ] 11. API Route — /recycling-facilities (OSM Proxy + Cache)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/recycling-facilities/route.ts`
  - Handle GET with query params: `city` (required), `material` (optional WasteCategory filter)
  - For MVP: return seed data from recycling-facilities.ts (NOT live Overpass API)
  - Filter by city, then optionally by material (check if `acceptedMaterials` includes the requested material)
  - Return `ApiResponse<{ type: 'FeatureCollection', features: GeoJSON.Feature[] }>` — GeoJSON format for MapLibre
  - Convert `RecyclingFacility[]` to GeoJSON FeatureCollection with Point geometries
  - Include facility metadata as GeoJSON properties: name, type, acceptedMaterials, phone, operatingHours
  - Validate city and material parameters
  - Add simple in-memory cache (Map with city+material key, 5 min TTL) for future Overpass integration

  **Must NOT do**:
  - Do NOT call Overpass API for MVP — seed data only
  - Do NOT return raw facility objects — must be GeoJSON
  - Do NOT include routing/directions

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: GeoJSON transformation + caching infrastructure — moderate complexity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 12)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 1, 3 (needs types + recycling seed data)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:RecyclingFacility` — Source data type
  - `src/lib/sampah-pintar/data/recycling-facilities.ts` — Seed data source

  **External References**:
  - GeoJSON spec: FeatureCollection with Point geometry — https://geojson.org/

  **WHY Each Reference Matters**:
  - MapLibre requires GeoJSON FeatureCollection format — the transformation must be exact or the map won't render pins

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Get recycling facilities for Jakarta
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000/api/v1/sampah-pintar/recycling-facilities?city=jakarta
      2. Assert HTTP 200
      3. Assert `data.type` is "FeatureCollection"
      4. Assert `data.features` is an array with 8-12 items
      5. Assert each feature has `geometry.type` = "Point" and `geometry.coordinates` array of [lng, lat]
      6. Assert coordinates are within Jakarta bbox (-6.3 to -6.1, 106.7 to 106.95)
    Expected Result: GeoJSON FeatureCollection with Jakarta recycling facilities
    Failure Indicators: Non-GeoJSON format, coordinates outside Jakarta
    Evidence: .sisyphus/evidence/task-11-recycling-geojson.txt

  Scenario: Filter by material
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s http://localhost:3000/api/v1/sampah-pintar/recycling-facilities?city=jakarta&material=plastik
      2. Assert HTTP 200
      3. Assert all features have "plastik" in properties.acceptedMaterials array
      4. Assert fewer results than unfiltered query
    Expected Result: Filtered GeoJSON with only plastic-accepting facilities
    Failure Indicators: Facilities without plastik in acceptedMaterials
    Evidence: .sisyphus/evidence/task-11-recycling-filter.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/recycling-facilities/route.ts`
  - Pre-commit: `npm run build`

- [ ] 12. API Route — /manual-entry (Composition Form Submit)

  **What to do**:
  - Create `src/app/api/v1/sampah-pintar/manual-entry/route.ts`
  - Handle POST with JSON body matching `ManualEntryPayload`: kelurahan, kecamatan, city, composition (Record<WasteCategory, number>), optional notes
  - Validate: all 7 waste categories present in composition, percentages sum to ~100% (±2% tolerance), city/kelurahan from canonical list
  - Store in same in-memory array as classification results (shared store module)
  - Create `src/lib/sampah-pintar/store.ts` — shared in-memory store for both classify and manual-entry results
  - Return `ApiResponse<{ id: string; timestamp: string }>` with the created entry ID
  - Rate limit: 20 requests/min per IP

  **Must NOT do**:
  - Do NOT persist to database — in-memory only
  - Do NOT accept composition that doesn't sum to ~100%

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple POST handler with validation — straightforward
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 7, 8, 9, 10, 11)
  - **Blocks**: Task 13
  - **Blocked By**: Task 1 (needs types)

  **References**:

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:ManualEntryPayload` — Request body shape
  - `src/lib/sampah-pintar/data/kelurahan.ts` — Canonical location validation

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Valid manual entry accepted
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "%{http_code}" -X POST http://localhost:3000/api/v1/sampah-pintar/manual-entry -H "Content-Type: application/json" -d '{"kelurahan":"Cakung Barat","kecamatan":"Cakung","city":"jakarta","composition":{"organik":60,"plastik":15,"kertas":10,"logam":3,"kaca":2,"b3":2,"residu":8}}'
      2. Assert HTTP 200 (or 201)
      3. Assert `data.id` is a non-empty string
      4. Assert `data.timestamp` is a valid ISO date
    Expected Result: Entry created successfully with ID
    Failure Indicators: 400/500 error on valid input
    Evidence: .sisyphus/evidence/task-12-manual-entry.txt

  Scenario: Invalid composition rejected
    Tool: Bash (curl)
    Preconditions: Dev server running
    Steps:
      1. curl -s -w "%{http_code}" -X POST http://localhost:3000/api/v1/sampah-pintar/manual-entry -H "Content-Type: application/json" -d '{"kelurahan":"Cakung Barat","kecamatan":"Cakung","city":"jakarta","composition":{"organik":90,"plastik":90}}'
      2. Assert HTTP 400 (percentages exceed 100, missing categories)
    Expected Result: 400 with validation error
    Failure Indicators: 200 accepting invalid data
    Evidence: .sisyphus/evidence/task-12-manual-invalid.txt
  ```

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry`
  - Files: `src/app/api/v1/sampah-pintar/manual-entry/route.ts`, `src/lib/sampah-pintar/store.ts`
  - Pre-commit: `npm run build`

- [ ] 13. Page — /sampah-pintar (Landing + Photo Upload)

  **What to do**:
  - Create `src/app/sampah-pintar/page.tsx` as `'use client'` component
  - Main landing page for SampahPintar with two primary sections:
    1. **Photo Upload Section**: Drag-and-drop zone (or click-to-browse) for waste photos
       - Accept jpeg, png, webp only; max 5MB
       - Show preview thumbnail after selection
       - City → Kecamatan → Kelurahan cascading dropdowns (populated from canonical kelurahan data)
       - "Klasifikasi" submit button calls `POST /api/v1/sampah-pintar/classify` with FormData
       - Loading spinner during classification with i18n `t('sampahPintar.classifying')` text
       - Display classification result as horizontal bar chart (inline, no Chart.js needed — use Tailwind width percentages)
       - Show category labels with `WASTE_CATEGORY_COLORS` color coding
       - Error state with retry button on API failure
    2. **Manual Entry Section**: Expandable/collapsible form
       - Same City → Kecamatan → Kelurahan dropdowns
       - 7 number inputs (one per waste category) with labels from i18n
       - Real-time sum indicator showing total % (must equal 100±2)
       - Optional notes textarea
       - Submit calls `POST /api/v1/sampah-pintar/manual-entry`
       - Success toast/message showing entry ID
    3. **Recent Results List**: Show last 5 classifications/entries from current session
       - Fetch from in-memory store (display on page load, update after new submission)
       - Each result shows: timestamp, city/kelurahan, top 3 categories with percentages
  - Use `useI18n()` for all visible text
  - Responsive: single column on mobile, two-column (upload left, manual right) on desktop ≥ 1024px
  - Match AirBersih dark theme (dark bg, light text, subtle borders)

  **Must NOT do**:
  - Do NOT persist photos — discard after classification
  - Do NOT use a separate library for drag-and-drop — native HTML5 drag events + `<input type="file">`
  - Do NOT allow submission without selecting city/kecamatan/kelurahan
  - Do NOT use Chart.js on this page — simple Tailwind bars for classification results

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex interactive form UI with drag-and-drop, cascading selects, real-time validation, responsive layout
  - **Skills**: [`playwright`]
    - `playwright`: Needed for QA scenarios verifying upload flow and form interactions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 14, 15, 16, 17)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 5 (layout), 6 (i18n), 7 (classify API), 12 (manual-entry API)

  **References**:

  **Pattern References**:
  - `src/app/map/page.tsx:1-10` — `'use client'` page component pattern with `useI18n()` hook usage
  - `src/app/sampah-pintar/layout.tsx` — The layout this page renders within (created in Task 5)

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:ClassificationResult` — Shape returned by classify API, used to render results
  - `src/lib/sampah-pintar/types.ts:ManualEntryPayload` — Shape for manual entry form submission
  - `src/lib/sampah-pintar/types.ts:WasteCategory` — Enum for rendering category inputs and labels
  - `src/lib/sampah-pintar/mock-classifier.ts:WASTE_CATEGORY_COLORS` — Color map for category bars
  - `src/lib/sampah-pintar/data/kelurahan.ts` — Canonical kelurahan list for cascading dropdowns

  **External References**:
  - HTML5 Drag and Drop API for file upload: `ondrop`, `ondragover`, `ondragenter` events

  **WHY Each Reference Matters**:
  - `map/page.tsx`: Shows the exact `'use client'` + `useI18n()` + `useState` page pattern this project uses
  - `kelurahan.ts`: The cascading dropdown options — city selection filters kecamatan, kecamatan filters kelurahan
  - `WASTE_CATEGORY_COLORS`: Visual consistency across all modules — same color for organik everywhere

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Photo upload and classification flow
    Tool: Playwright
    Preconditions: Dev server running at localhost:3000, classify API working (Task 7)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar
      2. Assert page title contains i18n text for upload
      3. Select city from dropdown — assert kecamatan dropdown populates
      4. Select kecamatan — assert kelurahan dropdown populates
      5. Select kelurahan
      6. Upload a small test image file via input[type="file"]
      7. Click classify/submit button
      8. Wait for loading state to appear (spinner or "Mengklasifikasi..." text)
      9. Wait for result to appear (timeout: 10s)
      10. Assert 7 waste categories displayed with colored bars
      11. Assert percentages are visible numbers summing to 100
      12. Screenshot the result
    Expected Result: Classification result with 7 colored bars, percentages visible
    Failure Indicators: No result after 10s, missing categories, bars not colored
    Evidence: .sisyphus/evidence/task-13-upload-classify.png

  Scenario: Manual entry form validation
    Tool: Playwright
    Preconditions: Dev server running, manual-entry API working (Task 12)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar
      2. Open/expand the manual entry section
      3. Try to submit without selecting city — assert submit is disabled or shows error
      4. Fill city/kecamatan/kelurahan
      5. Enter composition: organik=60, plastik=15, kertas=10, logam=3, kaca=2, b3=2, residu=8
      6. Assert sum indicator shows 100%
      7. Click submit
      8. Assert success message appears with entry ID
      9. Screenshot
    Expected Result: Successful submission with confirmation message
    Failure Indicators: Submit allowed without location, sum not validated, no success feedback
    Evidence: .sisyphus/evidence/task-13-manual-entry.png

  Scenario: Error handling on upload failure
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar
      2. Select location dropdowns
      3. Upload a .txt file (invalid type)
      4. Click classify
      5. Assert error message appears (not a crash or blank screen)
      6. Assert retry button or option to try again is visible
    Expected Result: User-friendly error message for invalid file
    Failure Indicators: White screen, unhandled error, no feedback
    Evidence: .sisyphus/evidence/task-13-upload-error.png
  ```

  **Evidence to Capture:**
  - [ ] task-13-upload-classify.png — Classification result after photo upload
  - [ ] task-13-manual-entry.png — Successful manual entry submission
  - [ ] task-13-upload-error.png — Error state for invalid file upload

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages`
  - Files: `src/app/sampah-pintar/page.tsx`
  - Pre-commit: `npm run build`

- [ ] 14. Page — /sampah-pintar/dashboard (Composition Dashboard)

  **What to do**:
  - Create `src/app/sampah-pintar/dashboard/page.tsx` as `'use client'` component
  - Interactive waste composition dashboard with Chart.js visualizations:
    1. **City Selector**: Dropdown with 5 cities — on change, fetches composition data via `GET /api/v1/sampah-pintar/composition?city={selected}`
    2. **Summary Cards Row**: Total samples, dominant waste type, avg recycling potential — calculated from API response
    3. **Doughnut Chart**: Overall city composition (7 categories) — uses `WASTE_CATEGORY_COLORS` for consistency
    4. **Bar Chart**: Per-kelurahan breakdown — stacked or grouped bar chart showing composition by kelurahan
    5. **Data Table**: Below charts, show raw data: kelurahan | sample count | organik % | plastik % | kertas % | ... | residu %
  - Import Chart.js components via dynamic import with `{ ssr: false }`:
    ```tsx
    const DoughnutChart = dynamic(() => import('../components/DoughnutChart'), { ssr: false })
    ```
  - Create chart wrapper components in `src/app/sampah-pintar/components/`:
    - `DoughnutChart.tsx` — wraps Chart.js Doughnut (register Chart.js elements, import css)
    - `BarChart.tsx` — wraps Chart.js Bar for per-kelurahan breakdown
  - Loading skeleton while fetching data (animated pulse placeholders for chart areas)
  - Empty state when no data for selected city
  - Use `useI18n()` for all labels, tooltips, and headings
  - Responsive: charts stack vertically on mobile, side-by-side on desktop

  **Must NOT do**:
  - Do NOT import Chart.js at the top level — MUST use dynamic import with ssr: false
  - Do NOT create a global Chart.js registration file — register inside each chart component
  - Do NOT fetch composition for all cities at once — single city per request

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Chart.js integration, responsive dashboard layout, data visualization
  - **Skills**: [`playwright`]
    - `playwright`: Needed for verifying chart rendering and interactive city switching

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 15, 16, 17)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 5 (layout), 6 (i18n), 7 (classify API for data), 8 (composition API)

  **References**:

  **Pattern References**:
  - `src/app/map/page.tsx:1-10` — `'use client'` + `useI18n()` pattern
  - `src/app/map/page.tsx:70-80` — useRef + useEffect pattern for library initialization (similar to Chart.js setup)

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:CompositionAggregate` — API response shape for chart data
  - `src/lib/sampah-pintar/types.ts:WasteCategory` — Category keys for chart labels
  - `src/lib/sampah-pintar/mock-classifier.ts:WASTE_CATEGORY_COLORS` — Chart color palette
  - `src/lib/sampah-pintar/mock-classifier.ts:getWasteCategoryLabel` — Localized category labels for chart legends

  **External References**:
  - Chart.js + react-chartjs-2: Doughnut and Bar chart types — https://react-chartjs-2.js.org/
  - Chart.js `register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)` for tree-shaking
  - Next.js dynamic import: `import dynamic from 'next/dynamic'` with `{ ssr: false }`

  **WHY Each Reference Matters**:
  - `map/page.tsx` ref/effect pattern: Chart.js needs similar lifecycle management — create on mount, destroy on unmount
  - `WASTE_CATEGORY_COLORS`: Charts must use identical colors as the landing page bars for visual consistency
  - Dynamic import is mandatory: Chart.js accesses `window`/`document` — SSR crashes without it

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Dashboard renders charts for Jakarta
    Tool: Playwright
    Preconditions: Dev server running, composition API working (Task 8)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/dashboard
      2. Assert page loads without console errors
      3. Select "Jakarta" from city dropdown
      4. Wait for charts to render (timeout: 10s)
      5. Assert canvas element exists (Chart.js renders to canvas)
      6. Assert doughnut chart area is visible (check for `canvas` within chart container)
      7. Assert data table has 5-8 rows (one per kelurahan)
      8. Assert table headers include waste category names
      9. Screenshot full dashboard
    Expected Result: Doughnut + bar charts rendered with Jakarta data, data table visible
    Failure Indicators: No canvas elements, empty charts, SSR error in console
    Evidence: .sisyphus/evidence/task-14-dashboard-jakarta.png

  Scenario: City switching updates charts
    Tool: Playwright
    Preconditions: Dev server running, dashboard loaded with Jakarta
    Steps:
      1. On the dashboard page, switch city to "Surabaya"
      2. Wait for loading state, then charts to re-render (timeout: 10s)
      3. Assert data table now shows Surabaya kelurahan names (different from Jakarta)
      4. Screenshot
    Expected Result: Charts and table update to reflect Surabaya data
    Failure Indicators: Data still shows Jakarta, loading state never resolves
    Evidence: .sisyphus/evidence/task-14-dashboard-switch.png

  Scenario: Empty state when no data
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to dashboard before selecting any city (or if default city has no custom entries)
      2. Assert loading skeleton appears briefly, then data (from seed) renders
      3. Verify no blank/broken chart states
    Expected Result: Seed data renders correctly, no broken empty state
    Failure Indicators: Blank chart areas, JS errors, infinite loading
    Evidence: .sisyphus/evidence/task-14-dashboard-seed.png
  ```

  **Evidence to Capture:**
  - [ ] task-14-dashboard-jakarta.png — Full dashboard with Jakarta data
  - [ ] task-14-dashboard-switch.png — Dashboard after switching to Surabaya
  - [ ] task-14-dashboard-seed.png — Dashboard with seed data (no custom entries)

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages`
  - Files: `src/app/sampah-pintar/dashboard/page.tsx`, `src/app/sampah-pintar/components/DoughnutChart.tsx`, `src/app/sampah-pintar/components/BarChart.tsx`
  - Pre-commit: `npm run build`


- [ ] 15. Page — /sampah-pintar/tpa (TPA Capacity Predictor)

  **What to do**:
  - Create `src/app/sampah-pintar/components/LineChart.tsx` as a `'use client'` Chart.js wrapper:
    - Accept `labels: string[]`, `datasets: { label: string; data: number[]; borderColor: string; backgroundColor: string }[]`, `title?: string`
    - Import `Line` from `react-chartjs-2` and register required Chart.js modules (`CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `Title`, `Tooltip`, `Legend`, `Filler`)
    - Apply dark theme defaults: white grid lines at 0.1 opacity, white tick labels, white legend text
    - Responsive + `maintainAspectRatio: false` with a container `h-[400px]`
    - Export as default
  - Create `src/app/sampah-pintar/tpa/page.tsx` as `'use client'` component:
    - **City Selector**: Horizontal button group (pill-style) with all 5 TPA cities — Jakarta (Bantar Gebang), Surabaya (Benowo), Bandung (Sarimukti), Semarang (Jatibarang), Makassar (Tamangapa)
    - Default selection: Jakarta
    - On city change, call `GET /api/v1/sampah-pintar/tpa-forecast?city={cityId}` via fetch
    - Show loading skeleton (pulsing gray rectangles matching card + chart layout) while fetching
    - **Key Metric Cards** (4-column grid on desktop, 2×2 on tablet, stacked on mobile):
      1. Current Fill % — large number with progress ring or arc indicator, color: green (<60%), yellow (60-80%), red (>80%)
      2. Exhaustion Date — formatted as "Maret 2029" (Indonesian month name), with days-from-now below
      3. Years Remaining — number with 1 decimal, color-coded same as fill %
      4. Daily Waste Volume — formatted as "X ton/hari" (tons per day)
    - **Capacity Timeline Chart**: `LineChart` component with:
      - X-axis: years from current year to exhaustion year + 2
      - Y-axis: capacity in tons (0 to totalCapacity)
      - Line 1: Cumulative waste fill (solid, red-ish)
      - Line 2: Total capacity threshold (dashed horizontal, white/gray)
      - Fill area under cumulative line with semi-transparent gradient
      - Tooltip showing exact values on hover
    - **TPA Info Panel** below chart: Name, location, total capacity, commissioning year, technology (from seed data)
    - Use `useI18n()` for all labels: `t('sampahPintar.tpa.title')`, `t('sampahPintar.tpa.fillPercent')`, `t('sampahPintar.tpa.exhaustionDate')`, `t('sampahPintar.tpa.yearsRemaining')`, `t('sampahPintar.tpa.dailyWaste')`, etc.
    - Dynamic import `LineChart` with `{ ssr: false }` via `next/dynamic` to avoid Chart.js SSR issues
    - Responsive layout matching AirBersih dark theme

  **Must NOT do**:
  - Do NOT use `react-chartjs-2` directly in the page — wrap in `LineChart.tsx` component
  - Do NOT hardcode city data in the page — all data comes from the TPA forecast API response
  - Do NOT import Chart.js modules in the page file — only in `LineChart.tsx`
  - Do NOT use client-side date math for forecasting — the API returns computed values

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Chart.js integration, responsive card grid, color-coded indicators, loading skeletons — all visual-heavy frontend work
  - **Skills**: [`playwright`]
    - `playwright`: Needed for QA scenarios testing chart rendering, city switching, and metric display
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Task has concrete spec, no design decision-making needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 16, 17)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 5 (layout), 6 (i18n), 9 (tpa-forecast API), 2 (TPA seed data)

  **References**:

  **Pattern References**:
  - `src/app/sampah-pintar/components/DoughnutChart.tsx` (Task 14) — Sister Chart.js wrapper pattern; same registration approach, dark theme config, dynamic import strategy
  - `src/app/map/page.tsx:1-10` — `'use client'` page with `useI18n()` and `useState` for selection state
  - `src/app/sampah-pintar/dashboard/page.tsx` (Task 14) — Metric card grid layout pattern, loading skeleton pattern, city selector pattern to reuse

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:TPAForecast` — Shape returned by TPA forecast API; contains `fillPercent`, `exhaustionDate`, `yearsRemaining`, `dailyWasteTons`, `timelineSeries`
  - `src/lib/sampah-pintar/types.ts:TPACity` — City metadata including name, tpaName, location, totalCapacity
  - `src/lib/sampah-pintar/data/tpa-cities.ts:TPA_CITIES` — Array of 5 city objects with TPA metadata (used by API, referenced here for city selector labels)

  **External References**:
  - react-chartjs-2 Line component: `import { Line } from 'react-chartjs-2'` — https://react-chartjs-2.js.org/components/line
  - Chart.js Filler plugin for area fill: `import { Filler } from 'chart.js'` — needed for `fill: true` option on datasets
  - next/dynamic for SSR-disabled import: `const LineChart = dynamic(() => import('../components/LineChart'), { ssr: false })`

  **WHY Each Reference Matters**:
  - `DoughnutChart.tsx`: Establishes the Chart.js wrapper pattern — `LineChart.tsx` should mirror its registration, theming, and export approach exactly for consistency
  - `dashboard/page.tsx`: The metric card grid and city selector are the same UI pattern — reuse the same Tailwind classes and responsive breakpoints
  - `TPAForecast` type: The page renders EXACTLY what the API returns — no client-side computation; ensures type-safe destructuring
  - `TPA_CITIES`: City names + TPA names needed for the selector button labels ("Jakarta — Bantar Gebang")

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: TPA page loads with Jakarta forecast
    Tool: Playwright
    Preconditions: Dev server running, tpa-forecast API working (Task 9)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/tpa
      2. Assert page title contains TPA/Prediksi text (i18n)
      3. Assert Jakarta is selected by default (active button state)
      4. Wait for loading skeleton to disappear (timeout: 5s)
      5. Assert 4 metric cards are visible:
         - Card with fill percentage (number followed by "%")
         - Card with exhaustion date (contains month name + year)
         - Card with years remaining (number with decimal)
         - Card with daily waste (contains "ton")
      6. Assert Line chart canvas is rendered (selector: canvas or .chartjs-render-monitor)
      7. Assert chart has visible data (canvas is not blank — check element height > 0)
      8. Screenshot full page
    Expected Result: Jakarta TPA data displayed with 4 metric cards and timeline chart
    Failure Indicators: Missing metrics, blank chart area, loading state stuck, 0% fill
    Evidence: .sisyphus/evidence/task-15-tpa-jakarta.png

  Scenario: Switch city to Bandung
    Tool: Playwright
    Preconditions: TPA page loaded with Jakarta data
    Steps:
      1. Click the "Bandung" city selector button
      2. Assert Bandung button becomes active (has active/selected styling)
      3. Assert loading skeleton appears briefly
      4. Wait for new data to render (timeout: 5s)
      5. Assert metric cards show different values from Jakarta (particularly TPA name should mention "Sarimukti")
      6. Assert chart data updates (canvas re-renders)
      7. Screenshot
    Expected Result: All metrics and chart update to show Bandung/Sarimukti TPA data
    Failure Indicators: Data unchanged from Jakarta, loading never resolves, chart blank
    Evidence: .sisyphus/evidence/task-15-tpa-bandung.png

  Scenario: API error handling
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/tpa
      2. Use page.route() to intercept /api/v1/sampah-pintar/tpa-forecast and return 500
      3. Click a city selector button to trigger fetch
      4. Assert error state is shown (error message visible, not just blank)
      5. Assert no JS console errors of type 'unhandled' (page.on('pageerror'))
      6. Screenshot error state
    Expected Result: Graceful error message displayed, no crash, user can retry
    Failure Indicators: Blank page, uncaught exception, infinite loading
    Evidence: .sisyphus/evidence/task-15-tpa-error.png
  ```

  **Evidence to Capture:**
  - [ ] task-15-tpa-jakarta.png — Full TPA page with Jakarta selected, metrics + chart visible
  - [ ] task-15-tpa-bandung.png — TPA page after switching to Bandung
  - [ ] task-15-tpa-error.png — Error state when API fails

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages`
  - Files: `src/app/sampah-pintar/tpa/page.tsx`, `src/app/sampah-pintar/components/LineChart.tsx`
  - Pre-commit: `npm run build`


- [ ] 16. Page — /sampah-pintar/kebijakan (Policy Recommendations)

  **What to do**:
  - Create `src/app/sampah-pintar/kebijakan/page.tsx` as `'use client'` component
  - **City Selector**: Same horizontal pill-button group as TPA page (5 cities), default Jakarta
  - **Language Toggle**: Two-button toggle (Bahasa Indonesia / English) that sets `language` param for the API request
    - Default to current i18n locale from `useI18n()` context
  - **Generate Button**: Large primary button "Buat Rekomendasi" / "Generate Recommendations"
    - Disabled until city is selected (always is, since default = Jakarta)
    - Shows loading spinner + "Menghasilkan rekomendasi..." text during API call (can take 3-10s for OpenAI)
  - On click, call `POST /api/v1/sampah-pintar/policy-recommend` with body `{ cityId, language }`
  - **Loading State**: Full-height skeleton with pulsing blocks matching the result layout (summary block + 7 target bars)
    - Minimum display time 500ms to prevent flash
  - **Result Display** (after API returns):
    1. **Summary Section**: 2-3 paragraphs of policy recommendation text (from `summary` field)
       - Rendered as formatted text with proper paragraph spacing
       - Card-style container with subtle border
    2. **Category Targets**: 7 rows (one per waste category), each showing:
       - Category name with color dot (using `WASTE_CATEGORY_COLORS`)
       - Current rate (%) → Target rate (%) with arrow
       - Progress bar showing current vs target (dual-colored: current in gray, target gap in category color)
       - Action text below the bar (e.g., "Tingkatkan pengomposan komunal")
    3. **Disclaimer Footer**: Italic text from `disclaimer` field, clearly marked as AI-generated
    4. **Generated At**: Timestamp showing when recommendation was created
  - **Error State**: If API fails (500, timeout, rate limit), show:
    - Error icon + message ("Gagal menghasilkan rekomendasi" / "Failed to generate recommendations")
    - Specific message for rate limiting (429): "Terlalu banyak permintaan. Coba lagi dalam 1 menit."
    - Retry button that re-triggers the same request
  - **Fallback State**: If `OPENAI_API_KEY` is not set, API returns hardcoded fallback — display normally with additional note: "Mode demo — rekomendasi statis"
  - Use `useI18n()` for all UI chrome text (labels, buttons, headers)
  - Responsive: full-width cards stacked vertically, progress bars scale to container width
  - Match AirBersih dark theme

  **Must NOT do**:
  - Do NOT call OpenAI from client side — only through server API route
  - Do NOT cache recommendations client-side between city switches — always fresh request
  - Do NOT auto-generate on page load — require explicit button click
  - Do NOT show raw JSON — always render structured display

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Complex result display with progress bars, loading states, error states, responsive layout
  - **Skills**: [`playwright`]
    - `playwright`: Needed for QA scenarios testing generation flow, loading states, and error handling
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Spec is concrete enough, no design exploration needed

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 17)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 5 (layout), 6 (i18n), 10 (policy-recommend API)

  **References**:

  **Pattern References**:
  - `src/app/sampah-pintar/tpa/page.tsx` (Task 15) — City selector pill-button pattern, loading skeleton pattern, error state pattern — reuse same Tailwind classes
  - `src/app/sampah-pintar/dashboard/page.tsx` (Task 14) — Card layout pattern for metric display areas
  - `src/app/map/page.tsx:1-10` — `'use client'` page with `useI18n()` and `useState` for selection state

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:PolicyRecommendation` — Shape returned by policy API; contains `summary`, `targets[]` (with `category`, `currentRate`, `targetRate`, `action`), `disclaimer`, `generatedAt`
  - `src/lib/sampah-pintar/types.ts:WasteCategory` — Enum for rendering category names and colors in target rows
  - `src/lib/sampah-pintar/mock-classifier.ts:WASTE_CATEGORY_COLORS` — Color map for progress bars and category dots
  - `src/lib/sampah-pintar/mock-classifier.ts:getWasteCategoryLabel` — Localized category names for display

  **External References**:
  - None — this page uses no external libraries beyond standard React + Tailwind

  **WHY Each Reference Matters**:
  - `tpa/page.tsx`: City selector + loading skeleton are identical UI patterns — copy, don't reinvent
  - `PolicyRecommendation` type: The page renders EXACTLY this shape — each field maps to a UI section (summary → paragraph block, targets → progress bar rows, disclaimer → footer)
  - `WASTE_CATEGORY_COLORS`: Same colors used everywhere for each waste type — visual consistency across modules
  - `getWasteCategoryLabel`: Renders "Plastik" or "Plastic" depending on locale, not raw enum values

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Generate policy recommendation for Jakarta in Indonesian
    Tool: Playwright
    Preconditions: Dev server running, policy-recommend API working (Task 10)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/kebijakan
      2. Assert page title contains "Kebijakan" or "Rekomendasi" text
      3. Assert Jakarta is selected by default
      4. Assert language toggle shows "Bahasa Indonesia" as active
      5. Click the "Buat Rekomendasi" / generate button
      6. Assert loading state appears (spinner visible, skeleton blocks shown)
      7. Wait for result to render (timeout: 15s — OpenAI can be slow)
      8. Assert summary text is present (at least 50 characters of text)
      9. Assert 7 category target rows are visible
      10. For each target row: assert category name, current %, target %, and action text exist
      11. Assert progress bars are rendered (elements with width > 0)
      12. Assert disclaimer text is present at bottom (italic or smaller text)
      13. Assert generated timestamp is visible
      14. Screenshot full result
    Expected Result: Structured policy recommendation with summary, 7 targets with progress bars, disclaimer
    Failure Indicators: No result after 15s, fewer than 7 targets, missing summary, no disclaimer
    Evidence: .sisyphus/evidence/task-16-policy-jakarta-id.png

  Scenario: Switch language to English and regenerate
    Tool: Playwright
    Preconditions: Previous scenario completed (Jakarta recommendation visible)
    Steps:
      1. Click the English language toggle button
      2. Assert English toggle becomes active
      3. Click generate button again
      4. Wait for new result (timeout: 15s)
      5. Assert summary text is in English (contains common English words like "waste", "reduction", "recommend")
      6. Assert category action texts are in English
      7. Screenshot
    Expected Result: Same structure but all recommendation text in English
    Failure Indicators: Text still in Indonesian, mixed languages, error on regenerate
    Evidence: .sisyphus/evidence/task-16-policy-jakarta-en.png

  Scenario: Error state on API failure
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/kebijakan
      2. Use page.route() to intercept POST /api/v1/sampah-pintar/policy-recommend and return 429 with body { error: 'Rate limited' }
      3. Click generate button
      4. Wait for error state (timeout: 5s)
      5. Assert error message is visible (contains "terlalu banyak" or "rate" text)
      6. Assert retry button is present
      7. Screenshot error state
    Expected Result: Friendly error message with rate limit info and retry button
    Failure Indicators: Blank page, generic error, no retry option, uncaught exception
    Evidence: .sisyphus/evidence/task-16-policy-error.png
  ```

  **Evidence to Capture:**
  - [ ] task-16-policy-jakarta-id.png — Full policy page with Jakarta recommendation in Indonesian
  - [ ] task-16-policy-jakarta-en.png — Same recommendation regenerated in English
  - [ ] task-16-policy-error.png — Error state when API returns 429

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages`
  - Files: `src/app/sampah-pintar/kebijakan/page.tsx`
  - Pre-commit: `npm run build`


- [ ] 17. Page — /sampah-pintar/daur-ulang (Recycling Facility Map)

  **What to do**:
  - Create `src/app/sampah-pintar/daur-ulang/page.tsx` as `'use client'` component
  - **Layout**: Two-panel split — sidebar (left, 320px on desktop) + map (right, fills remaining space)
    - On mobile (<768px): sidebar collapses to a bottom sheet / expandable drawer overlay on the map
  - **City Selector** (in sidebar top): Dropdown select for 5 cities, default Jakarta
    - On city change: re-center map to city coordinates, re-fetch facilities
  - **Material Filter** (in sidebar): Checkboxes for 6 filterable materials (organik, plastik, kertas, logam, kaca, residu — NO b3)
    - Default: all checked
    - Each checkbox has category color dot from `WASTE_CATEGORY_COLORS`
    - On change: re-fetch `GET /api/v1/sampah-pintar/recycling-facilities?city={cityId}&material={checked materials joined by comma}`
    - Show count of visible facilities: "Menampilkan X fasilitas"
  - **MapLibre Map** (main area):
    - Use `next/dynamic` with `{ ssr: false }` for the map component (or inline dynamic import)
    - Initialize MapLibre GL JS with OSM raster tile layer (same as `src/app/map/page.tsx` pattern)
    - Center on selected city coordinates (use city center lat/lng from TPA seed data)
    - Default zoom: 12
    - Add GeoJSON source from API response — convert `RecyclingFacility[]` to GeoJSON FeatureCollection on the fly:
      ```
      { type: 'FeatureCollection', features: facilities.map(f => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [f.lng, f.lat] },
        properties: { id: f.id, name: f.name, type: f.type, materials: f.acceptedMaterials.join(', '), address: f.address, phone: f.phone }
      }))}
      ```
    - **Facility Markers**: Circle markers colored by facility type:
      - `bank_sampah` → green (#22c55e)
      - `tps3r` → blue (#3b82f6)
      - `recycling_center` → orange (#f59e0b)
    - **Click Popup**: On marker click, show MapLibre Popup with:
      - Facility name (bold)
      - Type badge (Bank Sampah / TPS3R / Recycling Center)
      - Address
      - Accepted materials as colored chips
      - Phone number (if available)
      - Operating hours (if available)
    - **Map Legend** (bottom-right overlay): Color legend showing marker types
  - **Loading State**: Show skeleton for sidebar + "Loading map..." overlay while initial data loads
  - **Error State**: If API fails, show error banner above map with retry button
  - **Empty State**: If no facilities match filter, show "Tidak ada fasilitas" message centered on map
  - Use `useI18n()` for all text: `t('sampahPintar.daurUlang.title')`, `t('sampahPintar.daurUlang.filterMaterials')`, etc.
  - Clean up map instance on unmount (return cleanup function in useEffect)
  - Match AirBersih dark theme for sidebar; MapLibre uses its own tile styling

  **Must NOT do**:
  - Do NOT use `react-map-gl` or `deck.gl` — use `maplibregl` directly (matching existing pattern)
  - Do NOT add routing/directions between user and facility — pins only
  - Do NOT load all cities' facilities at once — only the selected city
  - Do NOT use Mapbox tiles — use OSM raster tiles (free, no API key needed)
  - Do NOT forget map cleanup on unmount — memory leak risk

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: MapLibre integration, responsive split-panel layout, interactive filters, popups, color-coded markers — heavily visual + interactive
  - **Skills**: [`playwright`]
    - `playwright`: Needed for QA scenarios testing map rendering, filter interactions, and popup display
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: Spec is detailed enough, no design exploration needed
    - `dev-browser`: Playwright skill covers all browser verification needs

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 13, 14, 15, 16)
  - **Blocks**: Task 18
  - **Blocked By**: Tasks 5 (layout), 6 (i18n), 11 (recycling-facilities API), 3 (recycling seed data)

  **References**:

  **Pattern References**:
  - `src/app/map/page.tsx` — **PRIMARY REFERENCE**: AirBersih's existing MapLibre integration (449 lines). Shows: `'use client'`, `useRef` for map container, `useEffect` for map init, `maplibregl.Map` constructor, `maplibregl.Popup`, GeoJSON source/layer setup, marker styling, and cleanup pattern. **Copy this pattern closely.**
  - `src/app/sampah-pintar/tpa/page.tsx` (Task 15) — City selector pill-button pattern to reuse in sidebar
  - `src/app/sampah-pintar/components/DoughnutChart.tsx` (Task 14) — Dynamic import with `ssr: false` pattern

  **API/Type References**:
  - `src/lib/sampah-pintar/types.ts:RecyclingFacility` — Shape returned by API; contains `lat`, `lng`, `name`, `type`, `acceptedMaterials`, `address`, `phone`, `operatingHours`
  - `src/lib/sampah-pintar/types.ts:WasteCategory` — Enum for filter checkboxes and material chip rendering
  - `src/lib/sampah-pintar/mock-classifier.ts:WASTE_CATEGORY_COLORS` — Color map for material filter chips and checkbox dots
  - `src/lib/sampah-pintar/data/tpa-cities.ts:TPA_CITIES` — City center coordinates for map re-centering (lat/lng per city)

  **External References**:
  - MapLibre GL JS API: `new maplibregl.Map()`, `map.addSource()`, `map.addLayer()`, `new maplibregl.Popup()` — https://maplibre.org/maplibre-gl-js/docs/API/
  - GeoJSON spec for Point features: `{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {...} }` — Note: GeoJSON uses [longitude, latitude] order (NOT [lat, lng]!)
  - OSM raster tiles: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` or equivalent

  **WHY Each Reference Matters**:
  - `map/page.tsx`: This is THE reference — it shows exactly how this project integrates MapLibre. Wrong initialization = blank map. Wrong cleanup = memory leaks. Copy the proven pattern.
  - `RecyclingFacility` type: Each field maps directly to popup content and GeoJSON properties
  - `TPA_CITIES` coordinates: Used to re-center map when user switches city — without these, map stays on previous city
  - GeoJSON coordinate order: Common bug source — GeoJSON is [lng, lat] but most human-readable data is [lat, lng]

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Recycling map loads with Jakarta facilities
    Tool: Playwright
    Preconditions: Dev server running, recycling-facilities API working (Task 11)
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar/daur-ulang
      2. Assert page title contains "Daur Ulang" or "Recycling" text
      3. Assert Jakarta is selected in city dropdown
      4. Wait for map to initialize (canvas element present in DOM, timeout: 10s)
      5. Assert map canvas has non-zero dimensions (width > 0, height > 0)
      6. Assert sidebar shows facility count ("Menampilkan X fasilitas" where X > 0)
      7. Assert material filter checkboxes are present (6 checkboxes)
      8. Assert all checkboxes are checked by default
      9. Screenshot full page
    Expected Result: Map visible with markers, sidebar with filters showing Jakarta facilities
    Failure Indicators: Blank map canvas, zero facility count, missing filters, SSR error
    Evidence: .sisyphus/evidence/task-17-map-jakarta.png

  Scenario: Filter by specific material
    Tool: Playwright
    Preconditions: Map loaded with Jakarta facilities
    Steps:
      1. Uncheck all material checkboxes except "plastik"
      2. Wait for facility count to update (timeout: 3s)
      3. Assert facility count decreased (fewer facilities accept plastik only vs all materials)
      4. Assert count text shows updated number
      5. Screenshot filtered state
    Expected Result: Fewer facilities shown, count reflects plastik-only filter
    Failure Indicators: Count unchanged, all markers still visible, no API refetch
    Evidence: .sisyphus/evidence/task-17-map-filter-plastik.png

  Scenario: Switch city to Surabaya
    Tool: Playwright
    Preconditions: Map showing Jakarta
    Steps:
      1. Select "Surabaya" from city dropdown
      2. Wait for map to re-center (timeout: 5s)
      3. Assert facility count updates (different number than Jakarta)
      4. Assert map viewport has changed (center coordinates different from Jakarta)
      5. Screenshot
    Expected Result: Map shows Surabaya area with different facility set
    Failure Indicators: Map still centered on Jakarta, same facility count, loading stuck
    Evidence: .sisyphus/evidence/task-17-map-surabaya.png

  Scenario: Click facility marker shows popup
    Tool: Playwright
    Preconditions: Map loaded with facilities
    Steps:
      1. Click on a visible marker/point on the map (use map canvas click at approximate center)
      2. Wait for popup to appear (selector: `.maplibregl-popup` or `.maplibregl-popup-content`, timeout: 3s)
      3. Assert popup contains facility name (text content not empty)
      4. Assert popup contains type badge
      5. Assert popup contains address text
      6. Assert popup contains material chips (colored elements)
      7. Screenshot popup
    Expected Result: Popup with facility details (name, type, address, materials)
    Failure Indicators: No popup appears, popup empty, popup has wrong data
    Evidence: .sisyphus/evidence/task-17-map-popup.png
  ```

  **Evidence to Capture:**
  - [ ] task-17-map-jakarta.png — Full map page with Jakarta facilities and sidebar
  - [ ] task-17-map-filter-plastik.png — Map after filtering to plastik-only
  - [ ] task-17-map-surabaya.png — Map after switching to Surabaya
  - [ ] task-17-map-popup.png — Facility popup on marker click

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages`
  - Files: `src/app/sampah-pintar/daur-ulang/page.tsx`
  - Pre-commit: `npm run build`

- [ ] 18. End-to-End Integration Wiring + Build Verification

  **What to do**:
  - **Cross-Module Navigation Wiring**:
    - Add contextual navigation links between modules:
      - Landing page classification result → "Lihat Dashboard" button linking to `/sampah-pintar/dashboard?city={selectedCity}`
      - Dashboard page → "Lihat Prediksi TPA" link to `/sampah-pintar/tpa?city={selectedCity}`
      - TPA page → "Dapatkan Rekomendasi Kebijakan" link to `/sampah-pintar/kebijakan?city={selectedCity}`
      - Policy page → "Temukan Fasilitas Daur Ulang" link to `/sampah-pintar/daur-ulang?city={selectedCity}`
    - Each link should pass the current city as a query param so the target page can auto-select it
    - Target pages should read `searchParams.city` on mount and set their city selector accordingly
  - **In-Memory Store Integration**:
    - Verify `src/lib/sampah-pintar/store.ts` is being used by classify API (Task 7) and manual-entry API (Task 12)
    - Verify composition API (Task 8) reads from the store to aggregate data
    - Verify dashboard page shows data from the store (classifications + manual entries)
  - **i18n Completeness Check**:
    - Read through all 5 page files and verify every visible string uses `t('sampahPintar.xxx')` calls
    - Verify both `src/lib/i18n/id.json` and `src/lib/i18n/en.json` have matching key structures
    - Spot-check: switch language and verify at least 3 pages show translated text
  - **Build Verification**:
    - Run `npm run build` — must pass with zero errors
    - Fix any TypeScript errors, missing imports, or SSR issues
    - Verify no `console.log` statements in any SampahPintar source files
  - **Console Error Check**:
    - Start dev server and navigate to each of the 5 pages
    - Check browser console for errors/warnings on each page
    - Fix any runtime errors (undefined references, failed fetches, hydration mismatches)
  - **Responsive Spot Check**:
    - Verify landing page renders reasonably at 375px (mobile) and 1440px (desktop) widths
    - Verify map page sidebar collapses on mobile
    - No horizontal overflow on any page

  **Must NOT do**:
  - Do NOT add new features beyond what's specified in Tasks 1-17 — integration only
  - Do NOT refactor existing task implementations — fix bugs only
  - Do NOT change API response shapes — only fix client-side consumption
  - Do NOT add analytics, logging, or monitoring

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Cross-cutting integration task touching all modules, requires careful navigation across 20+ files, debugging skills, and build troubleshooting
  - **Skills**: [`playwright`]
    - `playwright`: Needed for QA scenarios testing cross-module navigation and console error checks
  - **Skills Evaluated but Omitted**:
    - `frontend-ui-ux`: No new UI work, just wiring existing pieces
    - `dev-browser`: Playwright covers all browser needs

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential, after all Wave 3 tasks)
  - **Blocks**: F1, F2, F3, F4
  - **Blocked By**: Tasks 13, 14, 15, 16, 17 (all Wave 3 pages)

  **References**:

  **Pattern References**:
  - `src/app/sampah-pintar/page.tsx` (Task 13) — Landing page to add "View Dashboard" link
  - `src/app/sampah-pintar/dashboard/page.tsx` (Task 14) — Dashboard to add "View TPA" link
  - `src/app/sampah-pintar/tpa/page.tsx` (Task 15) — TPA to add "Get Policy" link
  - `src/app/sampah-pintar/kebijakan/page.tsx` (Task 16) — Policy to add "Find Recycling" link
  - `src/app/sampah-pintar/daur-ulang/page.tsx` (Task 17) — Map page (terminal link in chain)

  **API/Type References**:
  - `src/lib/sampah-pintar/store.ts` (Task 12) — In-memory store; verify classify + manual-entry write to it, composition reads from it
  - `src/lib/i18n/id.json` — Indonesian strings; verify `sampahPintar.*` key tree is complete
  - `src/lib/i18n/en.json` — English strings; verify matching structure

  **WHY Each Reference Matters**:
  - All 5 page files: Each needs a cross-module link added — the integration chain is landing → dashboard → TPA → policy → recycling
  - `store.ts`: The glue between classify/manual-entry APIs and the dashboard — if store isn't wired, dashboard shows no user data
  - i18n JSON files: Missing keys cause `t()` to return key paths instead of translated strings

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full E2E flow — upload through recycling map
    Tool: Playwright
    Preconditions: Dev server running, all APIs working
    Steps:
      1. Navigate to http://localhost:3000/sampah-pintar
      2. Upload a test image and classify (city: Jakarta)
      3. Assert classification result is displayed
      4. Click "Lihat Dashboard" / "View Dashboard" link
      5. Assert URL is /sampah-pintar/dashboard (with city=jakarta)
      6. Assert dashboard shows data (at least seed data)
      7. Click "Lihat Prediksi TPA" / "View TPA" link
      8. Assert URL is /sampah-pintar/tpa
      9. Assert TPA metrics are visible for Jakarta
      10. Click "Dapatkan Rekomendasi" / "Get Policy" link
      11. Assert URL is /sampah-pintar/kebijakan
      12. Click generate button and wait for result (timeout: 15s)
      13. Assert policy result is visible
      14. Click "Temukan Fasilitas" / "Find Recycling" link
      15. Assert URL is /sampah-pintar/daur-ulang
      16. Assert map loads with Jakarta facilities
      17. Screenshot final state
    Expected Result: Complete navigation chain works from upload to recycling map
    Failure Indicators: Any link missing, wrong city propagation, broken navigation
    Evidence: .sisyphus/evidence/task-18-e2e-flow.png

  Scenario: Build passes cleanly
    Tool: Bash
    Preconditions: All source files in place
    Steps:
      1. Run `npm run build`
      2. Assert exit code is 0
      3. Assert no TypeScript errors in output
      4. Assert no "Module not found" errors
    Expected Result: Build succeeds with zero errors
    Failure Indicators: Non-zero exit code, TS errors, missing module errors
    Evidence: .sisyphus/evidence/task-18-build.txt

  Scenario: No console errors on any page
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Set up page.on('console') listener filtering for 'error' type
      2. Set up page.on('pageerror') listener for uncaught exceptions
      3. Navigate to each of the 5 pages in sequence:
         - /sampah-pintar
         - /sampah-pintar/dashboard
         - /sampah-pintar/tpa
         - /sampah-pintar/kebijakan
         - /sampah-pintar/daur-ulang
      4. Wait 3s on each page for any async errors
      5. Assert zero console errors and zero uncaught exceptions across all pages
    Expected Result: Zero console errors across all 5 pages
    Failure Indicators: Any console.error or uncaught exception on any page
    Evidence: .sisyphus/evidence/task-18-console-errors.txt

  Scenario: No console.log in production code
    Tool: Bash
    Preconditions: All SampahPintar source files in place
    Steps:
      1. Run grep -r "console.log" src/app/sampah-pintar/ src/lib/sampah-pintar/ src/app/api/v1/sampah-pintar/
      2. Assert zero matches (exit code 1 from grep = no matches = pass)
    Expected Result: No console.log found in any SampahPintar file
    Failure Indicators: Any console.log match found
    Evidence: .sisyphus/evidence/task-18-no-console-log.txt

  Scenario: i18n key completeness
    Tool: Bash
    Preconditions: All source files + i18n JSON files in place
    Steps:
      1. Extract all t('sampahPintar.*') calls from all SampahPintar source files
      2. Check each key exists in both id.json and en.json
      3. Assert no missing keys
    Expected Result: All i18n keys used in code exist in both language files
    Failure Indicators: Key present in code but missing from JSON file
    Evidence: .sisyphus/evidence/task-18-i18n-completeness.txt
  ```

  **Evidence to Capture:**
  - [ ] task-18-e2e-flow.png — Screenshot at end of full navigation chain
  - [ ] task-18-build.txt — Full npm run build output
  - [ ] task-18-console-errors.txt — Console error check results across all pages
  - [ ] task-18-no-console-log.txt — Grep results confirming no console.log
  - [ ] task-18-i18n-completeness.txt — i18n key audit results

  **Commit**: YES (Wave 4 standalone)
  - Message: `feat(sampah-pintar): integrate modules and verify end-to-end flow`
  - Files: Various (cross-module links in page files, i18n fixes, build fixes)
  - Pre-commit: `npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + linter. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start dev server. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-module flow: upload photo → see in dashboard → check TPA → get policy → find recycling. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual implementation. Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After | Message | Files | Pre-commit |
|-------|---------|-------|------------|
| Wave 1 | `feat(sampah-pintar): add types, seed data, mock CV, layout, i18n` | src/lib/sampah-pintar/*, src/app/sampah-pintar/layout.tsx | `npm run build` |
| Wave 2 | `feat(sampah-pintar): add API routes for classify, composition, TPA, policy, recycling, manual-entry` | src/app/api/v1/sampah-pintar/* | `npm run build` |
| Wave 3 | `feat(sampah-pintar): add landing, dashboard, TPA, policy, recycling pages` | src/app/sampah-pintar/* | `npm run build` |
| Wave 4 | `feat(sampah-pintar): integrate modules and verify end-to-end flow` | various | `npm run build` |

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build successful, zero errors
curl http://localhost:3000/api/v1/sampah-pintar/classify -X POST -F 'photo=@test.jpg'  # Expected: 200 + JSON with 7 categories
curl http://localhost:3000/api/v1/sampah-pintar/composition?city=jakarta  # Expected: 200 + aggregated composition data
curl http://localhost:3000/api/v1/sampah-pintar/tpa-forecast?city=jakarta  # Expected: 200 + forecast timeline
curl http://localhost:3000/api/v1/sampah-pintar/recycling-facilities?city=jakarta&material=plastik  # Expected: 200 + GeoJSON
```

### Final Checklist
- [ ] All 5 pages render at /sampah-pintar/* routes
- [ ] All 6 API endpoints return proper JSON
- [ ] Photo upload → classification → dashboard flow works
- [ ] TPA predictor shows all 5 cities with exhaustion dates
- [ ] Policy engine returns structured recommendations
- [ ] Recycling map shows facilities with material filter
- [ ] Dark theme consistent with AirBersih
- [ ] i18n works in both id and en
- [ ] No TypeScript errors, no console.log in production
- [ ] `npm run build` passes cleanly

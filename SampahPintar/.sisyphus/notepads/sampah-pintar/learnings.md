# SampahPintar — Learnings

## [2026-02-22] Session ses_37adcd2e6ffeOHieb1PvFeMEUZ — Atlas initialization

### AirBersih Codebase Patterns

**File locations (ALL relative to `C:\Project Vasko\AirBersih\`):**
- Types: `src/lib/types.ts` — interfaces only, no runtime code, PascalCase, named exports
- Constants: `src/lib/constants/water-standards.ts` — `export const NAME: Type[] = [...]` arrays, helper functions at bottom
- i18n: `src/lib/i18n/id.json` + `en.json` — nested JSON, dot-notation via `getNestedValue()` in index.tsx
- i18n hook: `import { useI18n } from '@/lib/i18n'` → `const { t, locale, setLocale } = useI18n()`
- API routes: `src/app/api/v1/[name]/route.ts` — `import { NextResponse } from 'next/server'`, return `NextResponse.json({ success: true, data: ..., meta: {...} })`
- Pages: `'use client'` directive at top, `import { useI18n } from '@/lib/i18n'`
- MapLibre: `import maplibregl from 'maplibre-gl'` + `import 'maplibre-gl/dist/maplibre-gl.css'` — direct import (not dynamic) in `src/app/map/page.tsx`
- Navbar: `src/components/layout/Navbar.tsx` — `navItems` array with `{ href, label }` objects

**i18n structure (confirmed):**
- Keys nested as objects: `{ "sampahPintar": { "uploadTitle": "..." } }`
- Accessed as: `t('sampahPintar.uploadTitle')`
- Both `id.json` and `en.json` must have matching key structure
- `id.json` ends at line 138, `en.json` should match

**API route pattern (confirmed from risk/[desaCode]/route.ts):**
```ts
import { NextResponse } from 'next/server';
export async function GET(request: Request, { params }: { params: Promise<{ param: string }> }) {
  return NextResponse.json({ success: true, data: ..., meta: { timestamp: new Date().toISOString() } });
}
```

**Navbar nav items (confirmed):**
```ts
const navItems = [
  { href: '/map', label: t('nav.map') },
  { href: '/analytics', label: t('nav.analytics') },
  ...
];
```
SampahPintar link must be added to `navItems` array AND a nav key added to id.json and en.json.

**Dark theme pattern:** `background: 'rgba(0,0,0,0.85)'`, `borderBottom: '1px solid rgba(255,255,255,0.055)'`, white text, Tailwind classes

**Import alias:** `@/` maps to `src/` (confirmed from imports like `@/lib/i18n`, `@/lib/constants/water-standards`)

### Critical Notes for All Wave 1 Agents
- AirBersih app root is at `C:\Project Vasko\AirBersih\` — ALL src/ paths are relative to that
- SampahPintar working dir is `C:\Project Vasko\AirBersih\SampahPintar\` — notes/plans only
- New files go into `C:\Project Vasko\AirBersih\src\lib\sampah-pintar\` and `src\app\sampah-pintar\`
- DO NOT use `any` type anywhere
- DO NOT add `console.log` to production code
- DO NOT use `@ts-ignore` or `as any`

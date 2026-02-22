import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import type { ManualEntryPayload, WasteCategory } from '@/lib/sampah-pintar/types';
import { addManualEntry } from '@/lib/sampah-pintar/store';
import { KELURAHAN_LIST } from '@/lib/sampah-pintar/data/kelurahan';

// Rate limiter: 20 req/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now >= record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count += 1;
  return true;
}

const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'];
const WASTE_CATEGORIES: WasteCategory[] = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];

/**
 * POST /api/v1/sampah-pintar/manual-entry
 * Accept manual waste composition data for a kelurahan
 */
export async function POST(request: Request): Promise<NextResponse> {
  const ip = getRateLimitKey(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded: 20 requests per minute' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const payload = body as ManualEntryPayload;

  // Validate required fields
  if (!payload.kelurahan || !payload.kecamatan || !payload.city || !payload.composition) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing required fields: kelurahan, kecamatan, city, composition',
      },
      { status: 400 }
    );
  }

  // Validate city
  if (!VALID_CITIES.includes(payload.city.toLowerCase())) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid city. Must be one of: ${VALID_CITIES.join(', ')}`,
      },
      { status: 400 }
    );
  }

  // Validate all 7 waste categories present
  const hasAllCategories = WASTE_CATEGORIES.every(
    (cat) => typeof payload.composition[cat] === 'number'
  );
  if (!hasAllCategories) {
    return NextResponse.json(
      {
        success: false,
        error: 'All 7 waste categories required in composition: organik, plastik, kertas, logam, kaca, b3, residu',
      },
      { status: 400 }
    );
  }

  // Validate composition sums to ~100% (±2% tolerance)
  const total = Object.values(payload.composition).reduce((a, b) => a + b, 0);
  if (Math.abs(total - 100) > 2) {
    return NextResponse.json(
      {
        success: false,
        error: `Composition must sum to 100% (±2% tolerance). Got ${total.toFixed(1)}%`,
      },
      { status: 400 }
    );
  }

  // Validate that kelurahan/kecamatan/city combination exists (optional but good practice)
  const exists = KELURAHAN_LIST.some(
    (k) =>
      k.city === payload.city.toLowerCase() &&
      k.kecamatan === payload.kecamatan &&
      k.kelurahan === payload.kelurahan
  );
  if (!exists) {
    return NextResponse.json(
      {
        success: false,
        error: 'Kelurahan/Kecamatan/City combination not found in known data',
      },
      { status: 400 }
    );
  }

  // Generate ID and timestamp
  const id = randomUUID();
  const timestamp = new Date().toISOString();

  // Store entry
  addManualEntry({
    ...payload,
    id,
    timestamp,
  });

  return NextResponse.json(
    {
      success: true,
      data: { id, timestamp },
      meta: { timestamp },
    },
    { status: 200 }
  );
}

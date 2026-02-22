import { NextRequest, NextResponse } from 'next/server';
import { classifyWaste } from '@/lib/sampah-pintar/mock-classifier';
import { addClassificationResult } from '@/lib/sampah-pintar/store';
import type { ApiResponse, ClassificationResult } from '@/lib/sampah-pintar/types';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;

// --- Inline rate limiter (no external deps) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

/**
 * POST /api/v1/sampah-pintar/classify
 * Accepts multipart form photo upload, runs mock CV classification,
 * stores the result in memory, and returns a typed JSON response.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 10 req / min per IP
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  if (!checkRateLimit(ip, 10, 60_000)) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' } satisfies ApiResponse<never>,
      { status: 429 },
    );
  }

  // Parse multipart form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid multipart form data' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  // --- Validate photo field ---
  const photo = formData.get('photo');
  if (!photo || !(photo instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'Missing required field: photo (must be a file)' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(photo.type)) {
    return NextResponse.json(
      { success: false, error: `Invalid file type: ${photo.type}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  if (photo.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { success: false, error: 'File too large. Max 5MB.' } satisfies ApiResponse<never>,
      { status: 413 },
    );
  }

  // --- Validate required text fields ---
  const kelurahan = formData.get('kelurahan');
  const kecamatan = formData.get('kecamatan');
  const city = formData.get('city');

  if (
    typeof kelurahan !== 'string' || kelurahan.trim() === '' ||
    typeof kecamatan !== 'string' || kecamatan.trim() === '' ||
    typeof city !== 'string' || city.trim() === ''
  ) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields: kelurahan, kecamatan, city' } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  const cityNormalized = city.trim().toLowerCase();
  if (!(VALID_CITIES as readonly string[]).includes(cityNormalized)) {
    return NextResponse.json(
      { success: false, error: `Invalid city: ${city}. Valid cities: ${VALID_CITIES.join(', ')}` } satisfies ApiResponse<never>,
      { status: 400 },
    );
  }

  // --- Run mock classification ---
  const buffer = Buffer.from(await photo.arrayBuffer());
  const result: ClassificationResult = classifyWaste(buffer);

  // Fill in location fields
  result.kelurahan = kelurahan.trim();
  result.kecamatan = kecamatan.trim();
  result.city = cityNormalized;

  // Store result
  addClassificationResult(result);

  return NextResponse.json(
    { success: true, data: result, meta: { timestamp: new Date().toISOString() } } satisfies ApiResponse<ClassificationResult>,
  );
}

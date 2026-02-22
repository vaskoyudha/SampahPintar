import { NextResponse } from 'next/server';
import { RECYCLING_FACILITIES } from '@/lib/sampah-pintar/data/recycling-facilities';
import type { WasteCategory } from '@/lib/sampah-pintar/types';

// ── GeoJSON types (local — no @types/geojson dependency) ──────────────────

interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONPoint;
  properties: {
    id: string;
    name: string;
    address: string;
    type: 'bank_sampah' | 'tps3r' | 'recycling_center';
    acceptedMaterials: string[];
    phone?: string;
    operatingHours?: string;
  };
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

// ── In-memory cache ───────────────────────────────────────────────────────

interface CacheEntry {
  data: GeoJSONFeatureCollection;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): GeoJSONFeatureCollection | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

function setCache(key: string, data: GeoJSONFeatureCollection): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── City coordinate bounds ────────────────────────────────────────────────

const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;
type ValidCity = (typeof VALID_CITIES)[number];

const CITY_BOUNDS: Record<ValidCity, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  jakarta:  { minLat: -6.4,  maxLat: -6.0,  minLng: 106.6, maxLng: 107.1 },
  surabaya: { minLat: -7.5,  maxLat: -7.1,  minLng: 112.5, maxLng: 112.9 },
  bandung:  { minLat: -7.1,  maxLat: -6.8,  minLng: 107.5, maxLng: 107.8 },
  semarang: { minLat: -7.2,  maxLat: -6.8,  minLng: 110.2, maxLng: 110.6 },
  makassar: { minLat: -5.3,  maxLat: -4.9,  minLng: 119.3, maxLng: 119.6 },
};

const VALID_WASTE_CATEGORIES: WasteCategory[] = [
  'organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu',
];

// ── GET handler ───────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = searchParams.get('city');
  const materialParam = searchParams.get('material');

  // Validate required city parameter
  if (!cityParam) {
    return NextResponse.json(
      { success: false, error: 'Missing required query parameter: city' },
      { status: 400 },
    );
  }

  const city = cityParam.toLowerCase().trim();

  if (!(VALID_CITIES as readonly string[]).includes(city)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid city "${city}". Valid values: ${VALID_CITIES.join(', ')}`,
      },
      { status: 400 },
    );
  }

  // Parse and filter materials to valid-only (skip unknown silently)
  const materials: WasteCategory[] = materialParam
    ? materialParam
        .split(',')
        .map((m) => m.trim().toLowerCase())
        .filter(Boolean)
        .filter((m): m is WasteCategory =>
          VALID_WASTE_CATEGORIES.includes(m as WasteCategory),
        )
    : [];

  // Cache lookup
  const cacheKey = `${city}:${materialParam ?? 'all'}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json({
      success: true,
      data: cached,
      meta: {
        timestamp: new Date().toISOString(),
        count: cached.features.length,
      },
    });
  }

  // Filter facilities by city coordinate bounds
  const bounds = CITY_BOUNDS[city as ValidCity];
  let filtered = RECYCLING_FACILITIES.filter(
    (f) =>
      f.lat >= bounds.minLat &&
      f.lat <= bounds.maxLat &&
      f.lng >= bounds.minLng &&
      f.lng <= bounds.maxLng,
  );

  // Filter by materials (ALL requested materials must be accepted)
  if (materials.length > 0) {
    filtered = filtered.filter((f) =>
      materials.every((m) => f.acceptedMaterials.includes(m)),
    );
  }

  // Convert to GeoJSON FeatureCollection
  const featureCollection: GeoJSONFeatureCollection = {
    type: 'FeatureCollection',
    features: filtered.map((f) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [f.lng, f.lat] as [number, number],
      },
      properties: {
        id: f.id,
        name: f.name,
        address: f.address,
        type: f.type,
        acceptedMaterials: f.acceptedMaterials as string[],
        ...(f.phone && { phone: f.phone }),
        ...(f.operatingHours && { operatingHours: f.operatingHours }),
      },
    })),
  };

  // Populate cache
  setCache(cacheKey, featureCollection);

  return NextResponse.json({
    success: true,
    data: featureCollection,
    meta: {
      timestamp: new Date().toISOString(),
      count: filtered.length,
    },
  });
}
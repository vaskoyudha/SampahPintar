import { NextResponse } from 'next/server';
import type { CompositionAggregate, WasteCategory } from '@/lib/sampah-pintar/types';
import { KELURAHAN_LIST } from '@/lib/sampah-pintar/data/kelurahan';
import { getEntriesByCity } from '@/lib/sampah-pintar/store';

const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'];

/**
 * GET /api/v1/sampah-pintar/composition
 * Aggregates waste composition data per kelurahan for a given city
 * 
 * Query Parameters:
 * - city (required): One of 'jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'
 * - kelurahan (optional): Filter by specific kelurahan name
 * - kecamatan (optional): Filter by specific kecamatan name
 * 
 * Returns: { success: true, data: CompositionAggregate[] }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const kelurahanFilter = searchParams.get('kelurahan');
    const kecamatanFilter = searchParams.get('kecamatan');

    // Validate required city parameter
    if (!city) {
      return NextResponse.json(
        { success: false, error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // Validate city is in allowed list
    if (!VALID_CITIES.includes(city.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid city. Allowed values: ${VALID_CITIES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Filter seed data by city (and optional filters)
    let filteredKelurahan = KELURAHAN_LIST.filter(
      (k) => k.city === city.toLowerCase()
    );

    if (kelurahanFilter) {
      filteredKelurahan = filteredKelurahan.filter(
        (k) => k.kelurahan.toLowerCase() === kelurahanFilter.toLowerCase()
      );
    }

    if (kecamatanFilter) {
      filteredKelurahan = filteredKelurahan.filter(
        (k) => k.kecamatan.toLowerCase() === kecamatanFilter.toLowerCase()
      );
    }

    // Get live store entries for this city
    const storeEntries = getEntriesByCity(city.toLowerCase());

    // Build aggregates for each kelurahan
    const aggregates: CompositionAggregate[] = filteredKelurahan.map(
      (kelurahanData) => {
        // Find matching store entries for this kelurahan
        const matchingEntries = storeEntries.filter(
          (entry) =>
            entry.kelurahan === kelurahanData.kelurahan &&
            entry.kecamatan === kelurahanData.kecamatan
        );

        // Build composition: start with seed, average with store entries if available
        let composition = { ...kelurahanData.composition };

        if (matchingEntries.length > 0) {
          const wasteCategories: WasteCategory[] = [
            'organik',
            'plastik',
            'kertas',
            'logam',
            'kaca',
            'b3',
            'residu',
          ];

          for (const category of wasteCategories) {
            const values = matchingEntries.map((e) => e.composition[category]);
            const average =
              values.reduce((a, b) => a + b, 0) / values.length;
            composition[category] = average;
          }
        }

        return {
          kelurahan: kelurahanData.kelurahan,
          kecamatan: kelurahanData.kecamatan,
          city: kelurahanData.city,
          sampleCount: matchingEntries.length,
          composition,
          period: new Date().getFullYear().toString(),
        };
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: aggregates,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

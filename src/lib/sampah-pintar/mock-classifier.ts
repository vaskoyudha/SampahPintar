import { randomUUID } from 'crypto';
import type { WasteCategory, WasteClassification, ClassificationResult } from '@/lib/sampah-pintar/types';

/**
 * Deterministic hash using djb2 algorithm
 * Returns the absolute value of the hash
 */
function djb2Hash(buffer: Buffer): number {
  let hash = 5381;
  for (let i = 0; i < buffer.length; i++) {
    hash = ((hash << 5) + hash) ^ buffer[i];
  }
  return Math.abs(hash);
}

/**
 * Seeded Linear Congruential Generator (LCG)
 * Provides deterministic pseudo-random numbers from a seed
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    // LCG formula: next = (a * seed + c) mod m
    const a = 1664525;
    const c = 1013904223;
    const m = 2 ** 32;
    this.seed = (a * this.seed + c) % m;
    return this.seed / m;
  }

  /**
   * Generate random number in range [min, max)
   */
  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Waste category colors in hex format
 */
export const WASTE_CATEGORY_COLORS: Record<WasteCategory, string> = {
  organik: '#4ade80',
  plastik: '#60a5fa',
  kertas: '#fbbf24',
  logam: '#94a3b8',
  kaca: '#34d399',
  b3: '#f87171',
  residu: '#a78bfa',
};

/**
 * Get localized label for a waste category
 */
export function getWasteCategoryLabel(
  category: WasteCategory,
  lang: 'id' | 'en'
): string {
  const labels: Record<WasteCategory, Record<'id' | 'en', string>> = {
    organik: { id: 'Organik', en: 'Organic' },
    plastik: { id: 'Plastik', en: 'Plastic' },
    kertas: { id: 'Kertas', en: 'Paper' },
    logam: { id: 'Logam', en: 'Metal' },
    kaca: { id: 'Kaca', en: 'Glass' },
    b3: { id: 'B3 (Berbahaya)', en: 'B3 (Hazardous)' },
    residu: { id: 'Residu', en: 'Residue' },
  };

  return labels[category][lang];
}

/**
 * Classify waste from image buffer deterministically
 * Same buffer always produces same classification
 */
export function classifyWaste(imageBuffer: Buffer): ClassificationResult {
  // Step 1: Generate deterministic seed from image buffer
  const hashValue = djb2Hash(imageBuffer);
  const imageHash = hashValue.toString(16);

  // Step 2: Create seeded RNG
  const rng = new SeededRandom(hashValue);

  // Step 3: Generate base weights for all 7 categories
  // Target ranges: organik 45-65%, plastik 10-20%, kertas 8-15%, logam 2-5%, kaca 1-4%, b3 1-3%, residu 5-12%
  const baseWeights: Record<WasteCategory, number> = {
    organik: rng.nextInRange(45, 65),
    plastik: rng.nextInRange(10, 20),
    kertas: rng.nextInRange(8, 15),
    logam: rng.nextInRange(2, 5),
    kaca: rng.nextInRange(1, 4),
    b3: rng.nextInRange(1, 3),
    residu: rng.nextInRange(5, 12),
  };

  // Step 4: Normalize weights to sum to exactly 100
  const totalWeight = Object.values(baseWeights).reduce((a, b) => a + b, 0);
  const percentages: Record<WasteCategory, number> = {} as Record<WasteCategory, number>;

  for (const category of Object.keys(baseWeights) as WasteCategory[]) {
    percentages[category] = (baseWeights[category] / totalWeight) * 100;
  }

  // Step 5: Generate confidence scores (0.75-0.95) for each category
  const confidences: Record<WasteCategory, number> = {} as Record<WasteCategory, number>;
  for (const category of Object.keys(percentages) as WasteCategory[]) {
    confidences[category] = rng.nextInRange(0.75, 0.95);
  }

  // Step 6: Build classifications array with all 7 categories
  const categories: WasteCategory[] = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];
  const classifications: WasteClassification[] = categories.map((category) => ({
    category,
    percentage: Math.round(percentages[category] * 100) / 100,
    confidence: Math.round(confidences[category] * 100) / 100,
  }));

  // Step 7: Verify percentages sum to 100 (with minor floating point tolerance)
  const totalPercentage = classifications.reduce((sum, c) => sum + c.percentage, 0);
  const percentageDiff = 100 - totalPercentage;

  // Adjust the largest percentage to ensure exact sum of 100
  if (Math.abs(percentageDiff) > 0.01) {
    const largestIdx = classifications.reduce((maxIdx, c, idx) => 
      c.percentage > classifications[maxIdx].percentage ? idx : maxIdx, 0
    );
    classifications[largestIdx].percentage = 
      Math.round((classifications[largestIdx].percentage + percentageDiff) * 100) / 100;
  }

  // Step 8: Create ClassificationResult
  const result: ClassificationResult = {
    id: randomUUID(),
    classifications,
    imageHash,
    kelurahan: '',
    kecamatan: '',
    city: '',
    timestamp: new Date().toISOString(),
    isVerified: false,
  };

  return result;
}

/**
 * In-memory store for classification + manual entry results (MVP only — not persisted)
 */
import type { ClassificationResult, ManualEntryPayload, WasteCategory } from '@/lib/sampah-pintar/types';

export interface StoredEntry {
  id: string;
  type: 'photo' | 'manual';
  kelurahan: string;
  kecamatan: string;
  city: string;
  composition: Record<WasteCategory, number>;
  timestamp: string;
  isVerified: boolean;
  notes?: string;
}

// Simple module-level array — persists for lifetime of server process
let entries: StoredEntry[] = [];

export function addClassificationResult(result: ClassificationResult): void {
  const composition = {} as Record<WasteCategory, number>;
  for (const c of result.classifications) {
    composition[c.category] = c.percentage;
  }

  entries.push({
    id: result.id,
    type: 'photo',
    kelurahan: result.kelurahan,
    kecamatan: result.kecamatan,
    city: result.city,
    composition,
    timestamp: result.timestamp,
    isVerified: result.isVerified,
  });
}

export function addManualEntry(payload: ManualEntryPayload & { id: string; timestamp: string }): void {
  entries.push({
    id: payload.id,
    type: 'manual',
    kelurahan: payload.kelurahan,
    kecamatan: payload.kecamatan,
    city: payload.city,
    composition: payload.composition,
    timestamp: payload.timestamp,
    isVerified: false,
    notes: payload.notes,
  });
}

export function getEntries(): StoredEntry[] {
  return [...entries];
}

export function getEntriesByCity(city: string): StoredEntry[] {
  return entries.filter((e) => e.city === city);
}

export function getEntriesByKelurahan(city: string, kelurahan: string): StoredEntry[] {
  return entries.filter((e) => e.city === city && e.kelurahan === kelurahan);
}

/** Add a raw StoredEntry directly */
export function addEntry(entry: StoredEntry): void {
  entries.push(entry);
}

/** Clear all entries (for testing) */
export function clearEntries(): void {
  entries = [];
}

/** Get all entries (alias for getEntries) */
export function getAllEntries(): StoredEntry[] {
  return entries;
}

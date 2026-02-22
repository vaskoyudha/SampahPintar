// NOTE: This is seed/demo data for MVP. Not official government data.
/**
 * Kelurahan (Sub-District) Hierarchy with Waste Composition
 * Contains demographic and waste composition data for municipal subdivisions
 * Compositions are inspired by SIPSN (Sistem Informasi Pengelolaan Sampah Nasional) data patterns
 */

import type { WasteCategory } from '../types';

export interface KelurahanData {
  city: string;
  kecamatan: string;
  kelurahan: string;
  composition: Record<WasteCategory, number>;
}

export const KELURAHAN_LIST: KelurahanData[] = [
  // Jakarta - Kecamatan Cakung
  {
    city: 'jakarta',
    kecamatan: 'Cakung',
    kelurahan: 'Cakung Barat',
    composition: {
      organik: 58,
      plastik: 16,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'jakarta',
    kecamatan: 'Cakung',
    kelurahan: 'Cakung Timur',
    composition: {
      organik: 62,
      plastik: 14,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'jakarta',
    kecamatan: 'Cakung',
    kelurahan: 'Jatinegara Kaum',
    composition: {
      organik: 60,
      plastik: 15,
      kertas: 11,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  // Jakarta - Kecamatan Penjaringan
  {
    city: 'jakarta',
    kecamatan: 'Penjaringan',
    kelurahan: 'Pluit',
    composition: {
      organik: 55,
      plastik: 18,
      kertas: 12,
      logam: 4,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'jakarta',
    kecamatan: 'Penjaringan',
    kelurahan: 'Penjaringan',
    composition: {
      organik: 59,
      plastik: 15,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'jakarta',
    kecamatan: 'Penjaringan',
    kelurahan: 'Kapuk Muara',
    composition: {
      organik: 61,
      plastik: 13,
      kertas: 10,
      logam: 2,
      kaca: 3,
      b3: 1,
      residu: 10,
    },
  },
  // Surabaya - Kecamatan Sawahan
  {
    city: 'surabaya',
    kecamatan: 'Sawahan',
    kelurahan: 'Sawahan',
    composition: {
      organik: 63,
      plastik: 14,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  {
    city: 'surabaya',
    kecamatan: 'Sawahan',
    kelurahan: 'Kupang Krajan',
    composition: {
      organik: 60,
      plastik: 16,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'surabaya',
    kecamatan: 'Sawahan',
    kelurahan: 'Putat Jaya',
    composition: {
      organik: 65,
      plastik: 12,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  // Surabaya - Kecamatan Tambaksari
  {
    city: 'surabaya',
    kecamatan: 'Tambaksari',
    kelurahan: 'Tambaksari',
    composition: {
      organik: 62,
      plastik: 15,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 7,
    },
  },
  {
    city: 'surabaya',
    kecamatan: 'Tambaksari',
    kelurahan: 'Gading',
    composition: {
      organik: 58,
      plastik: 17,
      kertas: 11,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'surabaya',
    kecamatan: 'Tambaksari',
    kelurahan: 'Pacarkeling',
    composition: {
      organik: 61,
      plastik: 14,
      kertas: 10,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  // Bandung - Kecamatan Coblong
  {
    city: 'bandung',
    kecamatan: 'Coblong',
    kelurahan: 'Dago',
    composition: {
      organik: 56,
      plastik: 18,
      kertas: 12,
      logam: 3,
      kaca: 2,
      b3: 2,
      residu: 7,
    },
  },
  {
    city: 'bandung',
    kecamatan: 'Coblong',
    kelurahan: 'Lebak Siliwangi',
    composition: {
      organik: 64,
      plastik: 12,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'bandung',
    kecamatan: 'Coblong',
    kelurahan: 'Cipaganti',
    composition: {
      organik: 59,
      plastik: 16,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  // Bandung - Kecamatan Cicendo
  {
    city: 'bandung',
    kecamatan: 'Cicendo',
    kelurahan: 'Arjuna',
    composition: {
      organik: 62,
      plastik: 14,
      kertas: 10,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  {
    city: 'bandung',
    kecamatan: 'Cicendo',
    kelurahan: 'Husein Sastranegara',
    composition: {
      organik: 60,
      plastik: 15,
      kertas: 11,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'bandung',
    kecamatan: 'Cicendo',
    kelurahan: 'Pamoyanan',
    composition: {
      organik: 57,
      plastik: 17,
      kertas: 11,
      logam: 3,
      kaca: 2,
      b3: 2,
      residu: 8,
    },
  },
  // Semarang - Kecamatan Semarang Tengah
  {
    city: 'semarang',
    kecamatan: 'Semarang Tengah',
    kelurahan: 'Gabahan',
    composition: {
      organik: 61,
      plastik: 15,
      kertas: 10,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  {
    city: 'semarang',
    kecamatan: 'Semarang Tengah',
    kelurahan: 'Kranggan',
    composition: {
      organik: 59,
      plastik: 16,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  {
    city: 'semarang',
    kecamatan: 'Semarang Tengah',
    kelurahan: 'Miroto',
    composition: {
      organik: 63,
      plastik: 13,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  // Semarang - Kecamatan Tembalang
  {
    city: 'semarang',
    kecamatan: 'Tembalang',
    kelurahan: 'Tembalang',
    composition: {
      organik: 65,
      plastik: 12,
      kertas: 8,
      logam: 2,
      kaca: 1,
      b3: 1,
      residu: 11,
    },
  },
  {
    city: 'semarang',
    kecamatan: 'Tembalang',
    kelurahan: 'Bulusan',
    composition: {
      organik: 62,
      plastik: 14,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'semarang',
    kecamatan: 'Tembalang',
    kelurahan: 'Mangunharjo',
    composition: {
      organik: 60,
      plastik: 15,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  // Makassar - Kecamatan Tamalanrea
  {
    city: 'makassar',
    kecamatan: 'Tamalanrea',
    kelurahan: 'Tamalanrea',
    composition: {
      organik: 64,
      plastik: 13,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  {
    city: 'makassar',
    kecamatan: 'Tamalanrea',
    kelurahan: 'Tamalanrea Indah',
    composition: {
      organik: 59,
      plastik: 17,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'makassar',
    kecamatan: 'Tamalanrea',
    kelurahan: 'Kapasa',
    composition: {
      organik: 62,
      plastik: 14,
      kertas: 10,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
  // Makassar - Kecamatan Panakkukang
  {
    city: 'makassar',
    kecamatan: 'Panakkukang',
    kelurahan: 'Panakkukang',
    composition: {
      organik: 61,
      plastik: 15,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 8,
    },
  },
  {
    city: 'makassar',
    kecamatan: 'Panakkukang',
    kelurahan: 'Paropo',
    composition: {
      organik: 63,
      plastik: 13,
      kertas: 9,
      logam: 2,
      kaca: 2,
      b3: 1,
      residu: 10,
    },
  },
  {
    city: 'makassar',
    kecamatan: 'Panakkukang',
    kelurahan: 'Karuwisi',
    composition: {
      organik: 58,
      plastik: 17,
      kertas: 10,
      logam: 3,
      kaca: 2,
      b3: 1,
      residu: 9,
    },
  },
];



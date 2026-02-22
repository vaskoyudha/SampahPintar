// NOTE: This is seed/demo data for MVP. Not official government data.
/**
 * TPA (Tempat Pemrosesan Akhir) Cities Seed Data
 * Contains major landfill facilities across Indonesian cities
 * Used for waste management capacity planning and forecasting
 */

import type { TPACity } from '../types';

export const TPA_CITIES: TPACity[] = [
  {
    id: 'jakarta-bantar-gebang',
    name: 'Jakarta',
    tpaName: 'Bantar Gebang',
    city: 'jakarta',
    totalCapacityM3: 49_000_000,
    usedCapacityM3: 34_300_000,
    populationServed: 10_500_000,
    dailyWasteTons: 7000,
    recyclingRate: 0.08,
    compactionDensity: 0.7,
    openDate: '1989-01-01',
    latitude: -6.3726,
    longitude: 107.0133,
  },
  {
    id: 'surabaya-benowo',
    name: 'Surabaya',
    tpaName: 'Benowo',
    city: 'surabaya',
    totalCapacityM3: 12_000_000,
    usedCapacityM3: 7_800_000,
    populationServed: 2_900_000,
    dailyWasteTons: 2100,
    recyclingRate: 0.12,
    compactionDensity: 0.68,
    openDate: '2001-06-01',
    latitude: -7.2830,
    longitude: 112.6411,
  },
  {
    id: 'bandung-sarimukti',
    name: 'Bandung',
    tpaName: 'Sarimukti',
    city: 'bandung',
    totalCapacityM3: 8_000_000,
    usedCapacityM3: 6_000_000,
    populationServed: 2_500_000,
    dailyWasteTons: 1800,
    recyclingRate: 0.10,
    compactionDensity: 0.65,
    openDate: '2006-01-01',
    latitude: -6.9639,
    longitude: 107.5436,
  },
  {
    id: 'semarang-jatibarang',
    name: 'Semarang',
    tpaName: 'Jatibarang',
    city: 'semarang',
    totalCapacityM3: 5_500_000,
    usedCapacityM3: 4_400_000,
    populationServed: 1_700_000,
    dailyWasteTons: 1200,
    recyclingRate: 0.07,
    compactionDensity: 0.72,
    openDate: '1992-03-01',
    latitude: -7.0640,
    longitude: 110.3740,
  },
  {
    id: 'makassar-tamangapa',
    name: 'Makassar',
    tpaName: 'Tamangapa',
    city: 'makassar',
    totalCapacityM3: 4_000_000,
    usedCapacityM3: 3_400_000,
    populationServed: 1_500_000,
    dailyWasteTons: 1000,
    recyclingRate: 0.06,
    compactionDensity: 0.75,
    openDate: '1994-07-01',
    latitude: -5.1478,
    longitude: 119.4898,
  },
];

export const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  jakarta: { lat: -6.2088, lng: 106.8456 },
  surabaya: { lat: -7.2575, lng: 112.7508 },
  bandung: { lat: -6.9175, lng: 107.6191 },
  semarang: { lat: -6.9667, lng: 110.4203 },
  makassar: { lat: -5.1477, lng: 119.4320 },
};

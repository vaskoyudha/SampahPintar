/**
 * Core TypeScript types for SampahPintar module
 */

export type WasteCategory = 'organik' | 'plastik' | 'kertas' | 'logam' | 'kaca' | 'b3' | 'residu';

export interface WasteClassification {
    category: WasteCategory;
    percentage: number;
    confidence: number;
}

export interface ClassificationResult {
    id: string;
    classifications: WasteClassification[];
    imageHash: string;
    kelurahan: string;
    kecamatan: string;
    city: string;
    timestamp: string;
    isVerified: boolean;
}

export interface CompositionAggregate {
    kelurahan: string;
    kecamatan: string;
    city: string;
    sampleCount: number;
    composition: Record<WasteCategory, number>;
    period: string;
}

export interface TPACity {
    id: string;
    name: string;
    tpaName: string;
    city: string;
    totalCapacityM3: number;
    usedCapacityM3: number;
    populationServed: number;
    dailyWasteTons: number;
    recyclingRate: number;
    compactionDensity: number;
    openDate: string;
    latitude: number;
    longitude: number;
}

export interface TPAForecast {
    month: string;
    projectedUsedM3: number;
    projectedRemainingM3: number;
    fillPercentage: number;
}

export interface TPAForecastResult {
    city: TPACity;
    forecasts: TPAForecast[];
    exhaustionDate: string;
    yearsRemaining: number;
}

export interface PolicyTarget {
    category: WasteCategory;
    currentRate: number;
    targetRate: number;
    action: string;
}

export interface PolicyRecommendation {
    cityId: string;
    language: 'id' | 'en';
    summary: string;
    targets: PolicyTarget[];
    disclaimer: string;
    generatedAt: string;
}

export interface RecyclingFacility {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    acceptedMaterials: WasteCategory[];
    type: 'bank_sampah' | 'tps3r' | 'recycling_center';
    phone?: string;
    operatingHours?: string;
}

export interface ManualEntryPayload {
    kelurahan: string;
    kecamatan: string;
    city: string;
    composition: Record<WasteCategory, number>;
    notes?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: { timestamp: string };
}

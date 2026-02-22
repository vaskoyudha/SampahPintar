import { NextResponse } from 'next/server';
import { TPA_CITIES } from '@/lib/sampah-pintar/data/tpa-cities';
import type { TPAForecast, TPAForecastResult } from '@/lib/sampah-pintar/types';

const VALID_CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;
const ANNUAL_POPULATION_GROWTH = 0.012; // 1.2% per year

/**
 * GET /api/v1/sampah-pintar/tpa-forecast
 * Projects TPA (landfill) capacity exhaustion for a given Indonesian city
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city || !VALID_CITIES.includes(city as (typeof VALID_CITIES)[number])) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid or missing city parameter. Valid cities: ${VALID_CITIES.join(', ')}`,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 400 }
    );
  }

  const tpaCity = TPA_CITIES.find((c) => c.city === city);

  if (!tpaCity) {
    return NextResponse.json(
      {
        success: false,
        error: `TPA data not found for city: ${city}`,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 404 }
    );
  }

  const months = Math.min(240, Math.max(1, parseInt(searchParams.get('months') ?? '60', 10)));
  const monthlyGrowthFactor = Math.pow(1 + ANNUAL_POPULATION_GROWTH, 1 / 12);

  let currentUsedM3 = tpaCity.usedCapacityM3;
  let currentDailyWaste = tpaCity.dailyWasteTons;
  let exhaustionDate: string | null = null;

  const forecasts: TPAForecast[] = [];
  const startDate = new Date();

  for (let i = 0; i < months; i++) {
    // Monthly waste volume added (tons → m3 after compaction, minus recycling)
    const monthlyWasteTons = currentDailyWaste * 30 * (1 - tpaCity.recyclingRate);
    const monthlyWasteM3 = monthlyWasteTons / tpaCity.compactionDensity;

    currentUsedM3 += monthlyWasteM3;

    // Apply population growth to daily waste for next month
    currentDailyWaste *= monthlyGrowthFactor;

    const projectedRemainingM3 = Math.max(0, tpaCity.totalCapacityM3 - currentUsedM3);
    const fillPercentage = Math.min(100, (currentUsedM3 / tpaCity.totalCapacityM3) * 100);

    // Month label: "YYYY-MM"
    const forecastDate = new Date(startDate);
    forecastDate.setMonth(startDate.getMonth() + i + 1);
    const monthLabel = forecastDate.toISOString().slice(0, 7);

    forecasts.push({
      month: monthLabel,
      projectedUsedM3: Math.round(currentUsedM3),
      projectedRemainingM3: Math.round(projectedRemainingM3),
      fillPercentage: Math.round(fillPercentage * 10) / 10,
    });

    // Record first month where capacity is exceeded
    if (!exhaustionDate && currentUsedM3 >= tpaCity.totalCapacityM3) {
      exhaustionDate = monthLabel;
    }
  }

  // If never exhausted within forecast window, project further to find exhaustion
  if (!exhaustionDate) {
    // Continue projecting (up to 480 more months = 40 years)
    let extUsedM3 = currentUsedM3;
    let extDailyWaste = currentDailyWaste;
    for (let j = 0; j < 480; j++) {
      const monthlyWasteTons = extDailyWaste * 30 * (1 - tpaCity.recyclingRate);
      extUsedM3 += monthlyWasteTons / tpaCity.compactionDensity;
      extDailyWaste *= monthlyGrowthFactor;
      if (extUsedM3 >= tpaCity.totalCapacityM3) {
        const d = new Date(startDate);
        d.setMonth(startDate.getMonth() + months + j + 1);
        exhaustionDate = d.toISOString().slice(0, 7);
        break;
      }
    }
    if (!exhaustionDate) exhaustionDate = 'beyond-40-years';
  }

  // Calculate yearsRemaining
  let yearsRemaining: number;
  if (exhaustionDate === 'beyond-40-years') {
    yearsRemaining = 40;
  } else {
    const exhaustion = new Date(exhaustionDate + '-01');
    yearsRemaining =
      Math.round(((exhaustion.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)) * 10) / 10;
  }

  const result: TPAForecastResult = {
    city: tpaCity,
    forecasts,
    exhaustionDate,
    yearsRemaining,
  };

  return NextResponse.json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() },
  });
}
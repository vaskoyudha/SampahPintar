'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useI18n } from '@/lib/i18n';
import type { TPAForecastResult } from '@/lib/sampah-pintar/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;
type City = typeof CITIES[number];

export default function TPAPredictorPage() {
  const { t } = useI18n();
  const [activeCity, setActiveCity] = useState<City>('jakarta');
  const [data, setData] = useState<TPAForecastResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (city: City) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/sampah-pintar/tpa-forecast?city=${city}&months=24`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const json = await response.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeCity);
  }, [activeCity]);

  const chartData = data ? {
    labels: data.forecasts.map(f => f.month),
    datasets: [
      {
        label: t('sampahPintar.tpa.capacityUsed'),
        data: data.forecasts.map(f => f.fillPercentage),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)' } },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)', maxRotation: 45 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        min: 0,
        max: 100,
        title: { display: true, text: '%', color: 'rgba(255,255,255,0.6)' },
      },
    },
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.85)', minHeight: '100vh' }} className="p-6 md:p-12 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            {t('sampahPintar.tpa.title')}
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('sampahPintar.tpa.desc')}
          </p>
        </div>

        {/* City Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {t('sampahPintar.tpa.selectCity')}
          </label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize"
                style={
                  activeCity === city
                    ? { background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }
                    : { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid transparent' }
                }
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center h-64 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="animate-pulse text-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {t('common.loading')}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center h-64 rounded-2xl space-y-4" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <div className="text-red-400 text-lg">{error}</div>
              <button 
                onClick={() => fetchData(activeCity)}
                className="px-6 py-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          )}

          {!loading && !error && data && chartData && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title={t('sampahPintar.tpa.capacityUsed')} 
                  value={`${Math.round((data.city.usedCapacityM3 / data.city.totalCapacityM3) * 100)}%`} 
                />
                <StatCard 
                  title={t('sampahPintar.tpa.exhaustionDate')} 
                  value={new Date(data.exhaustionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })} 
                />
                <StatCard 
                  title={t('sampahPintar.tpa.yearsRemaining')} 
                  value={data.yearsRemaining.toFixed(1)} 
                />
                <StatCard 
                  title={t('sampahPintar.tpa.dailyWaste')} 
                  value={`${data.city.dailyWasteTons.toLocaleString()} tons`} 
                />
              </div>

              {/* Chart Container */}
              <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="h-[400px] w-full">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div 
      className="p-6 rounded-2xl flex flex-col justify-center space-y-2 transition-all hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {title}
      </div>
      <div className="text-3xl font-bold text-white tracking-tight">
        {value}
      </div>
    </div>
  );
}

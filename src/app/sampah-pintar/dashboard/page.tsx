'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useI18n } from '@/lib/i18n';
import { WasteCategory, CompositionAggregate } from '@/lib/sampah-pintar/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'];
const CATEGORIES: WasteCategory[] = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];
const DATASET_COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#6b7280', '#06b6d4',
  '#ef4444', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'
];

export default function DashboardPage() {
  const { t } = useI18n();
  const [city, setCity] = useState<string>(CITIES[0]);
  const [data, setData] = useState<CompositionAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/sampah-pintar/composition?city=${city}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Invalid data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartData = {
    labels: CATEGORIES.map(cat => t(`sampahPintar.categories.${cat}`) || cat),
    datasets: data.map((agg, index) => ({
      label: agg.kelurahan,
      data: CATEGORIES.map(cat => agg.composition[cat] || 0),
      backgroundColor: DATASET_COLORS[index % DATASET_COLORS.length],
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.7)' } },
      title: { display: false },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: 'rgba(255,255,255,0.6)' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        max: 100,
      },
    },
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.85)', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {t('sampahPintar.dashboard.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>
            {t('sampahPintar.dashboard.desc')}
          </p>
        </header>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="city-select" style={{ color: 'white', marginRight: '1rem' }}>
            {t('sampahPintar.dashboard.selectCity')}:
          </label>
          <select
            id="city-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CITIES.map(c => (
              <option key={c} value={c} style={{ background: '#1f2937', color: 'white' }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.5rem',
          padding: '2rem',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: loading || error || data.length === 0 ? 'center' : 'flex-start',
          alignItems: loading || error || data.length === 0 ? 'center' : 'stretch'
        }}>
          {loading ? (
            <div style={{ color: 'white', fontSize: '1.25rem' }}>
              {t('sampahPintar.common.loading')}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ef4444', fontSize: '1.25rem', marginBottom: '1rem' }}>
                {t('sampahPintar.common.error')}
              </div>
              <button
                onClick={fetchData}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                {t('sampahPintar.common.retry')}
              </button>
            </div>
          ) : data.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.25rem' }}>
              {t('sampahPintar.dashboard.noData')}
            </div>
          ) : (
            <div style={{ position: 'relative', height: '60vh', width: '100%' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

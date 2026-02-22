'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { PolicyRecommendation, PolicyTarget } from '@/lib/sampah-pintar/types';

const CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  organik: '#22c55e',
  plastik: '#3b82f6',
  kertas: '#f59e0b',
  logam: '#6b7280',
  kaca: '#06b6d4',
  b3: '#ef4444',
  residu: '#8b5cf6',
};

export default function KebijakanPage() {
  const { t, locale, setLocale } = useI18n();
  const [selectedCity, setSelectedCity] = useState<string>('jakarta');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PolicyRecommendation | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/sampah-pintar/policy-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId: selectedCity, language: locale }),
      });
      
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || t('sampahPintar.common.error'));
      }
      
      setResult(json.data as PolicyRecommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sampahPintar.common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'rgba(0,0,0,0.85)', minHeight: '100vh', padding: '2rem', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          {t('sampahPintar.policy.title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
          {t('sampahPintar.policy.desc')}
        </p>

        {/* Controls Card */}
        <div style={{ 
          background: 'rgba(255,255,255,0.04)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                City
              </label>
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{ 
                  background: 'rgba(255,255,255,0.06)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white',
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem'
                }}
              >
                {CITIES.map(city => (
                  <option key={city} value={city} style={{ color: 'black' }}>
                    {city.charAt(0).toUpperCase() + city.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                {t('common.language')}
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setLocale('id')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    background: locale === 'id' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Indonesia
                </button>
                <button
                  onClick={() => setLocale('en')}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    background: locale === 'en' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{ 
              background: loading ? 'rgba(255,255,255,0.1)' : '#16a34a', 
              color: loading ? 'rgba(255,255,255,0.4)' : 'white',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {loading && (
              <span style={{ 
                display: 'inline-block', 
                width: '1rem', 
                height: '1rem', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTopColor: 'white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
            )}
            {loading ? t('sampahPintar.policy.generating') : t('sampahPintar.policy.generate')}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{ 
            background: 'rgba(239,68,68,0.1)', 
            border: '1px solid rgba(239,68,68,0.2)', 
            color: '#fca5a5', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {t('sampahPintar.policy.result')}
            </h2>
            
            {/* Summary Card */}
            <div style={{ 
              background: 'rgba(255,255,255,0.04)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              padding: '1.5rem', 
              borderRadius: '0.5rem'
            }}>
              <p style={{ color: 'white', lineHeight: '1.6' }}>
                {result.summary}
              </p>
            </div>

            {/* Targets List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.targets.map((target: PolicyTarget, idx: number) => {
                const isIncrease = target.targetRate > target.currentRate;
                const color = CATEGORY_COLORS[target.category] || '#9ca3af';
                
                return (
                  <div key={idx} style={{ 
                    background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.08)', 
                    borderLeft: `4px solid ${color}`,
                    padding: '1.5rem', 
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color, marginBottom: '0.25rem' }}>
                          {t(`sampahPintar.categories.${target.category}`)}
                        </h3>
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                          {t('sampahPintar.policy.target')}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{t('sampahPintar.policy.currentRate')}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{target.currentRate}%</div>
                        </div>
                        
                        <div style={{ color: isIncrease ? '#22c55e' : '#ef4444', fontSize: '1.5rem' }}>
                          {isIncrease ? '↑' : '→'}
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{t('sampahPintar.policy.targetRate')}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{target.targetRate}%</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
                        {t('sampahPintar.policy.action')}
                      </div>
                      <p style={{ color: 'white' }}>{target.action}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Disclaimer */}
            <div style={{ 
              marginTop: '1rem', 
              fontSize: '0.875rem', 
              color: 'rgba(255,255,255,0.4)', 
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1.5rem'
            }}>
              {result.disclaimer || t('sampahPintar.policy.disclaimer')}
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useI18n } from '@/lib/i18n';
import { WasteCategory } from '@/lib/sampah-pintar/types';

const CITY_CENTERS: Record<string, [number, number]> = {
  jakarta:  [106.8456, -6.2088],
  surabaya: [112.7508, -7.2575],
  bandung:  [107.6191, -6.9175],
  semarang: [110.4203, -6.9667],
  makassar: [119.4320, -5.1477],
};

const WASTE_CATEGORIES: WasteCategory[] = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];

export default function DaurUlangPage() {
  const { t } = useI18n();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedCity, setSelectedCity] = useState<string>('jakarta');
  const [selectedMaterials, setSelectedMaterials] = useState<WasteCategory[]>([]);
  const [facilityCount, setFacilityCount] = useState<number>(0);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: CITY_CENTERS[selectedCity],
      zoom: 11,
    });
    
    mapRef.current.addControl(new maplibregl.NavigationControl());
    
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — only init once

  // Fly to new city center when city changes
  useEffect(() => {
    if (mapRef.current && CITY_CENTERS[selectedCity]) {
      mapRef.current.flyTo({ center: CITY_CENTERS[selectedCity], zoom: 11 });
    }
  }, [selectedCity]);

  // Fetch data and update markers
  useEffect(() => {
    const materialQuery = selectedMaterials.length > 0 
      ? `&material=${selectedMaterials.join(',')}` : '';
      
    fetch(`/api/v1/sampah-pintar/recycling-facilities?city=${selectedCity}${materialQuery}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setFacilityCount(json.meta?.count || 0);
          
          // Remove old markers
          markersRef.current.forEach(m => m.remove());
          markersRef.current = [];
          
          const geojson = json.data;
          if (geojson && geojson.features) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            geojson.features.forEach((feature: any) => {
              const coords = feature.geometry.coordinates as [number, number];
              const props = feature.properties;
              
              const color = props.type === 'bank_sampah' ? '#22c55e' 
                : props.type === 'tps3r' ? '#3b82f6' : '#f59e0b';
              
              const el = document.createElement('div');
              el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;cursor:pointer;`;
              
              const popup = new maplibregl.Popup({ offset: 15 }).setHTML(`
                <div style="color:#111;font-family:sans-serif;font-size:12px;max-width:180px">
                  <strong>${props.name}</strong><br/>
                  <span>${props.address}</span><br/>
                  <em>${props.type.replace('_', ' ')}</em>
                </div>
              `);
              
              if (mapRef.current) {
                const marker = new maplibregl.Marker({ element: el })
                  .setLngLat(coords)
                  .setPopup(popup)
                  .addTo(mapRef.current);
                markersRef.current.push(marker);
              }
            });
          }
        }
      })
      .catch(() => {}); // silent fail
  }, [selectedCity, selectedMaterials]);

  const toggleMaterial = (material: WasteCategory) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: 'rgba(0,0,0,0.85)', padding: '16px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.055)' }}>
        <h1 style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>
          {t('sampahPintar.recycling.title')}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginBottom: '24px' }}>
          {t('sampahPintar.recycling.desc')}
        </p>

        <div style={{ marginBottom: '24px' }}>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '100%', padding: '8px', borderRadius: '4px' }}
          >
            {Object.keys(CITY_CENTERS).map(city => (
              <option key={city} value={city} style={{ color: 'black' }}>
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '12px' }}>
            {t('sampahPintar.recycling.filterByMaterial')}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {WASTE_CATEGORIES.map(material => {
              const isActive = selectedMaterials.includes(material);
              return (
                <button
                  key={material}
                  onClick={() => toggleMaterial(material)}
                  style={
                    isActive 
                      ? { background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer' }
                      : { background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', cursor: 'pointer' }
                  }
                >
                  {t(`sampahPintar.categories.${material}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'white', fontSize: '0.875rem' }}>
            {facilityCount > 0 
              ? `${facilityCount} ${t('sampahPintar.recycling.facilitiesFound')}`
              : t('sampahPintar.recycling.noFacilities')
            }
          </p>
        </div>
      </div>

      {/* Map */}
      <div ref={mapContainer} style={{ flex: 1 }} />
    </div>
  );
}

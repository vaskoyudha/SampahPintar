'use client';

import React, { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { ClassificationResult, WasteCategory, ManualEntryPayload } from '@/lib/sampah-pintar/types';
import { Upload, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, FileText } from 'lucide-react';

const CITIES = ['jakarta', 'surabaya', 'bandung', 'semarang', 'makassar'] as const;

const CATEGORY_COLORS: Record<WasteCategory, string> = {
  organik: '#22c55e',
  plastik: '#3b82f6',
  kertas: '#f59e0b',
  logam: '#6b7280',
  kaca: '#06b6d4',
  b3: '#ef4444',
  residu: '#8b5cf6',
};

const CATEGORIES: WasteCategory[] = ['organik', 'plastik', 'kertas', 'logam', 'kaca', 'b3', 'residu'];

export default function SampahPintarPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');

  // Photo Upload State
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadCity, setUploadCity] = useState<string>(CITIES[0]);
  const [uploadKelurahan, setUploadKelurahan] = useState<string>('');
  const [uploadKecamatan, setUploadKecamatan] = useState<string>('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [classifyResult, setClassifyResult] = useState<ClassificationResult | null>(null);
  const [classifyError, setClassifyError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Entry State
  const [manualCity, setManualCity] = useState<string>(CITIES[0]);
  const [manualKelurahan, setManualKelurahan] = useState<string>('');
  const [manualKecamatan, setManualKecamatan] = useState<string>('');
  const [composition, setComposition] = useState<Record<WasteCategory, number>>({
    organik: 0, plastik: 0, kertas: 0, logam: 0, kaca: 0, b3: 0, residu: 0
  });
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setClassifyResult(null);
      setClassifyError(null);
    }
  };

  const handleClassify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return;

    setIsClassifying(true);
    setClassifyError(null);
    setClassifyResult(null);

    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      formData.append('city', uploadCity);
      formData.append('kelurahan', uploadKelurahan);
      formData.append('kecamatan', uploadKecamatan);

      const response = await fetch('/api/v1/sampah-pintar/classify', {
        method: 'POST',
        body: formData,
      });
      
      const json = await response.json();
      if (!json.success) throw new Error(json.error || t('common.error'));
      
      setClassifyResult(json.data);
    } catch (err: unknown) {
      setClassifyError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsClassifying(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const total = Object.values(composition).reduce((sum, val) => sum + (Number(val) || 0), 0);
    if (Math.abs(total - 100) > 0.1) {
      setSubmitError(`Total composition must be 100% (currently ${total}%)`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const payload: ManualEntryPayload = {
        city: manualCity,
        kelurahan: manualKelurahan,
        kecamatan: manualKecamatan,
        composition,
        notes: notes || undefined
      };

      const response = await fetch('/api/v1/sampah-pintar/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const json = await response.json();
      if (!json.success) throw new Error(json.error || t('common.error'));
      
      setSubmitSuccess(true);
      setComposition({ organik: 0, plastik: 0, kertas: 0, logam: 0, kaca: 0, b3: 0, residu: 0 });
      setNotes('');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompositionChange = (cat: WasteCategory, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setComposition(prev => ({ ...prev, [cat]: numValue }));
  };

  const totalComposition = Object.values(composition).reduce((sum, val) => sum + (Number(val) || 0), 0);

  return (
    <div className="min-h-full p-6" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('sampahPintar.upload.title')}</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{t('sampahPintar.upload.desc')}</p>
        </div>

        {/* Mobile Tabs */}
        <div className="flex lg:hidden mb-6 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'upload' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {t('sampahPintar.upload.button')}
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'manual' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            {t('sampahPintar.upload.manualEntry')}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Photo Upload Section */}
          <div className={`flex-1 ${activeTab === 'upload' ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                {t('sampahPintar.upload.button')}
              </h2>

              <form onSubmit={handleClassify} className="space-y-5">
                {/* Photo Input */}
                <div>
                  <div 
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-medium">Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-white/5">
                          <ImageIcon className="w-8 h-8 text-white/60" />
                        </div>
                        <div className="text-white/80 font-medium">Click to upload photo</div>
                        <div className="text-sm text-white/40">JPEG, PNG, WEBP up to 5MB</div>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.city')}</label>
                    <select
                      value={uploadCity}
                      onChange={(e) => setUploadCity(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    >
                      {CITIES.map(c => <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.kecamatan')}</label>
                    <input
                      type="text"
                      value={uploadKecamatan}
                      onChange={(e) => setUploadKecamatan(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.kelurahan')}</label>
                    <input
                      type="text"
                      value={uploadKelurahan}
                      onChange={(e) => setUploadKelurahan(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    />
                  </div>
                </div>

                {classifyError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{classifyError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!photoFile || isClassifying}
                  className="w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#16a34a' }}
                >
                  {isClassifying ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('sampahPintar.upload.classifying')}</>
                  ) : (
                    t('sampahPintar.upload.button')
                  )}
                </button>
              </form>

              {/* Classification Result */}
              {classifyResult && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">{t('sampahPintar.upload.result')}</h3>
                  <div className="space-y-3">
                    {classifyResult.classifications.map((cls, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-white/80 capitalize">{t(`sampahPintar.categories.${cls.category}`)}</div>
                        <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ 
                              width: `${cls.percentage}%`,
                              backgroundColor: CATEGORY_COLORS[cls.category]
                            }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm font-medium text-white">
                          {cls.percentage.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className={`flex-1 ${activeTab === 'manual' ? 'block' : 'hidden lg:block'}`}>
            <div className="rounded-xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('sampahPintar.upload.manualEntry')}
              </h2>
              <p className="text-sm text-white/60 mb-6">{t('sampahPintar.upload.manualEntryDesc')}</p>

              <form onSubmit={handleManualSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.city')}</label>
                    <select
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    >
                      {CITIES.map(c => <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.kecamatan')}</label>
                    <input
                      type="text"
                      value={manualKecamatan}
                      onChange={(e) => setManualKecamatan(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.kelurahan')}</label>
                    <input
                      type="text"
                      value={manualKelurahan}
                      onChange={(e) => setManualKelurahan(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-white/80">{t('sampahPintar.upload.composition')}</label>
                    <span className={`text-sm font-medium ${Math.abs(totalComposition - 100) > 0.1 ? 'text-red-400' : 'text-green-400'}`}>
                      Total: {totalComposition}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => (
                      <div key={cat} className="relative">
                        <label className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/60 capitalize">
                          {t(`sampahPintar.categories.${cat}`)}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={composition[cat] || ''}
                          onChange={(e) => handleCompositionChange(cat, e.target.value)}
                          className="w-full rounded-lg pl-20 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-right"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">{t('sampahPintar.upload.notes')}</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>{submitError}</p>
                  </div>
                )}

                {submitSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>Data submitted successfully!</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || Math.abs(totalComposition - 100) > 0.1}
                  className="w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#16a34a' }}
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    t('sampahPintar.upload.submit')
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Upload, BarChart3, TrendingUp, FileText, MapPin } from 'lucide-react';
import React from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function SampahPintarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems: NavItem[] = [
    { href: '/sampah-pintar', label: t('sampahPintar.nav.beranda'), icon: <Upload className="w-4 h-4" /> },
    { href: '/sampah-pintar/dashboard', label: t('sampahPintar.nav.dashboard'), icon: <BarChart3 className="w-4 h-4" /> },
    { href: '/sampah-pintar/tpa', label: t('sampahPintar.nav.tpa'), icon: <TrendingUp className="w-4 h-4" /> },
    { href: '/sampah-pintar/kebijakan', label: t('sampahPintar.nav.kebijakan'), icon: <FileText className="w-4 h-4" /> },
    { href: '/sampah-pintar/daur-ulang', label: t('sampahPintar.nav.daurUlang'), icon: <MapPin className="w-4 h-4" /> },
  ];

  const isActive = (href: string): boolean => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen pt-14">
      {/* Sidebar Navigation */}
      <nav
        data-testid="sampah-nav"
        className="w-full lg:w-48 flex-shrink-0 flex-col hidden lg:flex"
        style={{
          background: 'rgba(0,0,0,0.85)',
          borderRight: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div className="flex flex-col divide-y divide-white/5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all duration-150"
                style={{
                  color: active ? 'white' : 'rgba(255,255,255,0.35)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                  }
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Navigation */}
      <nav
        data-testid="sampah-nav"
        className="w-full lg:hidden flex-shrink-0 flex"
        style={{
          background: 'rgba(0,0,0,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
        }}
      >
        <div className="w-full flex overflow-x-auto divide-x divide-white/5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-all duration-150 whitespace-nowrap"
                style={{
                  color: active ? 'white' : 'rgba(255,255,255,0.35)',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                  }
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

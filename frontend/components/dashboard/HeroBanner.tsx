'use client';

import Link from 'next/link';
import type { HeroContent } from '@/types';

interface HeroBannerProps {
  heroes: HeroContent[];
}

export function HeroBanner({ heroes }: HeroBannerProps) {
  const activeHeroes = heroes
    .filter((h) => h.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeHeroes.length === 0) return null;

  const hero = activeHeroes[0];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-2 min-h-[180px] flex items-end">
      {/* Background image or gradient fallback */}
      {hero.imageBase64 ? (
        <img
          src={hero.imageBase64}
          alt={hero.imageAlt ?? hero.title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#154360] to-[#2E86C1]" />
      )}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-6 w-full">
        <p className="text-[#AED6F1] text-xs font-semibold uppercase tracking-widest mb-1">
          {hero.subtitle}
        </p>
        <h2 className="text-white text-xl font-bold leading-tight mb-1">
          {hero.title}
        </h2>
        {hero.description && (
          <p className="text-white/80 text-sm mt-1 mb-3 leading-relaxed max-w-xl">
            {hero.description}
          </p>
        )}
        {hero.ctaText && hero.ctaLink && (
          <Link
            href={hero.ctaLink}
            className="inline-block bg-white text-[#154360] text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#EAF4FB] transition-colors shadow"
          >
            {hero.ctaText}
          </Link>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  description?: string;
  imageBase64?: string;
  ctaText?: string;
  ctaLink?: string;
}

interface Props {
  slides: SlideItem[];
}

export function NewsSlider({ slides }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = slides.length;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, total]);

  if (!slides.length) return null;

  const slide = slides[current]!;

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F4F8FC] to-white">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <div className="text-center mb-6">
          <span className="text-xs font-semibold text-[#2E86C1] uppercase tracking-widest bg-[#EAF4FB] px-3 py-1 rounded-full">
            Info &amp; Berita Terkini
          </span>
        </div>

        {/* Slider card */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-lg border border-[#D6E8F5]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Content */}
          <div className="flex flex-col md:flex-row min-h-[220px] md:min-h-[200px]">
            {/* Image / color panel */}
            {slide.imageBase64 ? (
              <div className="md:w-2/5 shrink-0">
                <img
                  src={slide.imageBase64}
                  alt={slide.title}
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>
            ) : (
              <div className="md:w-2/5 shrink-0 bg-gradient-to-br from-[#2E86C1] to-[#154360] flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                      <path d="M3 16 L7 7 L12 19 L16 11 L21 20 L25 13 L29 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  </div>
                  <p className="text-xs text-[#AED6F1] font-medium">Tensi-Bot</p>
                </div>
              </div>
            )}

            {/* Text */}
            <div className="flex-1 bg-white p-6 md:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-[#2E86C1] mb-2 uppercase tracking-wide">{slide.subtitle}</p>
                <h3 className="text-xl md:text-2xl font-extrabold text-[#1A2A3A] leading-tight mb-3">{slide.title}</h3>
                {slide.description && (
                  <p className="text-sm text-[#5D8AA8] leading-relaxed line-clamp-3">{slide.description}</p>
                )}
              </div>
              {slide.ctaText && slide.ctaLink && (
                <a
                  href={slide.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[#2E86C1] hover:underline"
                >
                  {slide.ctaText}
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>

          {/* Prev / Next buttons */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center text-[#2E86C1] transition-all"
                aria-label="Sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center text-[#2E86C1] transition-all"
                aria-label="Berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Slide counter badge */}
          {total > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/30 text-white text-xs px-2 py-0.5 rounded-full">
              {current + 1} / {total}
            </div>
          )}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-[#2E86C1]' : 'w-2 bg-[#AED6F1]'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse } from '@/types';

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badgeText?: string;
  imageBase64?: string | null;
  imageAlt?: string | null;
  ctaText?: string | null;
  primaryButtonText?: string;
  colorFrom?: string;
  colorTo?: string;
  isActive: boolean;
  order: number;
}

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 32;

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: slides = [], isLoading } = useQuery<HeroSlide[]>({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<HeroSlide[]>>('/hero/active');
      return (res.data.data ?? []).sort((a, b) => a.order - b.order);
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
        return next;
      });
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  const goTo = (idx: number) => {
    setCurrent(idx);
    scrollRef.current?.scrollTo({ x: idx * CARD_W, animated: true });
  };

  if (isLoading) {
    return (
      <View style={styles.skeleton}>
        <ActivityIndicator color={Colors.primaryMid} size="small" />
      </View>
    );
  }

  if (slides.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
          setCurrent(idx);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setCurrent((prev) => {
              const next = (prev + 1) % slides.length;
              scrollRef.current?.scrollTo({ x: next * CARD_W, animated: true });
              return next;
            });
          }, 5000);
        }}
        style={{ width: CARD_W }}
      >
        {slides.map((slide) => {
          const bg = slide.colorFrom ?? Colors.primaryDark;
          const hasImage = !!slide.imageBase64;
          return (
            <View key={slide.id} style={[styles.slide, { width: CARD_W, backgroundColor: hasImage ? Colors.primaryDark : bg }]}>
              {hasImage ? (
                <>
                  <Image
                    source={{ uri: slide.imageBase64! }}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.slideOverlay} />
                  <View style={styles.slideTextOverImage}>
                    {slide.badgeText && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{slide.badgeText}</Text>
                      </View>
                    )}
                    <Text style={styles.title}>{slide.title}</Text>
                    {slide.subtitle && <Text style={styles.subtitle}>{slide.subtitle}</Text>}
                  </View>
                </>
              ) : (
                <>
                  {slide.badgeText && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{slide.badgeText}</Text>
                    </View>
                  )}
                  <Text style={styles.title}>{slide.title}</Text>
                  {slide.subtitle && <Text style={styles.subtitle}>{slide.subtitle}</Text>}
                  {slide.description && <Text style={styles.desc}>{slide.description}</Text>}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>

      {slides.length > 1 && (
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[styles.dot, i === current && styles.dotActive]} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 12 },
  skeleton: { height: 120, backgroundColor: Colors.primaryLight, borderRadius: 16, marginHorizontal: 16, marginBottom: 12, justifyContent: 'center', alignItems: 'center' },
  slide: { borderRadius: 16, overflow: 'hidden', minHeight: 120, justifyContent: 'center', padding: 18 },
  slideImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', borderRadius: 16 },
  slideOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 16 },
  slideTextOverImage: { zIndex: 1 },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  title: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  desc: { fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 17 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 18, backgroundColor: Colors.primary },
});

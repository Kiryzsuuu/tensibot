import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const FEATURES = [
  { icon: 'pulse' as const, title: 'Monitor Tekanan Darah', desc: 'Catat dan pantau riwayat tekanan darah harian Anda' },
  { icon: 'medical' as const, title: 'Jadwal Obat', desc: 'Pengingat minum obat agar tidak terlewat' },
  { icon: 'chatbubble-ellipses' as const, title: 'Asisten AI', desc: 'Konsultasi kesehatan hipertensi 24/7 dengan AI' },
  { icon: 'stats-chart' as const, title: 'Laporan Kesehatan', desc: 'Grafik dan statistik perkembangan kesehatan Anda' },
];

export default function LandingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoWrap}>
            <Ionicons name="heart-circle" size={52} color="#fff" />
          </View>
          <Text style={styles.appName}>Tensi-Bot</Text>
          <Text style={styles.tagline}>Teman Kendali Hipertensi Anda</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.primaryMid} />
            <Text style={styles.heroBadgeText}>Didukung teknologi AI Anthropic</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Semua yang Anda butuhkan</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <View key={f.title} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={22} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.btnPrimaryText}>Mulai Sekarang, Gratis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.btnSecondaryText}>Sudah punya akun? Masuk</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Tensi-Bot bukan pengganti dokter. Selalu konsultasikan kondisi Anda ke tenaga medis.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flexGrow: 1 },
  hero: { alignItems: 'center', paddingTop: 72, paddingBottom: 40, paddingHorizontal: 24 },
  logoWrap: { width: 88, height: 88, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 15, color: Colors.primaryMid, marginTop: 6, textAlign: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, color: Colors.primaryMid },
  featuresSection: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 8 },
  featuresTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 18, textAlign: 'center' },
  featuresGrid: { gap: 12 },
  featureCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: Colors.background, borderRadius: 16, padding: 14 },
  featureIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1 },
  featureDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2, flex: 1 },
  ctaSection: { backgroundColor: '#fff', padding: 24, paddingTop: 8, gap: 12 },
  btnPrimary: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnSecondary: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  btnSecondaryText: { color: Colors.text, fontWeight: '600', fontSize: 14 },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16, paddingBottom: 8 },
});

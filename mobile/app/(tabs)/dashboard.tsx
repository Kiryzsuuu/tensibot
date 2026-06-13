import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Colors, BPColors, BPLabels } from '@/constants/colors';
import type { ApiResponse, BPRecord, BPStats, MedicationWithStatus, PaginatedResponse } from '@/types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const firstName = user?.fullName?.split(' ')[0] ?? 'Pengguna';

  const { data: bpPaginated, isLoading: bpLoading, refetch: refetchBP } = useQuery({
    queryKey: ['bp-records', 1, 1],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<BPRecord>>>('/blood-pressure?page=1&limit=1');
      return res.data.data;
    },
  });

  const { data: bpStats, refetch: refetchStats } = useQuery({
    queryKey: ['bp-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BPStats>>('/blood-pressure/stats');
      return res.data.data;
    },
  });

  const { data: todayMeds = [], isLoading: medsLoading, refetch: refetchMeds } = useQuery<MedicationWithStatus[]>({
    queryKey: ['medications', 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ schedule: { medication: MedicationWithStatus; log: { status: string } | null }[] }>>('/medications/today');
      const data = res.data.data;
      if (!data || !Array.isArray(data.schedule)) return [];
      const map = new Map<string, MedicationWithStatus>();
      for (const item of data.schedule) {
        if (!map.has(item.medication.id)) map.set(item.medication.id, { ...item.medication, todayLogs: [] });
        if (item.log) {
          const entry = map.get(item.medication.id)!;
          entry.todayLogs.push(item.log as never);
        }
      }
      return Array.from(map.values());
    },
  });

  const lastRecord = bpPaginated?.items?.[0] ?? null;
  const takenMeds = todayMeds.filter((m) => m.todayLogs.some((l) => l.status === 'TAKEN')).length;
  const compliancePct = todayMeds.length > 0 ? Math.round((takenMeds / todayMeds.length) * 100) : 0;

  const onRefresh = () => {
    void refetchBP();
    void refetchStats();
    void refetchMeds();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{getGreeting()}, {firstName}!</Text>
        <Text style={styles.greetingSubtitle}>Berikut ringkasan kesehatan Anda hari ini</Text>
      </View>

      {/* BP Hero Card */}
      {bpLoading ? (
        <View style={[styles.card, styles.skeleton]} />
      ) : lastRecord ? (
        <View style={[styles.bpCard, { borderLeftColor: BPColors[lastRecord.category] }]}>
          <Text style={styles.bpCardLabel}>Tekanan Darah Terakhir</Text>
          <Text style={styles.bpValue}>{lastRecord.systolic}/{lastRecord.diastolic}</Text>
          <Text style={styles.bpUnit}>mmHg</Text>
          <View style={[styles.badge, { backgroundColor: BPColors[lastRecord.category] + '20' }]}>
            <Text style={[styles.badgeText, { color: BPColors[lastRecord.category] }]}>
              {BPLabels[lastRecord.category]}
            </Text>
          </View>
          {lastRecord.pulse && (
            <Text style={styles.bpPulse}>Nadi: {lastRecord.pulse} bpm</Text>
          )}
        </View>
      ) : (
        <View style={styles.bpCardEmpty}>
          <Text style={styles.bpCardEmptyTitle}>Tekanan Darah Terakhir</Text>
          <Text style={styles.bpCardEmptyText}>Belum ada data. Mulai catat sekarang!</Text>
          <TouchableOpacity style={styles.bpCardBtn} onPress={() => router.push('/(tabs)/monitoring')}>
            <Text style={styles.bpCardBtnText}>Catat Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {bpStats ? `${bpStats.avgSystolic}/${bpStats.avgDiastolic}` : '–'}
          </Text>
          <Text style={styles.statLabel}>Rata-rata 30 Hari</Text>
          <Text style={styles.statSub}>{bpStats?.totalRecords ?? 0} pengukuran</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: compliancePct >= 80 ? Colors.success : Colors.warning }]}>
            {compliancePct}%
          </Text>
          <Text style={styles.statLabel}>Kepatuhan Obat</Text>
          <Text style={styles.statSub}>{takenMeds}/{todayMeds.length} obat</Text>
        </View>
      </View>

      {/* Chat CTA */}
      <TouchableOpacity style={styles.chatCta} onPress={() => router.push('/(tabs)/chat')}>
        <Text style={styles.chatCtaIcon}>💬</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatCtaTitle}>Asisten Tensi-Bot</Text>
          <Text style={styles.chatCtaSub}>Tanya apa saja tentang hipertensi Anda</Text>
        </View>
        <Text style={styles.chatCtaArrow}>Mulai</Text>
      </TouchableOpacity>

      {/* Today meds */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Obat Hari Ini</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/obat')}>
            <Text style={styles.sectionLink}>Kelola</Text>
          </TouchableOpacity>
        </View>
        {medsLoading ? (
          <View style={[styles.skeleton, { height: 60, borderRadius: 12 }]} />
        ) : todayMeds.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada jadwal obat hari ini</Text>
        ) : (
          todayMeds.slice(0, 3).map((med) => {
            const taken = med.todayLogs.some((l) => l.status === 'TAKEN');
            return (
              <View key={med.id} style={styles.medItem}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage} · {med.times.join(', ')}</Text>
                <View style={[styles.medBadge, { backgroundColor: taken ? '#dcfce7' : '#fef9c3' }]}>
                  <Text style={[styles.medBadgeText, { color: taken ? Colors.success : '#a16207' }]}>
                    {taken ? 'Sudah diminum' : 'Belum diminum'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  greeting: { marginBottom: 16 },
  greetingText: { fontSize: 22, fontWeight: '800', color: Colors.text },
  greetingSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  skeleton: { backgroundColor: '#E8F4FD', marginBottom: 12, height: 130, borderRadius: 16 },
  bpCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, borderLeftWidth: 5, elevation: 2 },
  bpCardLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginBottom: 6 },
  bpValue: { fontSize: 48, fontWeight: '900', color: Colors.text, lineHeight: 52 },
  bpUnit: { fontSize: 13, color: Colors.textMuted, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  bpPulse: { fontSize: 12, color: Colors.textMuted },
  bpCardEmpty: { backgroundColor: Colors.primaryDark, borderRadius: 16, padding: 20, marginBottom: 12 },
  bpCardEmptyTitle: { fontSize: 13, color: Colors.primaryMid, fontWeight: '600', marginBottom: 6 },
  bpCardEmptyText: { fontSize: 15, color: '#fff', marginBottom: 14 },
  bpCardBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 20 },
  bpCardBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statSub: { fontSize: 11, color: Colors.primaryMid, marginTop: 4 },
  chatCta: { backgroundColor: Colors.primaryDark, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  chatCtaIcon: { fontSize: 28 },
  chatCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chatCtaSub: { color: Colors.primaryMid, fontSize: 11, marginTop: 2 },
  chatCtaArrow: { color: '#fff', fontWeight: '700', fontSize: 12, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  emptyText: { color: Colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  medItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  medName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  medDosage: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  medBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 5 },
  medBadgeText: { fontSize: 11, fontWeight: '600' },
});

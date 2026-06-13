import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        if (item.log) map.get(item.medication.id)!.todayLogs.push(item.log as never);
      }
      return Array.from(map.values());
    },
  });

  const lastRecord = bpPaginated?.items?.[0] ?? null;
  const takenMeds = todayMeds.filter((m) => m.todayLogs.some((l) => l.status === 'TAKEN')).length;
  const compliancePct = todayMeds.length > 0 ? Math.round((takenMeds / todayMeds.length) * 100) : 0;
  const isRefreshing = false;

  const onRefresh = () => { void refetchBP(); void refetchStats(); void refetchMeds(); };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.greetingName}>{firstName}!</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* BP Card */}
      {bpLoading ? (
        <View style={styles.skeleton} />
      ) : lastRecord ? (
        <View style={[styles.bpCard, { borderLeftColor: BPColors[lastRecord.category] }]}>
          <View style={styles.bpCardRow}>
            <View>
              <Text style={styles.bpCardLabel}>Tekanan Darah Terakhir</Text>
              <Text style={styles.bpValue}>{lastRecord.systolic}/{lastRecord.diastolic}</Text>
              <Text style={styles.bpUnit}>mmHg{lastRecord.pulse ? ` · Nadi ${lastRecord.pulse} bpm` : ''}</Text>
            </View>
            <View style={[styles.bpBadge, { backgroundColor: BPColors[lastRecord.category] + '15' }]}>
              <Text style={[styles.bpBadgeText, { color: BPColors[lastRecord.category] }]}>
                {BPLabels[lastRecord.category]}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bpCardAction} onPress={() => router.push('/(tabs)/monitoring')}>
            <Text style={styles.bpCardActionText}>Catat pengukuran baru</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bpCardEmpty}>
          <Ionicons name="heart-outline" size={32} color="rgba(255,255,255,0.7)" style={{ marginBottom: 8 }} />
          <Text style={styles.bpCardEmptyTitle}>Belum ada data tekanan darah</Text>
          <Text style={styles.bpCardEmptyText}>Mulai catat untuk memantau kesehatan Anda</Text>
          <TouchableOpacity style={styles.bpCardBtn} onPress={() => router.push('/(tabs)/monitoring')}>
            <Text style={styles.bpCardBtnText}>Catat Sekarang</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="stats-chart" size={18} color={Colors.primary} style={{ marginBottom: 6 }} />
          <Text style={styles.statValue}>{bpStats ? `${bpStats.avgSystolic}/${bpStats.avgDiastolic}` : '–'}</Text>
          <Text style={styles.statLabel}>Rata-rata 30 Hari</Text>
          <Text style={styles.statSub}>{bpStats?.totalRecords ?? 0} pengukuran</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="medical" size={18} color={compliancePct >= 80 ? Colors.success : Colors.warning} style={{ marginBottom: 6 }} />
          <Text style={[styles.statValue, { color: compliancePct >= 80 ? Colors.success : Colors.warning }]}>
            {compliancePct}%
          </Text>
          <Text style={styles.statLabel}>Kepatuhan Obat</Text>
          <Text style={styles.statSub}>{takenMeds}/{todayMeds.length} obat hari ini</Text>
        </View>
      </View>

      {/* Chat CTA */}
      <TouchableOpacity style={styles.chatCta} onPress={() => router.push('/(tabs)/chat')}>
        <View style={styles.chatCtaIcon}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.chatCtaTitle}>Asisten AI Tensi-Bot</Text>
          <Text style={styles.chatCtaSub}>Tanya apa saja tentang hipertensi Anda</Text>
        </View>
        <View style={styles.chatCtaBtn}>
          <Text style={styles.chatCtaBtnText}>Mulai</Text>
        </View>
      </TouchableOpacity>

      {/* Today meds */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Obat Hari Ini</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/obat')} style={styles.sectionLinkRow}>
            <Text style={styles.sectionLink}>Kelola</Text>
            <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {medsLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 16 }} />
        ) : todayMeds.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="medical-outline" size={28} color={Colors.border} />
            <Text style={styles.emptyText}>Belum ada jadwal obat hari ini</Text>
          </View>
        ) : (
          todayMeds.slice(0, 3).map((med) => {
            const taken = med.todayLogs.some((l) => l.status === 'TAKEN');
            return (
              <View key={med.id} style={styles.medItem}>
                <View style={[styles.medDot, { backgroundColor: taken ? Colors.success : Colors.warning }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage} · {med.times?.join(', ')}</Text>
                </View>
                <View style={[styles.medBadge, { backgroundColor: taken ? '#dcfce7' : '#fef9c3' }]}>
                  <Text style={[styles.medBadgeText, { color: taken ? Colors.success : '#a16207' }]}>
                    {taken ? 'Sudah' : 'Belum'}
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
  content: { paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 52, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 16 },
  greeting: { fontSize: 14, color: Colors.textMuted },
  greetingName: { fontSize: 24, fontWeight: '800', color: Colors.text },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  skeleton: { height: 130, backgroundColor: Colors.primaryLight, borderRadius: 16, marginHorizontal: 16, marginBottom: 12 },
  bpCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginHorizontal: 16, marginBottom: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  bpCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bpCardLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bpValue: { fontSize: 44, fontWeight: '900', color: Colors.text, lineHeight: 48 },
  bpUnit: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  bpBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  bpBadgeText: { fontSize: 12, fontWeight: '700' },
  bpCardAction: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, gap: 4 },
  bpCardActionText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  bpCardEmpty: { backgroundColor: Colors.primaryDark, borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 12, alignItems: 'center' },
  bpCardEmptyTitle: { fontSize: 15, color: '#fff', fontWeight: '700', textAlign: 'center' },
  bpCardEmptyText: { fontSize: 12, color: Colors.primaryMid, textAlign: 'center', marginTop: 4, marginBottom: 16 },
  bpCardBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  bpCardBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statSub: { fontSize: 10, color: Colors.primaryMid, marginTop: 3 },
  chatCta: { backgroundColor: Colors.primaryDark, borderRadius: 16, padding: 14, marginHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  chatCtaIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  chatCtaTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  chatCtaSub: { color: Colors.primaryMid, fontSize: 11, marginTop: 2 },
  chatCtaBtn: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  chatCtaBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  sectionLinkRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  medItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  medDot: { width: 8, height: 8, borderRadius: 4 },
  medName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  medDosage: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  medBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  medBadgeText: { fontSize: 11, fontWeight: '600' },
});

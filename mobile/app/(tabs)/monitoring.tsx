import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors, BPColors, BPLabels } from '@/constants/colors';
import type { ApiResponse, BPRecord, BPStats, PaginatedResponse } from '@/types';

function BPTrendChart({ records }: { records: BPRecord[] }) {
  const last14 = [...records].slice(0, 14).reverse();
  if (last14.length < 2) return null;

  const BAR_H = 72;
  const systolics = last14.map((r) => r.systolic);
  const maxVal = Math.max(...systolics, 160);
  const minVal = Math.min(...systolics, 100);
  const range = maxVal - minVal + 10;
  const step = Math.ceil(last14.length / 4);

  return (
    <View style={cs.chartCard}>
      <View style={cs.chartHeader}>
        <Text style={cs.chartTitle}>Tren Sistolik</Text>
        <Text style={cs.chartSub}>{last14.length} data terakhir</Text>
      </View>
      <View style={cs.chartArea}>
        <View style={cs.yAxisLabels}>
          <Text style={cs.yLabel}>{maxVal}</Text>
          <Text style={cs.yLabel}>{Math.round((maxVal + minVal) / 2)}</Text>
          <Text style={cs.yLabel}>{minVal}</Text>
        </View>
        <View style={cs.bars}>
          {last14.map((r, i) => {
            const h = Math.max(4, ((r.systolic - minVal + 5) / range) * BAR_H);
            const color = BPColors[r.category] ?? Colors.primary;
            return (
              <View key={r.id} style={cs.barCol}>
                <Text style={cs.barVal}>{r.systolic}</Text>
                <View style={[cs.bar, { height: h, backgroundColor: color }]} />
                <Text style={cs.barLabel} numberOfLines={1}>
                  {i % step === 0 ? `${new Date(r.measuredAt).getDate()}/${new Date(r.measuredAt).getMonth() + 1}` : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={cs.chartLegend}>
        {(Object.entries(BPColors) as [string, string][]).map(([cat, color]) => (
          <View key={cat} style={cs.legendItem}>
            <View style={[cs.legendDot, { backgroundColor: color }]} />
            <Text style={cs.legendText}>{BPLabels[cat]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StatsCards({ stats }: { stats: BPStats | undefined }) {
  if (!stats || stats.totalRecords === 0) return null;
  return (
    <View style={cs.statsRow}>
      <View style={cs.statCard}>
        <Text style={cs.statLabel}>Rata-rata</Text>
        <Text style={cs.statVal}>{stats.avgSystolic}/{stats.avgDiastolic}</Text>
        <Text style={cs.statUnit}>mmHg</Text>
      </View>
      <View style={cs.statCard}>
        <Text style={cs.statLabel}>Range Sistolik</Text>
        <Text style={cs.statVal}>{stats.minSystolic} – {stats.maxSystolic}</Text>
        <Text style={cs.statUnit}>mmHg</Text>
      </View>
      <View style={cs.statCard}>
        <Text style={cs.statLabel}>Total Data</Text>
        <Text style={cs.statVal}>{stats.totalRecords}</Text>
        <Text style={cs.statUnit}>30 hari</Text>
      </View>
    </View>
  );
}

export default function MonitoringScreen() {
  const qc = useQueryClient();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [view, setView] = useState<'form' | 'history'>('form');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bp-records', 1, 30],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<BPRecord>>>('/blood-pressure?page=1&limit=30');
      return res.data.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['bp-stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<BPStats>>('/blood-pressure/stats');
      return res.data.data;
    },
  });

  const { mutate: createRecord, isPending } = useMutation({
    mutationFn: async () => {
      const sys = parseInt(systolic);
      const dia = parseInt(diastolic);
      if (!sys || !dia) throw new Error('Sistolik dan diastolik wajib diisi');
      if (sys < 60 || sys > 300) throw new Error('Sistolik harus antara 60–300');
      if (dia < 40 || dia > 200) throw new Error('Diastolik harus antara 40–200');
      if (sys <= dia) throw new Error('Sistolik harus lebih besar dari diastolik');
      const res = await api.post<ApiResponse<{ record: BPRecord; categoryInfo: { isCrisis: boolean } }>>('/blood-pressure', {
        systolic: sys, diastolic: dia,
        pulse: pulse ? parseInt(pulse) : undefined,
        notes: notes || undefined,
        measuredAt: new Date().toISOString(),
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: ['bp-records'] });
      void qc.invalidateQueries({ queryKey: ['bp-stats'] });
      setSystolic(''); setDiastolic(''); setPulse(''); setNotes('');
      if (data?.categoryInfo?.isCrisis) {
        Alert.alert('PERINGATAN KRISIS', 'Tekanan darah Anda sangat berbahaya! Segera ke IGD/UGD terdekat atau hubungi 119!', [{ text: 'Mengerti' }]);
      } else {
        Alert.alert('Berhasil', 'Data tekanan darah tersimpan');
      }
      setView('history');
    },
    onError: (err: unknown) => {
      const msg = (err instanceof Error) ? err.message :
        ((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Gagal menyimpan');
      Alert.alert('Error', msg);
    },
  });

  const records = data?.items ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monitoring Tensi</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, view === 'form' && styles.tabActive]} onPress={() => setView('form')}>
            <Ionicons name="add-circle-outline" size={14} color={view === 'form' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.tabText, view === 'form' && styles.tabTextActive]}>Catat Baru</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, view === 'history' && styles.tabActive]} onPress={() => setView('history')}>
            <Ionicons name="pulse-outline" size={14} color={view === 'history' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.tabText, view === 'history' && styles.tabTextActive]}>Riwayat & Tren</Text>
          </TouchableOpacity>
        </View>
      </View>

      {view === 'form' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Catat Tekanan Darah</Text>
            <Text style={styles.cardHint}>Pastikan Anda sudah istirahat 5 menit sebelum mengukur</Text>
            <View style={styles.bpInputRow}>
              <View style={styles.bpInputBox}>
                <Text style={styles.bpInputLabel}>SISTOLIK</Text>
                <TextInput style={styles.bpInput} placeholder="120" placeholderTextColor={Colors.border} keyboardType="numeric" value={systolic} onChangeText={setSystolic} maxLength={3} />
                <Text style={styles.bpInputUnit}>mmHg</Text>
              </View>
              <Text style={styles.bpDividerText}>/</Text>
              <View style={styles.bpInputBox}>
                <Text style={styles.bpInputLabel}>DIASTOLIK</Text>
                <TextInput style={styles.bpInput} placeholder="80" placeholderTextColor={Colors.border} keyboardType="numeric" value={diastolic} onChangeText={setDiastolic} maxLength={3} />
                <Text style={styles.bpInputUnit}>mmHg</Text>
              </View>
            </View>
            <View style={styles.bpReferenceRow}>
              {[['Normal', 'sistolik < 120', Colors.success], ['Elevasi', '120–129', Colors.warning], ['Hipertensi', '>= 130', Colors.danger]] .map(([label, range, color]) => (
                <View key={label} style={styles.bpRef}>
                  <View style={[styles.bpRefDot, { backgroundColor: color as string }]} />
                  <Text style={styles.bpRefLabel}>{label}</Text>
                  <Text style={styles.bpRefRange}>{range}</Text>
                </View>
              ))}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Nadi (bpm)</Text>
              <TextInput style={styles.input} placeholder="72 (opsional)" placeholderTextColor={Colors.primaryMid} keyboardType="numeric" value={pulse} onChangeText={setPulse} maxLength={3} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Catatan</Text>
              <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Kondisi saat pengukuran... (opsional)" placeholderTextColor={Colors.primaryMid} multiline value={notes} onChangeText={setNotes} />
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => createRecord()} disabled={isPending}>
              {isPending ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={styles.btnText}>Simpan Data</Text></>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} tintColor={Colors.primary} />}>
          <StatsCards stats={stats} />
          <BPTrendChart records={records} />
          {records.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="pulse-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
              <Text style={styles.emptyText}>Mulai catat tekanan darah Anda</Text>
            </View>
          ) : (
            <>
              <Text style={styles.historyHeading}>Riwayat Pengukuran</Text>
              {records.map((r) => (
                <View key={r.id} style={[styles.recordCard, { borderLeftColor: BPColors[r.category] }]}>
                  <View style={styles.recordTop}>
                    <View>
                      <Text style={styles.recordValue}>{r.systolic}/{r.diastolic} <Text style={styles.recordUnit}>mmHg</Text></Text>
                      <Text style={styles.recordMeta}>{r.pulse ? `Nadi ${r.pulse} bpm · ` : ''}{new Date(r.measuredAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: (BPColors[r.category] ?? Colors.primary) + '18' }]}>
                      <Text style={[styles.badgeText, { color: BPColors[r.category] ?? Colors.primary }]}>{BPLabels[r.category]}</Text>
                    </View>
                  </View>
                  {r.notes && <Text style={styles.recordNotes}>{r.notes}</Text>}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardHint: { fontSize: 12, color: Colors.textMuted, marginBottom: 20 },
  bpInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 12 },
  bpInputBox: { flex: 1, alignItems: 'center' },
  bpInputLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  bpInput: { fontSize: 36, fontWeight: '900', color: Colors.text, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 4, width: '100%' },
  bpInputUnit: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  bpDividerText: { fontSize: 36, fontWeight: '300', color: Colors.border, paddingTop: 10 },
  bpReferenceRow: { flexDirection: 'row', gap: 8, marginBottom: 16, backgroundColor: Colors.background, borderRadius: 10, padding: 10 },
  bpRef: { flex: 1, alignItems: 'center', gap: 3 },
  bpRefDot: { width: 8, height: 8, borderRadius: 4 },
  bpRefLabel: { fontSize: 11, fontWeight: '700', color: Colors.text },
  bpRefRange: { fontSize: 10, color: Colors.textMuted },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  historyHeading: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 10, marginTop: 4 },
  recordCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 1 },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  recordUnit: { fontSize: 14, fontWeight: '400', color: Colors.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  recordMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  recordNotes: { fontSize: 12, color: Colors.textMuted, marginTop: 8, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
});

const cs = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, alignItems: 'center', elevation: 1 },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textAlign: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: Colors.primary, marginTop: 3 },
  statUnit: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  chartCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chartSub: { fontSize: 11, color: Colors.textMuted },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: 90 },
  yAxisLabels: { justifyContent: 'space-between', height: 72, marginRight: 6, alignItems: 'flex-end' },
  yLabel: { fontSize: 9, color: Colors.textMuted },
  bars: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 3, minHeight: 4 },
  barVal: { fontSize: 8, color: Colors.textMuted, marginBottom: 2 },
  barLabel: { fontSize: 8, color: Colors.textMuted, marginTop: 3, width: '100%', textAlign: 'center' },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textMuted },
});

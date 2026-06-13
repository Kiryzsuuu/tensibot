import { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors, BPColors, BPLabels } from '@/constants/colors';
import type { ApiResponse, BPRecord, PaginatedResponse } from '@/types';

export default function MonitoringScreen() {
  const qc = useQueryClient();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [notes, setNotes] = useState('');
  const [view, setView] = useState<'form' | 'history'>('form');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bp-records', 1, 20],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaginatedResponse<BPRecord>>>('/blood-pressure?page=1&limit=20');
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
            <Ionicons name="time-outline" size={14} color={view === 'history' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.tabText, view === 'history' && styles.tabTextActive]}>Riwayat</Text>
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
          {records.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="pulse-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Belum ada riwayat</Text>
              <Text style={styles.emptyText}>Mulai catat tekanan darah Anda</Text>
            </View>
          ) : (
            records.map((r) => (
              <View key={r.id} style={[styles.recordCard, { borderLeftColor: BPColors[r.category] }]}>
                <View style={styles.recordTop}>
                  <View>
                    <Text style={styles.recordValue}>{r.systolic}/{r.diastolic} <Text style={styles.recordUnit}>mmHg</Text></Text>
                    <Text style={styles.recordMeta}>{r.pulse ? `Nadi ${r.pulse} bpm · ` : ''}{new Date(r.measuredAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: BPColors[r.category] + '18' }]}>
                    <Text style={[styles.badgeText, { color: BPColors[r.category] }]}>{BPLabels[r.category]}</Text>
                  </View>
                </View>
                {r.notes && <Text style={styles.recordNotes}>{r.notes}</Text>}
              </View>
            ))
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
  bpInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 12 },
  bpInputBox: { flex: 1, alignItems: 'center' },
  bpInputLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, marginBottom: 6 },
  bpInput: { fontSize: 36, fontWeight: '900', color: Colors.text, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: Colors.primary, paddingBottom: 4, width: '100%' },
  bpInputUnit: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },
  bpDividerText: { fontSize: 36, fontWeight: '300', color: Colors.border, paddingTop: 10 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted },
  recordCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 1 },
  recordTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordValue: { fontSize: 24, fontWeight: '800', color: Colors.text },
  recordUnit: { fontSize: 14, fontWeight: '400', color: Colors.textMuted },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  recordMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  recordNotes: { fontSize: 12, color: Colors.textMuted, marginTop: 8, fontStyle: 'italic', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
});

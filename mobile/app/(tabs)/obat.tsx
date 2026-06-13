import { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, Modal, TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, Medication, MedicationWithStatus } from '@/types';

export default function ObatScreen() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'today' | 'manage'>('today');
  const [showAddModal, setShowAddModal] = useState(false);

  // Today schedule
  const { data: todayData, isLoading: todayLoading, refetch: refetchToday } = useQuery({
    queryKey: ['medications', 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ schedule: { medication: MedicationWithStatus; log: { id: string; status: string } | null; scheduledTime: string }[] }>>('/medications/today');
      return res.data.data?.schedule ?? [];
    },
  });

  // All medications
  const { data: allMeds = [], isLoading: medsLoading, refetch: refetchMeds } = useQuery<Medication[]>({
    queryKey: ['medications', 'all'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Medication[]>>('/medications');
      return res.data.data ?? [];
    },
  });

  const { mutate: logMed, isPending: logging } = useMutation({
    mutationFn: async ({ logId, medicationId, scheduledTime, status }: { logId?: string; medicationId: string; scheduledTime: string; status: string }) => {
      if (logId) {
        await api.patch(`/medications/logs/${logId}`, { status });
      } else {
        await api.post('/medications/logs', { medicationId, scheduledTime, status });
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['medications', 'today'] }),
    onError: () => Alert.alert('Error', 'Gagal memperbarui status obat'),
  });

  const { mutate: deleteMed } = useMutation({
    mutationFn: (id: string) => api.delete(`/medications/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['medications', 'all'] }),
    onError: () => Alert.alert('Error', 'Gagal menghapus obat'),
  });

  const schedule = todayData ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Obat</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'today' && styles.tabActive]} onPress={() => setTab('today')}>
            <Text style={[styles.tabText, tab === 'today' && styles.tabTextActive]}>Hari Ini</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'manage' && styles.tabActive]} onPress={() => setTab('manage')}>
            <Text style={[styles.tabText, tab === 'manage' && styles.tabTextActive]}>Kelola</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'today' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={todayLoading} onRefresh={() => void refetchToday()} tintColor={Colors.primary} />}
        >
          {schedule.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>💊</Text>
              <Text style={styles.emptyTitle}>Tidak ada jadwal hari ini</Text>
              <Text style={styles.emptyText}>Tambah obat di tab Kelola terlebih dahulu.</Text>
            </View>
          ) : (
            schedule.map((item) => {
              const taken = item.log?.status === 'TAKEN';
              const skipped = item.log?.status === 'SKIPPED';
              return (
                <View key={`${item.medication.id}-${item.scheduledTime}`} style={styles.schedCard}>
                  <View style={styles.schedInfo}>
                    <Text style={styles.schedName}>{item.medication.name}</Text>
                    <Text style={styles.schedDosage}>{item.medication.dosage} · {item.scheduledTime}</Text>
                    {item.medication.instructions && (
                      <Text style={styles.schedInstructions}>{item.medication.instructions}</Text>
                    )}
                  </View>
                  <View style={styles.schedActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, taken && styles.actionBtnActive]}
                      onPress={() => logMed({ logId: item.log?.id, medicationId: item.medication.id, scheduledTime: item.scheduledTime, status: taken ? 'PENDING' : 'TAKEN' })}
                      disabled={logging}
                    >
                      <Text style={[styles.actionBtnText, taken && styles.actionBtnTextActive]}>
                        {taken ? 'Sudah' : 'Minum'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, skipped && styles.skipBtnActive]}
                      onPress={() => logMed({ logId: item.log?.id, medicationId: item.medication.id, scheduledTime: item.scheduledTime, status: skipped ? 'PENDING' : 'SKIPPED' })}
                      disabled={logging}
                    >
                      <Text style={[styles.actionBtnText, skipped && styles.skipBtnTextActive]}>
                        {skipped ? 'Dilewati' : 'Lewati'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={medsLoading} onRefresh={() => void refetchMeds()} tintColor={Colors.primary} />}
        >
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addBtnText}>+ Tambah Obat Baru</Text>
          </TouchableOpacity>

          {allMeds.length === 0 ? (
            <Text style={styles.emptyCenter}>Belum ada obat terdaftar</Text>
          ) : (
            allMeds.map((med) => (
              <View key={med.id} style={styles.medCard}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  {med.times && med.times.length > 0 && (
                    <Text style={styles.medTimes}>Jadwal: {med.times.join(', ')}</Text>
                  )}
                  {med.instructions && (
                    <Text style={styles.medInstructions}>{med.instructions}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    Alert.alert('Hapus Obat', `Hapus ${med.name}?`, [
                      { text: 'Batal', style: 'cancel' },
                      { text: 'Hapus', style: 'destructive', onPress: () => deleteMed(med.id) },
                    ])
                  }
                >
                  <Text style={styles.deleteBtnText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <AddMedModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          void qc.invalidateQueries({ queryKey: ['medications'] });
        }}
      />
    </View>
  );
}

function AddMedModal({ visible, onClose, onSuccess }: { visible: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Perhatian', 'Nama dan dosis wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const timesArr = times.split(',').map((t) => t.trim()).filter(Boolean);
      await api.post('/medications', {
        name: name.trim(),
        dosage: dosage.trim(),
        times: timesArr,
        instructions: instructions.trim() || undefined,
      });
      setName(''); setDosage(''); setTimes(''); setInstructions('');
      onSuccess();
    } catch {
      Alert.alert('Error', 'Gagal menambahkan obat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <Text style={modalStyles.title}>Tambah Obat Baru</Text>
          {[
            { label: 'Nama Obat *', value: name, set: setName, placeholder: 'Contoh: Amlodipine' },
            { label: 'Dosis *', value: dosage, set: setDosage, placeholder: 'Contoh: 5mg' },
            { label: 'Waktu minum (pisah koma)', value: times, set: setTimes, placeholder: 'Contoh: 07:00, 19:00' },
            { label: 'Instruksi', value: instructions, set: setInstructions, placeholder: 'Setelah makan (opsional)' },
          ].map((f) => (
            <View key={f.label} style={modalStyles.field}>
              <Text style={modalStyles.label}>{f.label}</Text>
              <TextInput
                style={modalStyles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.primaryMid}
                value={f.value}
                onChangeText={f.set}
              />
            </View>
          ))}
          <TouchableOpacity style={modalStyles.btn} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.btnText}>Simpan Obat</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={modalStyles.cancelBtnText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  content: { padding: 16, paddingBottom: 32 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginTop: 6 },
  emptyCenter: { textAlign: 'center', color: Colors.textMuted, fontSize: 13, marginTop: 24 },
  schedCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 12, elevation: 1 },
  schedInfo: { flex: 1 },
  schedName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  schedDosage: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  schedInstructions: { fontSize: 11, color: Colors.primaryMid, marginTop: 3, fontStyle: 'italic' },
  schedActions: { gap: 6 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  actionBtnActive: { backgroundColor: '#dcfce7', borderColor: Colors.success },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  actionBtnTextActive: { color: Colors.success },
  skipBtnActive: { backgroundColor: '#fef9c3', borderColor: '#a16207' },
  skipBtnTextActive: { color: '#a16207' },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  medCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1 },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  medDosage: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  medTimes: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  medInstructions: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#fee2e2' },
  deleteBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 12 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  cancelBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});

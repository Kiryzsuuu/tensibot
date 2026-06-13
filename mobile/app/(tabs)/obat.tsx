import { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, RefreshControl, Modal, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, Medication, MedicationWithStatus } from '@/types';

export default function ObatScreen() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'today' | 'manage'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [onTimeSelected, setOnTimeSelected] = useState<((t: string) => void) | null>(null);

  const openTimePicker = (callback: (t: string) => void) => {
    setPickerDate(new Date());
    setOnTimeSelected(() => callback);
    setShowTimePicker(true);
  };

  const { data: todayData, isLoading: todayLoading, refetch: refetchToday } = useQuery({
    queryKey: ['medications', 'today'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ schedule: { medication: MedicationWithStatus; log: { id: string; status: string } | null; scheduledTime: string }[] }>>('/medications/today');
      return res.data.data?.schedule ?? [];
    },
  });

  const { data: allMeds = [], isLoading: medsLoading, refetch: refetchMeds } = useQuery<Medication[]>({
    queryKey: ['medications', 'all'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Medication[]>>('/medications');
      return res.data.data ?? [];
    },
  });

  const { mutate: logMed, isPending: logging } = useMutation({
    mutationFn: async ({ medicationId, scheduledTime, status }: { logId?: string; medicationId: string; scheduledTime: string; status: string }) => {
      await api.post(`/medications/${medicationId}/log`, {
        scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : new Date().toISOString(),
        status,
      });
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
  const takenCount = schedule.filter((s) => s.log?.status === 'TAKEN').length;
  const totalCount = schedule.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Obat</Text>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tab === 'today' && styles.tabActive]} onPress={() => setTab('today')}>
            <Ionicons name="today-outline" size={14} color={tab === 'today' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.tabText, tab === 'today' && styles.tabTextActive]}>Hari Ini</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === 'manage' && styles.tabActive]} onPress={() => setTab('manage')}>
            <Ionicons name="list-outline" size={14} color={tab === 'manage' ? '#fff' : Colors.textMuted} />
            <Text style={[styles.tabText, tab === 'manage' && styles.tabTextActive]}>Kelola</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'today' ? (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={todayLoading} onRefresh={() => void refetchToday()} tintColor={Colors.primary} />}>
          {totalCount > 0 && (
            <View style={styles.complianceCard}>
              <View style={styles.complianceInfo}>
                <Text style={styles.complianceTitle}>Kepatuhan Hari Ini</Text>
                <Text style={styles.complianceValue}>{takenCount}/{totalCount} obat diminum</Text>
              </View>
              <View style={styles.complianceProgress}>
                <View style={[styles.complianceBar, { width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%` as `${number}%` }]} />
              </View>
            </View>
          )}
          {schedule.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="medical-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Tidak ada jadwal hari ini</Text>
              <Text style={styles.emptyText}>Tambah obat di tab Kelola terlebih dahulu.</Text>
            </View>
          ) : (
            schedule.map((item) => {
              const taken = item.log?.status === 'TAKEN';
              const skipped = item.log?.status === 'SKIPPED';
              return (
                <View key={`${item.medication.id}-${item.scheduledTime}`} style={[styles.schedCard, taken && styles.schedCardTaken]}>
                  <View style={styles.schedLeft}>
                    <View style={[styles.schedDot, { backgroundColor: taken ? Colors.success : skipped ? Colors.warning : Colors.border }]} />
                  </View>
                  <View style={styles.schedInfo}>
                    <Text style={styles.schedName}>{item.medication.name}</Text>
                    <Text style={styles.schedDosage}>{item.medication.dosage} · {item.scheduledTime}</Text>
                    {item.medication.instructions && <Text style={styles.schedInstructions}>{item.medication.instructions}</Text>}
                  </View>
                  <View style={styles.schedActions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, taken && styles.actionBtnTaken]}
                      onPress={() => logMed({ logId: item.log?.id, medicationId: item.medication.id, scheduledTime: item.scheduledTime, status: taken ? 'PENDING' : 'TAKEN' })}
                      disabled={logging}
                    >
                      <Ionicons name={taken ? 'checkmark-circle' : 'checkmark-circle-outline'} size={16} color={taken ? Colors.success : Colors.textMuted} />
                      <Text style={[styles.actionBtnText, taken && { color: Colors.success }]}>{taken ? 'Sudah' : 'Minum'}</Text>
                    </TouchableOpacity>
                    {!taken && (
                      <TouchableOpacity
                        style={[styles.actionBtn, skipped && styles.actionBtnSkipped]}
                        onPress={() => logMed({ logId: item.log?.id, medicationId: item.medication.id, scheduledTime: item.scheduledTime, status: skipped ? 'PENDING' : 'SKIPPED' })}
                        disabled={logging}
                      >
                        <Ionicons name="close-circle-outline" size={16} color={skipped ? Colors.warning : Colors.textMuted} />
                        <Text style={[styles.actionBtnText, skipped && { color: Colors.warning }]}>{skipped ? 'Lewati' : 'Lewati'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={medsLoading} onRefresh={() => void refetchMeds()} tintColor={Colors.primary} />}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Tambah Obat Baru</Text>
          </TouchableOpacity>
          {allMeds.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="medical-outline" size={48} color={Colors.border} />
              <Text style={styles.emptyTitle}>Belum ada obat terdaftar</Text>
            </View>
          ) : (
            allMeds.map((med) => (
              <View key={med.id} style={styles.medCard}>
                <View style={styles.medIconBox}>
                  <Ionicons name="medical" size={20} color={Colors.primary} />
                </View>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                  {med.times && med.times.length > 0 && <Text style={styles.medTimes}>{med.times.join(' · ')}</Text>}
                  {med.instructions && <Text style={styles.medInstructions}>{med.instructions}</Text>}
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => Alert.alert('Hapus Obat', `Hapus ${med.name}?`, [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => deleteMed(med.id) }])}
                >
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <AddMedModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => { setShowAddModal(false); void qc.invalidateQueries({ queryKey: ['medications'] }); }}
        openTimePicker={openTimePicker}
      />

      {showTimePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour
          display={Platform.OS === 'android' ? 'clock' : 'spinner'}
          onValueChange={(_event, date) => {
            setShowTimePicker(Platform.OS === 'ios');
            if (date && onTimeSelected) {
              const hh = String(date.getHours()).padStart(2, '0');
              const mm = String(date.getMinutes()).padStart(2, '0');
              onTimeSelected(`${hh}:${mm}`);
            }
          }}
          onDismiss={() => setShowTimePicker(false)}
        />
      )}
    </View>
  );
}

function AddMedModal({ visible, onClose, onSuccess, openTimePicker }: { visible: boolean; onClose: () => void; onSuccess: () => void; openTimePicker: (cb: (t: string) => void) => void }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const addTime = (t: string) => {
    setTimes((prev) => prev.includes(t) ? prev : [...prev, t].sort());
  };

  const removeTime = (t: string) => setTimes((prev) => prev.filter((x) => x !== t));

  const reset = () => { setName(''); setDosage(''); setTimes([]); setInstructions(''); };

  const onSubmit = async () => {
    if (!name.trim() || !dosage.trim()) { Alert.alert('Perhatian', 'Nama dan dosis wajib diisi'); return; }
    setLoading(true);
    try {
      const timesArr = times.length > 0 ? times : ['08:00'];
      await api.post('/medications', {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: `${timesArr.length}x sehari`,
        times: timesArr,
        startDate: new Date().toISOString(),
        notes: instructions.trim() || undefined,
      });
      reset();
      onSuccess();
    } catch { Alert.alert('Error', 'Gagal menambahkan obat'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={modalStyles.overlay}>
          <View style={modalStyles.sheet}>
            <View style={modalStyles.handle} />
            <Text style={modalStyles.title}>Tambah Obat Baru</Text>

            {/* Nama */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Nama Obat *</Text>
              <TextInput style={modalStyles.input} placeholder="Contoh: Amlodipine" placeholderTextColor={Colors.primaryMid} value={name} onChangeText={setName} />
            </View>

            {/* Dosis */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Dosis *</Text>
              <TextInput style={modalStyles.input} placeholder="Contoh: 5mg" placeholderTextColor={Colors.primaryMid} value={dosage} onChangeText={setDosage} />
            </View>

            {/* Waktu minum — time picker chips */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Waktu Minum</Text>
              <View style={modalStyles.chipsRow}>
                {times.map((t) => (
                  <View key={t} style={modalStyles.chip}>
                    <Ionicons name="time-outline" size={13} color={Colors.primary} />
                    <Text style={modalStyles.chipText}>{t}</Text>
                    <TouchableOpacity onPress={() => removeTime(t)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Ionicons name="close-circle" size={15} color={Colors.primaryMid} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={modalStyles.addTimeBtn} onPress={() => openTimePicker(addTime)}>
                  <Ionicons name="add" size={15} color={Colors.primary} />
                  <Text style={modalStyles.addTimeBtnText}>Tambah Jam</Text>
                </TouchableOpacity>
              </View>
              {times.length === 0 && (
                <Text style={modalStyles.hint}>Default 08:00 jika tidak diisi</Text>
              )}
            </View>

            {/* Instruksi */}
            <View style={modalStyles.field}>
              <Text style={modalStyles.label}>Instruksi</Text>
              <TextInput style={modalStyles.input} placeholder="Setelah makan (opsional)" placeholderTextColor={Colors.primaryMid} value={instructions} onChangeText={setInstructions} />
            </View>

            <TouchableOpacity style={modalStyles.btn} onPress={onSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.btnText}>Simpan Obat</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={() => { reset(); onClose(); }}>
              <Text style={modalStyles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
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
  complianceCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  complianceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  complianceTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  complianceValue: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  complianceProgress: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  complianceBar: { height: 6, backgroundColor: Colors.success, borderRadius: 3 },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  schedCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 1 },
  schedCardTaken: { opacity: 0.7 },
  schedLeft: { alignItems: 'center' },
  schedDot: { width: 10, height: 10, borderRadius: 5 },
  schedInfo: { flex: 1 },
  schedName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  schedDosage: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  schedInstructions: { fontSize: 11, color: Colors.primaryMid, marginTop: 3, fontStyle: 'italic' },
  schedActions: { gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border },
  actionBtnTaken: { borderColor: Colors.success, backgroundColor: '#dcfce7' },
  actionBtnSkipped: { borderColor: Colors.warning, backgroundColor: '#fef9c3' },
  actionBtnText: { fontSize: 11, fontWeight: '600', color: Colors.textMuted },
  addBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  medCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, elevation: 1 },
  medIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  medDosage: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  medTimes: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  medInstructions: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  deleteBtn: { padding: 8 },
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, borderWidth: 1.5, borderColor: Colors.primaryMid, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  addTimeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  addTimeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  hint: { fontSize: 11, color: Colors.textMuted, marginTop: 5, fontStyle: 'italic' },
});

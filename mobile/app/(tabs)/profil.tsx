import { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, UserProfile } from '@/types';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading, refetch } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserProfile>>('/users/profile');
      return res.data.data!;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.fullName ?? user?.fullName ?? '');
    setPhoneNumber(profile.phoneNumber ?? '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    const dob = profile.dateOfBirth as unknown;
    let parsedDate: Date | null = null;
    if (!dob) {
      setDateOfBirth('');
    } else if (typeof dob === 'object' && dob !== null && ('_seconds' in dob || 'seconds' in dob)) {
      const secs = (dob as Record<string, number>)['_seconds'] ?? (dob as Record<string, number>)['seconds'];
      parsedDate = new Date(secs * 1000);
    } else {
      const d = new Date(dob as string);
      if (!isNaN(d.getTime())) parsedDate = d;
    }
    if (parsedDate) {
      setDobDate(parsedDate);
      setDateOfBirth(parsedDate.toISOString().split('T')[0] ?? '');
    }
  }, [profile]);

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      if (fullName.trim()) payload['fullName'] = fullName.trim();
      if (phoneNumber.trim()) payload['phoneNumber'] = phoneNumber.trim();
      if (dateOfBirth.trim()) payload['dateOfBirth'] = dateOfBirth.trim();
      const w = parseFloat(weightKg);
      const h = parseFloat(heightCm);
      if (!isNaN(w) && w > 0) payload['weightKg'] = w;
      if (!isNaN(h) && h > 0) payload['heightCm'] = h;
      await api.patch('/users/profile', payload);
    },
    onSuccess: () => {
      setEditing(false);
      void qc.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Berhasil', 'Profil berhasil disimpan');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Gagal menyimpan profil';
      Alert.alert('Error', msg);
    },
  });

  const onLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: async () => { await clearAuth(); router.replace('/'); } },
    ]);
  };

  const displayName = profile?.fullName ?? user?.fullName ?? 'Pengguna';
  const initial = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => setEditing((v) => !v)} style={[styles.editBtn, editing && styles.editBtnActive]}>
          <Ionicons name={editing ? 'close' : 'pencil-outline'} size={15} color={editing ? Colors.textMuted : Colors.primary} />
          <Text style={[styles.editBtnText, editing && styles.editBtnTextActive]}>{editing ? 'Batal' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{initial}</Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{user?.email ?? '–'}</Text>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark-outline" size={11} color={Colors.primary} />
          <Text style={styles.roleBadgeText}>{user?.role ?? 'USER'}</Text>
        </View>
      </View>

      {/* Info Pribadi */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Pribadi</Text>
        {[
          { label: 'Nama Lengkap', value: fullName, set: setFullName, icon: 'person-outline' as const },
          { label: 'No. Telepon', value: phoneNumber, set: setPhoneNumber, icon: 'call-outline' as const },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            {editing ? (
              <View style={styles.inputRow}>
                <Ionicons name={f.icon} size={16} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput style={styles.input} value={f.value} onChangeText={f.set} placeholderTextColor={Colors.primaryMid} placeholder={f.label} />
              </View>
            ) : (
              <View style={styles.valueRow}>
                <Ionicons name={f.icon} size={15} color={Colors.textMuted} />
                <Text style={styles.value}>{f.value || '–'}</Text>
              </View>
            )}
          </View>
        ))}

        {/* Tanggal Lahir — native date picker */}
        <View style={styles.field}>
          <Text style={styles.label}>Tanggal Lahir</Text>
          {editing ? (
            <>
              <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                <Text style={[styles.datePickerText, !dateOfBirth && styles.datePickerPlaceholder]}>
                  {dateOfBirth
                    ? new Date(dateOfBirth + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Pilih tanggal lahir'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dobDate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={(event: DateTimePickerEvent, selected?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (event.type === 'set' && selected) {
                      setDobDate(selected);
                      setDateOfBirth(selected.toISOString().split('T')[0] ?? '');
                    }
                  }}
                />
              )}
            </>
          ) : (
            <View style={styles.valueRow}>
              <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
              <Text style={styles.value}>
                {dateOfBirth
                  ? new Date(dateOfBirth + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '–'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Berat (kg)</Text>
            {editing ? (
              <TextInput style={styles.input} value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="70" placeholderTextColor={Colors.primaryMid} />
            ) : (
              <Text style={styles.value}>{weightKg ? `${weightKg} kg` : '–'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tinggi (cm)</Text>
            {editing ? (
              <TextInput style={styles.input} value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" placeholder="170" placeholderTextColor={Colors.primaryMid} />
            ) : (
              <Text style={styles.value}>{heightCm ? `${heightCm} cm` : '–'}</Text>
            )}
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={() => saveProfile()} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={18} color="#fff" /><Text style={styles.saveBtnText}>Simpan Perubahan</Text></>}
          </TouchableOpacity>
        )}
      </View>

      {/* Kondisi */}
      {profile?.diagnoses && profile.diagnoses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kondisi Kesehatan</Text>
          {profile.diagnoses.map((d, i) => (
            <View key={i} style={styles.diagnosisItem}>
              <Ionicons name="medkit-outline" size={14} color={Colors.primary} />
              <Text style={styles.diagnosisText}>{d}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Menu */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Akun</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={18} color={Colors.text} />
          <Text style={styles.menuText}>Pengaturan Notifikasi</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.border} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.text} />
          <Text style={styles.menuText}>Ubah Password</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.border} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={18} color="#dc2626" />
        <Text style={styles.logoutBtnText}>Keluar dari Aplikasi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 52, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary },
  editBtnActive: { borderColor: Colors.border },
  editBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  editBtnTextActive: { color: Colors.textMuted },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: Colors.primaryDark, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 32, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: Colors.primaryLight },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, margin: 16, marginBottom: 0, elevation: 1 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5, color: Colors.textMuted } as never,
  field: { marginBottom: 14 },
  row: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 5 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, backgroundColor: '#fafcfe' },
  inputIcon: { paddingLeft: 12 },
  input: { flex: 1, paddingHorizontal: 10, paddingVertical: 11, fontSize: 14, color: Colors.text },
  datePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fafcfe' },
  datePickerText: { flex: 1, fontSize: 14, color: Colors.text },
  datePickerPlaceholder: { color: Colors.primaryMid },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  diagnosisItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  diagnosisText: { fontSize: 14, color: Colors.text },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuText: { flex: 1, fontSize: 14, color: Colors.text, fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, marginTop: 20, borderWidth: 1.5, borderColor: '#dc2626', borderRadius: 14, paddingVertical: 14 },
  logoutBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});

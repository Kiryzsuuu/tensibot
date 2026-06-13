import { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, UserProfile } from '@/types';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
    setFullName(profile.fullName ?? '');
    setPhoneNumber(profile.phoneNumber ?? '');
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    // Handle Firestore Timestamp or ISO string for dateOfBirth
    const dob = profile.dateOfBirth as unknown;
    if (!dob) {
      setDateOfBirth('');
    } else if (typeof dob === 'object' && dob !== null && ('_seconds' in dob || 'seconds' in dob)) {
      const secs = (dob as Record<string, number>)['_seconds'] ?? (dob as Record<string, number>)['seconds'];
      setDateOfBirth(new Date(secs * 1000).toISOString().split('T')[0] ?? '');
    } else {
      const d = new Date(dob as string);
      setDateOfBirth(isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0] ?? '');
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
      await api.put('/users/profile', payload);
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
      {
        text: 'Keluar', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/');
        }
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => setEditing((v) => !v)} style={styles.editToggle}>
          <Text style={styles.editToggleText}>{editing ? 'Batal' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{(user?.fullName ?? 'U')[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullName ?? '–'}</Text>
        <Text style={styles.userEmail}>{user?.email ?? '–'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{user?.role ?? 'USER'}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informasi Pribadi</Text>

        {[
          { label: 'Nama Lengkap', value: fullName, set: setFullName },
          { label: 'No. Telepon', value: phoneNumber, set: setPhoneNumber },
          { label: 'Tanggal Lahir (YYYY-MM-DD)', value: dateOfBirth, set: setDateOfBirth },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.set}
                placeholderTextColor={Colors.primaryMid}
                placeholder={f.label}
              />
            ) : (
              <Text style={styles.value}>{f.value || '–'}</Text>
            )}
          </View>
        ))}

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Berat (kg)</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                placeholder="70"
                placeholderTextColor={Colors.primaryMid}
              />
            ) : (
              <Text style={styles.value}>{weightKg || '–'}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tinggi (cm)</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="numeric"
                placeholder="170"
                placeholderTextColor={Colors.primaryMid}
              />
            ) : (
              <Text style={styles.value}>{heightCm || '–'}</Text>
            )}
          </View>
        </View>

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={() => saveProfile()} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Perubahan</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Kondisi Kesehatan */}
      {profile?.diagnoses && profile.diagnoses.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kondisi Kesehatan</Text>
          {profile.diagnoses.map((d, i) => (
            <Text key={i} style={styles.diagnosisItem}>• {d}</Text>
          ))}
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Keluar dari Aplikasi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 48, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  editToggle: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.primary },
  editToggleText: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: Colors.border },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryDark, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarLetter: { fontSize: 30, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 18, fontWeight: '800', color: Colors.text },
  userEmail: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, backgroundColor: Colors.primaryLight },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, margin: 16, marginBottom: 0, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 14 },
  field: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 4 },
  value: { fontSize: 15, color: Colors.text, fontWeight: '500', paddingVertical: 2 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  diagnosisItem: { fontSize: 14, color: Colors.text, paddingVertical: 3 },
  logoutBtn: { margin: 16, marginTop: 20, borderWidth: 1.5, borderColor: '#dc2626', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logoutBtnText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});

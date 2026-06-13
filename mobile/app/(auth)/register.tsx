import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Colors } from '@/constants/colors';
import type { ApiResponse, AuthResponse } from '@/types';

export default function RegisterScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Perhatian', 'Semua field wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Password tidak cocok');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Perhatian', 'Password minimal 8 karakter');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
        fullName, email, password, confirmPassword, role: 'PASIEN',
      });
      if (res.data.success && res.data.data) {
        await setAuth(res.data.data.user, res.data.data.accessToken);
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Registrasi gagal. Coba lagi.';
      Alert.alert('Registrasi Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>〜</Text>
          </View>
          <Text style={styles.appName}>Daftar ke Tensi-Bot</Text>
          <Text style={styles.tagline}>Mulai pantau kesehatan Anda hari ini</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subtitle}>
            Sudah punya akun?{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
              Masuk di sini
            </Text>
          </Text>

          {[
            { label: 'Nama Lengkap', value: fullName, set: setFullName, placeholder: 'Budi Santoso', type: 'default' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'nama@email.com', type: 'email-address' },
          ].map((f) => (
            <View key={f.label} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.primaryMid}
                keyboardType={f.type as 'default' | 'email-address'}
                autoCapitalize={f.type === 'email-address' ? 'none' : 'words'}
                value={f.value}
                onChangeText={f.set}
              />
            </View>
          ))}

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 8 karakter"
                placeholderTextColor={Colors.primaryMid}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Text>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Konfirmasi Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Ulangi password"
              placeholderTextColor={Colors.primaryMid}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity onPress={onRegister} style={styles.btn} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Buat Akun Gratis</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Kembali ke Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoIcon: { fontSize: 24, color: '#fff' },
  appName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  tagline: { fontSize: 12, color: Colors.primaryMid, marginTop: 3 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, elevation: 8 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 16 },
  link: { color: Colors.primary, fontWeight: '700' },
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 5 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  backBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  backBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});

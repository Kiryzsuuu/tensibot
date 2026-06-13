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

export default function LoginScreen() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Perhatian', 'Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        await setAuth(res.data.data.user, res.data.data.accessToken);
        router.replace('/(tabs)/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Email atau password salah';
      Alert.alert('Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>〜</Text>
          </View>
          <Text style={styles.appName}>Tensi-Bot</Text>
          <Text style={styles.tagline}>Teman Kendali Hipertensi Anda</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Masuk ke Akun</Text>
          <Text style={styles.subtitle}>
            Belum punya akun?{' '}
            <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
              Daftar sekarang
            </Text>
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nama@email.com"
              placeholderTextColor={Colors.primaryMid}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Masukkan password"
                placeholderTextColor={Colors.primaryMid}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={onLogin} style={styles.btn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoIcon: { fontSize: 28, color: '#fff' },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: Colors.primaryMid, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  link: { color: Colors.primary, fontWeight: '700' },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text,
    backgroundColor: '#fafcfe',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  backBtn: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center', marginTop: 10,
  },
  backBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});

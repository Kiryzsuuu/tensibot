import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const onForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert('Perhatian', 'Masukkan email Anda');
      return;
    }
    setForgotLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setShowForgot(false);
      setForgotEmail('');
      Alert.alert(
        'Email Terkirim',
        'Jika email terdaftar, link reset password akan dikirim ke email Anda. Periksa folder spam jika tidak muncul.',
        [{ text: 'OK' }]
      );
    } catch {
      Alert.alert('Error', 'Gagal mengirim email. Coba lagi.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="heart-circle" size={32} color="#fff" />
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
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => { setForgotEmail(email); setShowForgot(true); }}>
                  <Text style={styles.forgotLink}>Lupa password?</Text>
                </TouchableOpacity>
              </View>
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
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={onLogin} style={styles.btn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Masuk</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/landing')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal visible={showForgot} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.handle} />
            <View style={modal.iconBox}>
              <Ionicons name="lock-open-outline" size={28} color={Colors.primary} />
            </View>
            <Text style={modal.title}>Lupa Password</Text>
            <Text style={modal.subtitle}>
              Masukkan email Anda dan kami akan kirim link untuk reset password.
            </Text>
            <View style={modal.field}>
              <Text style={modal.label}>Email</Text>
              <TextInput
                style={modal.input}
                placeholder="nama@email.com"
                placeholderTextColor={Colors.primaryMid}
                keyboardType="email-address"
                autoCapitalize="none"
                value={forgotEmail}
                onChangeText={setForgotEmail}
                autoFocus
              />
            </View>
            <TouchableOpacity style={modal.btn} onPress={onForgotPassword} disabled={forgotLoading}>
              {forgotLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={modal.btnText}>Kirim Link Reset</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={modal.cancelBtn} onPress={() => { setShowForgot(false); setForgotEmail(''); }}>
              <Text style={modal.cancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primaryDark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: Colors.primaryMid, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginBottom: 20 },
  link: { color: Colors.primary, fontWeight: '700' },
  field: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text },
  forgotLink: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 14 },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  backBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  backBtnText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: 20 },
  iconBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  field: { width: '100%', marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.text, backgroundColor: '#fafcfe', width: '100%' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', width: '100%', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, paddingVertical: 13, alignItems: 'center', width: '100%', marginTop: 10 },
  cancelText: { color: Colors.textMuted, fontWeight: '600', fontSize: 14 },
});

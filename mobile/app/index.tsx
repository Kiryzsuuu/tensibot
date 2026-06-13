import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (token) {
      router.replace('/(tabs)/dashboard');
    } else {
      router.replace('/(auth)/login');
    }
  }, [_hasHydrated, token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primaryLight }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

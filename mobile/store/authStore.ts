import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  _hasHydrated: false,

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('auth-token', token);
    await AsyncStorage.setItem('auth-user', JSON.stringify(user));
    set({ user, token });
  },

  updateUser: (partial) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...partial } });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem('auth-token');
    await AsyncStorage.removeItem('auth-user');
    set({ user: null, token: null });
  },

  hydrate: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('auth-token'),
        AsyncStorage.getItem('auth-user'),
      ]);
      if (token && userStr) {
        set({ user: JSON.parse(userStr) as User, token });
      }
    } catch {
      // ignore
    } finally {
      set({ _hasHydrated: true });
    }
  },
}));

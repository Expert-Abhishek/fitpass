import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Database } from '@fitness/types';

/**
 * Custom Storage Adapter bridging Supabase Auth session persistence
 * with Expo SecureStore on Native platforms and window.localStorage on Web.
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  },
};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://oftywfrpcfbjpgpplszl.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_DhZ4fPlhhzIjqk8-B0s7Yg_PF4dl5-y';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: Platform.OS !== 'web' || typeof window !== 'undefined',
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
});

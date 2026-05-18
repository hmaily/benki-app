import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Storage adapter for the Supabase auth session.
 *
 * Native: expo-secure-store keeps tokens in the Keychain / Keystore. Its
 * per-entry size limit (~2 KB on iOS) is below a full session payload, so
 * values are split into chunks with a head entry recording the count.
 *
 * Web: SecureStore is unavailable, so fall back to localStorage.
 */

const CHUNK_SIZE = 1800;

interface SupabaseAuthStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const chunkedSecureStore: SupabaseAuthStorage = {
  async getItem(key) {
    const head = await SecureStore.getItemAsync(key);
    if (head === null) return null;
    const chunkCount = Number(head);
    if (!Number.isInteger(chunkCount) || chunkCount < 1) return null;

    const parts: string[] = [];
    for (let i = 0; i < chunkCount; i += 1) {
      const part = await SecureStore.getItemAsync(`${key}.${i}`);
      if (part === null) return null; // incomplete write — treat as absent
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key, value) {
    const chunkCount = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
    for (let i = 0; i < chunkCount; i += 1) {
      await SecureStore.setItemAsync(
        `${key}.${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      );
    }
    await SecureStore.setItemAsync(key, String(chunkCount));
  },

  async removeItem(key) {
    const head = await SecureStore.getItemAsync(key);
    const chunkCount = head ? Number(head) : 0;
    for (let i = 0; i < chunkCount; i += 1) {
      await SecureStore.deleteItemAsync(`${key}.${i}`);
    }
    await SecureStore.deleteItemAsync(key);
  },
};

const webLocalStorage: SupabaseAuthStorage = {
  getItem: (key) => Promise.resolve(globalThis.localStorage?.getItem(key) ?? null),
  setItem: (key, value) => {
    globalThis.localStorage?.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    globalThis.localStorage?.removeItem(key);
    return Promise.resolve();
  },
};

export const authStorage: SupabaseAuthStorage =
  Platform.OS === 'web' ? webLocalStorage : chunkedSecureStore;

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a storage object that works in both web and React Native environments
const storage = {
  getItem: async (name: string) => {
    if (typeof localStorage !== 'undefined') {
      // Web environment
      return localStorage.getItem(name);
    } else {
      // React Native environment
      return AsyncStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string) => {
    if (typeof localStorage !== 'undefined') {
      // Web environment
      localStorage.setItem(name, value);
    } else {
      // React Native environment
      await AsyncStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (typeof localStorage !== 'undefined') {
      // Web environment
      localStorage.removeItem(name);
    } else {
      // React Native environment
      await AsyncStorage.removeItem(name);
    }
  },
};

interface UserState {
  email: string | null;
  uid: string | null;
  isAuthenticated: boolean;
  setUser: (email: string | null, uid: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      email: null,
      uid: null,
      isAuthenticated: false,
      setUser: (email, uid) => {
        console.log('User set:', { email, uid });
        set({ email, uid, isAuthenticated: true });
      },
      clearUser: () => {
        console.log('User cleared');
        set({ email: null, uid: null, isAuthenticated: false });
      },
    }),
    {
      name: 'user-storage', // unique name for the storage
      storage: createJSONStorage(() => storage),
    }
  )
);

// Default export for the user store
export default useUserStore;

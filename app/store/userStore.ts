import { create } from 'zustand';

interface UserState {
  email: string | null;
  uid: string | null;
  isAuthenticated: boolean;
  setUser: (email: string | null, uid: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  email: null,
  uid: null,
  isAuthenticated: false,
  setUser: (email, uid) => set({ email, uid, isAuthenticated: true }),
  clearUser: () => set({ email: null, uid: null, isAuthenticated: false }),
}));

// Default export for the user store
export default useUserStore;

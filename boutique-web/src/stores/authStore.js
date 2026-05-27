import { create } from 'zustand';

const TOKEN_KEY = 'auth_token';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  login: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from './lifeOSStore';

export interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  biometricEnabled: boolean;
  lastLoginAttempt: Date | null;
  loginAttempts: number;
  lockoutUntil: Date | null;
}

export interface AuthActions {
  setAuthenticated: (authenticated: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
  setLockoutUntil: (date: Date | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  immer((set, get) => ({
    // Initial State
    isAuthenticated: false,
    isOnboarded: false,
    isLoading: false,
    user: null,
    error: null,
    biometricEnabled: false,
    lastLoginAttempt: null,
    loginAttempts: 0,
    lockoutUntil: null,

    // Actions
    setAuthenticated: (authenticated) => set((state) => {
      state.isAuthenticated = authenticated;
    }),

    setOnboarded: (onboarded) => set((state) => {
      state.isOnboarded = onboarded;
    }),

    setLoading: (loading) => set((state) => {
      state.isLoading = loading;
    }),

    setUser: (user) => set((state) => {
      state.user = user;
    }),

    setError: (error) => set((state) => {
      state.error = error;
    }),

    setBiometricEnabled: (enabled) => set((state) => {
      state.biometricEnabled = enabled;
    }),

    incrementLoginAttempts: () => set((state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date();
      
      // Lockout after 5 failed attempts for 15 minutes
      if (state.loginAttempts >= 5) {
        const lockoutTime = new Date();
        lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
        state.lockoutUntil = lockoutTime;
      }
    }),

    resetLoginAttempts: () => set((state) => {
      state.loginAttempts = 0;
      state.lockoutUntil = null;
    }),

    setLockoutUntil: (date) => set((state) => {
      state.lockoutUntil = date;
    }),

    login: async (email: string, password: string) => {
      const state = get();
      
      // Check if account is locked out
      if (state.lockoutUntil && new Date() < state.lockoutUntil) {
        set((state) => {
          state.error = 'Account temporarily locked. Please try again later.';
        });
        return false;
      }

      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // This will be implemented with the authentication service
        // For now, simulate a successful login
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: email,
          avatar: undefined,
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true,
            privacyLevel: 'high',
          },
          createdAt: new Date(),
          lastActive: new Date(),
        };

        set((state) => {
          state.isAuthenticated = true;
          state.user = mockUser;
          state.isLoading = false;
          state.loginAttempts = 0;
          state.lockoutUntil = null;
        });

        return true;
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Login failed. Please check your credentials.';
        });
        
        get().incrementLoginAttempts();
        return false;
      }
    },

    loginWithBiometric: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // This will be implemented with biometric authentication
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, simulate successful biometric login
        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: undefined,
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true,
            privacyLevel: 'high',
          },
          createdAt: new Date(),
          lastActive: new Date(),
        };

        set((state) => {
          state.isAuthenticated = true;
          state.user = mockUser;
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Biometric authentication failed.';
        });
        return false;
      }
    },

    loginWithGoogle: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // This will be implemented with Google Sign-In
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john@gmail.com',
          avatar: 'https://example.com/avatar.jpg',
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true,
            privacyLevel: 'high',
          },
          createdAt: new Date(),
          lastActive: new Date(),
        };

        set((state) => {
          state.isAuthenticated = true;
          state.user = mockUser;
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Google Sign-In failed.';
        });
        return false;
      }
    },

    loginWithApple: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        // This will be implemented with Apple Sign-In
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: '1',
          name: 'John Doe',
          email: 'john@icloud.com',
          avatar: undefined,
          preferences: {
            theme: 'auto',
            language: 'en',
            notifications: true,
            privacyLevel: 'high',
          },
          createdAt: new Date(),
          lastActive: new Date(),
        };

        set((state) => {
          state.isAuthenticated = true;
          state.user = mockUser;
          state.isLoading = false;
        });

        return true;
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Apple Sign-In failed.';
        });
        return false;
      }
    },

    logout: async () => {
      set((state) => {
        state.isLoading = true;
      });

      try {
        // This will be implemented with logout cleanup
        await new Promise(resolve => setTimeout(resolve, 500));

        set((state) => {
          state.isAuthenticated = false;
          state.user = null;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = 'Logout failed.';
        });
      }
    },

    completeOnboarding: () => {
      set((state) => {
        state.isOnboarded = true;
      });
    },

    resetAuth: () => {
      set((state) => {
        state.isAuthenticated = false;
        state.isOnboarded = false;
        state.user = null;
        state.error = null;
        state.biometricEnabled = false;
        state.lastLoginAttempt = null;
        state.loginAttempts = 0;
        state.lockoutUntil = null;
      });
    },
  }))
); 
import { create } from 'zustand';
import { AuthState, UserProfile } from '@/lib/types';
import { User } from 'firebase/auth';
import { isAdmin } from '@/firebase/auth';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setUserAndProfile: (user: User | null, profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  
  setUser: (user) => {
    const { profile } = get();
    set({ 
      user, 
      isAdmin: isAdmin(profile),
      loading: false 
    });
  },
  
  setProfile: (profile) => {
    const { user } = get();
    set({ 
      profile, 
      isAdmin: isAdmin(profile),
      loading: false 
    });
  },
  
  setUserAndProfile: (user, profile) => {
    set({ 
      user, 
      profile, 
      isAdmin: isAdmin(profile),
      loading: false 
    });
  },
  
  setLoading: (loading) => set({ loading }),
  
  reset: () => set({ 
    user: null, 
    profile: null,
    loading: false, 
    isAdmin: false 
  }),
}));
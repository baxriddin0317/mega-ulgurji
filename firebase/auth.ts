import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { auth } from './config';
import { createUserProfile, getUserProfile } from './firestore';
import { UserProfile } from '@/lib/types';

// Email va parol bilan ro'yxatdan o'tish
export const registerWithEmail = async (
  email: string, 
  password: string, 
  displayName: string
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Firebase Auth profile yangilash
    await updateProfile(user, {
      displayName: displayName
    });

    // Firestore da user profil yaratish
    const profileResult = await createUserProfile(user.uid, {
      email: user.email || '',
      displayName: displayName,
      role: 'user' // Default role
    });

    if (profileResult.error) {
      throw new Error(profileResult.error);
    }

    return { user, profile: profileResult.data, error: null };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message };
  }
};

// Email va parol bilan kirish
export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // User profilini olish
    const profileResult = await getUserProfile(user.uid);
    
    if (profileResult.error) {
      throw new Error(profileResult.error);
    }

    return { user, profile: profileResult.data, error: null };
  } catch (error: any) {
    return { user: null, profile: null, error: error.message };
  }
};

// Chiqish
export const logout = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Admin tekshirish
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return userProfile?.role === 'admin' && userProfile?.isActive === true;
};

// Auth state o'zgarishini kuzatish
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// User profile bilan birga auth state
export const onAuthStateChangeWithProfile = (
  callback: (user: User | null, profile: UserProfile | null) => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profileResult = await getUserProfile(user.uid);
      callback(user, profileResult.data);
    } else {
      callback(null, null);
    }
  });
};
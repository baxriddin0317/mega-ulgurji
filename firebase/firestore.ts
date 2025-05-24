// lib/firebase/firestore.ts
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { fireDB } from './config';
import { UserProfile, UserRole } from '@/lib/types';

// User profil yaratish
export const createUserProfile = async (uid: string, userData: Partial<UserProfile>) => {
  try {
    const userRef = doc(fireDB, 'users', uid);
    const userProfile: UserProfile = {
      uid,
      email: userData.email || '',
      displayName: userData.displayName || '',
      role: userData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      ...userData
    };
    
    await setDoc(userRef, userProfile);
    return { data: userProfile, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// User profil olish
export const getUserProfile = async (uid: string): Promise<{ data: UserProfile | null, error: string | null }> => {
  try {
    const userRef = doc(fireDB, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      return { data, error: null };
    } else {
      return { data: null, error: 'User not found' };
    }
  } catch (error: any) {
    return { data: null, error: error.message };
  }
};

// User role yangilash
export const updateUserRole = async (uid: string, role: UserRole) => {
  try {
    const userRef = doc(fireDB, 'users', uid);
    await updateDoc(userRef, { 
      role,
      updatedAt: new Date()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Barcha userlarni olish (admin uchun)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(fireDB, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users: UserProfile[] = [];
    
    querySnapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    
    return { data: users, error: null };
  } catch (error: any) {
    return { data: [], error: error.message };
  }
};
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChangeWithProfile } from '@/firebase/auth';

export const useAuth = () => {
  const { 
    user, 
    profile, 
    loading, 
    isAdmin, 
    setUserAndProfile, 
    setLoading, 
    reset 
  } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onAuthStateChangeWithProfile((user, profile) => {
      if (user && profile) {
        setUserAndProfile(user, profile);
      } else {
        reset();
      }
    });

    return () => unsubscribe();
  }, [setUserAndProfile, setLoading, reset]);

  return {
    user,
    profile,
    loading,
    isAdmin,
  };
};
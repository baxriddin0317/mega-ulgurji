'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Agar user yo'q bo'lsa login sahifasiga yo'naltir
      if (!user) {
        router.push('/login');
        return;
      }

      // Agar profile yo'q bo'lsa (ma'lumotlar yuklanmagan)
      if (!profile) {
        return;
      }

      // Agar admin kerak bo'lib, lekin user admin bo'lmasa
      if (requireAdmin && !isAdmin) {
        router.push(redirectTo);
        return;
      }
    }
  }, [user, profile, loading, isAdmin, requireAdmin, redirectTo, router]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading
      </div>
    );
  }

  // Agar user yo'q bo'lsa
  if (!user || !profile) {
    return null;
  }

  // Agar admin kerak bo'lib, lekin user admin bo'lmasa
  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
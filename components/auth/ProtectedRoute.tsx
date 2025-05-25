"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  adminOnly?: boolean
  redirectTo?: string
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  adminOnly = false,
  redirectTo 
}: ProtectedRouteProps) => {
  const router = useRouter()
  const { isAuthenticated, userData, isLoading, isAdmin } = useAuthStore()

  useEffect(() => {
    if (!isLoading) {
      // Agar authentication talab qilinsa va user login qilmagan bo'lsa
      if (requireAuth && !isAuthenticated) {
        router.push('/')
        return
      }

      // Agar admin faqat sahifa bo'lsa va user admin bo'lmasa
      if (adminOnly && isAuthenticated && !isAdmin()) {
        router.push('/') // yoki boshqa sahifa
        return
      }

      // Agar custom redirect kerak bo'lsa
      if (redirectTo && isAuthenticated) {
        if (isAdmin()) {
          router.push('/admin')
        } else {
          router.push('/')
        }
        return
      }
    }
  }, [isAuthenticated, userData, isLoading, requireAuth, adminOnly, redirectTo, router, isAdmin])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  // Agar authentication talab qilinsa va user login qilmagan bo'lsa
  if (requireAuth && !isAuthenticated) {
    return null // router.push ishga tushguncha
  }

  // Agar admin faqat sahifa bo'lsa va user admin bo'lmasa
  if (adminOnly && isAuthenticated && !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
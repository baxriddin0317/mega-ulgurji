"use client"
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/store/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setUser, setUserData, setLoading } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)

      if (user) {
        setUser(user)

        try {
          // Direct document fetch by UID (more efficient than query)
          const userDocRef = doc(fireDB, 'user', user.uid)
          const userSnapshot = await getDoc(userDocRef)

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data()
            setUserData(userData as any)

            // Set session cookie for middleware
            if (typeof window !== 'undefined') {
              const sessionData = btoa(JSON.stringify({ role: userData.role, uid: userData.uid }));
              document.cookie = `__session=${sessionData}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
            }
          } else {
            setUserData(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
        // Clear session cookie
        if (typeof window !== 'undefined') {
          document.cookie = '__session=; path=/; max-age=0';
        }
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setUserData, setLoading])

  return <>{children}</>
}

export default AuthProvider
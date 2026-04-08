"use client"
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/store/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'
import type { UserData } from '@/store/authStore'

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
          const userDocRef = doc(fireDB, 'user', user.uid)
          const userSnapshot = await getDoc(userDocRef)

          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as UserData
            setUserData(userData)

            // Create server-signed session cookie via API
            try {
              const idToken = await user.getIdToken()
              await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              })
            } catch {
              // Session creation is best-effort — user can still use client-side auth
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
        // Clear server-signed session cookie
        fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setUserData, setLoading])

  return <>{children}</>
}

export default AuthProvider
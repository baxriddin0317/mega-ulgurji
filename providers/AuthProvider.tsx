"use client"
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/store/authStore'
import { collection, query, where, getDocs } from 'firebase/firestore'
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
          // Firestore'dan user ma'lumotlarini olish
          const userQuery = query(
            collection(fireDB, 'user'),
            where('uid', '==', user.uid)
          )
          
          const querySnapshot = await getDocs(userQuery)
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data()
            setUserData(userData as any)
          } else {
            console.error('User document not found in Firestore')
            setUserData(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUserData(null)
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setUserData, setLoading])

  return <>{children}</>
}

export default AuthProvider
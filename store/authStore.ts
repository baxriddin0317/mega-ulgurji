import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'

type Role = "admin" | "user"

interface UserData {
  name: string
  email: string | null
  uid: string
  role: Role
  time: any
  date: string
}

interface AuthState {
  user: FirebaseUser | null
  userData: UserData | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: FirebaseUser | null) => void
  setUserData: (userData: UserData | null) => void
  setLoading: (loading: boolean) => void
  fetchUserData: (uid: string) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false
        })
      },

      setUserData: (userData) => {
        set({ userData })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      fetchUserData: async (uid: string) => {
        try {
          const userDoc = doc(fireDB, 'user', uid)
          const userSnapshot = await getDoc(userDoc)
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data() as UserData
            set({ userData })
          } else {
            console.error('User document not found')
            set({ userData: null })
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          set({ userData: null })
        }
      },

      logout: () => {
        set({
          user: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      isAdmin: () => {
        const { userData } = get()
        return userData?.role === 'admin'
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userData: state.userData,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
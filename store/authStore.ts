import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { fireDB } from '@/firebase/config'
import { collection, onSnapshot } from 'firebase/firestore'

type Role = "admin" | "user"

interface UserData {
  name: string
  email: string | null
  uid: string
  role: Role
  time: any
  date: string
  phone: string
}

interface AuthState {
  user: FirebaseUser | null
  userData: UserData | null
  users: UserData[]
  isAuthenticated: boolean
  isLoading: boolean
  isfetchLoading: boolean
  setUser: (user: FirebaseUser | null) => void
  setUserData: (userData: UserData | null) => void
  setLoading: (loading: boolean) => void
  fetchUserData: (uid: string) => Promise<void>
  fetchAllUsers: () => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      users: [],
      isAuthenticated: false,
      isLoading: true,
      isfetchLoading: true,

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

      fetchAllUsers: () => {
        set({ isfetchLoading: true });
        try {
          const q = collection(fireDB, "user");
          const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
            let usersArray: any = [];
            QuerySnapshot.forEach((doc) => {
              usersArray.push({ ...doc.data(), uid: doc.id });
            });
            set({ users: usersArray, isfetchLoading: false });
          });
          return unsubscribe;
        } catch (error) {
          console.error('Error fetching users:', error);
          set({ isfetchLoading: false });
          return undefined;
        }
      },

      logout: () => {
        set({
          user: null,
          userData: null,
          isAuthenticated: false,
          isLoading: false
        });
        if (typeof window !== 'undefined') {
          useAuthStore.persist.clearStorage();
        }
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

export type { UserData };
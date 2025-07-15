"use client"
import React from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '@/firebase/config';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore'
import { FirebaseError } from 'firebase/app';

interface User {
  name: string;
  uid: string;
  time: {
    seconds: number;
    nanoseconds: number;
  };
  date: string;
  role: string;
  email: string;
}

interface LoginFormInputs {
  email: string
  password: string
}

const isUser = (data: DocumentData): data is User => {
  return data && 
         typeof data.uid === 'string' && 
         typeof data.email === 'string' && 
         typeof data.role === 'string'
}

const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const userLoginFunction: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true)
    
    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user

      // Query user data from Firestore
      const q = query(
        collection(fireDB, "user"),
        where('uid', '==', user.uid)
      )

      // Use onSnapshot for real-time listener (though for login, a one-time fetch might be better)
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let userData: User | undefined
        
        querySnapshot.forEach((doc) => {
          const docData = doc.data()
          if (isUser(docData)) {
            userData = docData
          }
        })

        if (userData) {
          // Store user data (Note: localStorage not available in Claude artifacts)
          // localStorage.setItem("users", JSON.stringify(userData))
          
          // Reset form
          reset()
          
          // Success message
          toast.success("Tizimga muvaffaqiyatli kirdingiz")
          console.log('User data:', userData)

          // Navigation based on user role
          if (userData?.role === "admin") {
            router.push('/admin')
          } else {
            router.push('/')
          }
        } else {
          toast.error("Foydalanuvchi topilmadi yoki ma'lumotlar noto'g'ri")
        }
        
        setLoading(false)
        // Unsubscribe from the listener
        unsubscribe()
      }, (error) => {
        console.error('Firestore error:', error)
        toast.error("Foydalanuvchi ma'lumotlarini olishda xatolik yuz berdi")
        setLoading(false)
      })

    } catch (error) {    
      setLoading(false)
      if (error instanceof FirebaseError) {
        // Handle specific Firebase auth errors
        switch (error.code) {
          case 'auth/invalid-credential':
            toast.error("Email noto‘g‘ri yoki parol xato")
            break
          case 'auth/invalid-email':
            toast.error("Email manzili noto‘g‘ri")
            break
          case 'auth/too-many-requests':
            toast.error("Juda ko'p urinish. Iltimos, keyinroq qayta urinib ko'ring")
            break
          default:
            toast.error("Kirish amalga oshmadi. Iltimos, qayta urinib ko'ring")
        }
      } else {
        toast.error("Noma'lum xatolik yuz berdi")
      }
    }
  }

  return (
    <div className='bg-white flex items-center justify-center w-full h-full rounded-2xl p-4 shadow-2xl'>
      <form onSubmit={handleSubmit(userLoginFunction)} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
        <h1 className="text-black text-[22px] text-center font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Mega akkauntiga kirish</h1>
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Email</p>
            <input
              type='email'
              placeholder="Sizning emailingiz"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal ${
                errors.email ? 'border-red-500 border-2' : ''
              }`}
              {...register('email', {
                required: "Email majburiy kiritilishi kerak",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>
            )}
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Parol</p>
            <input
              type='password'
              placeholder="Sizning parolingiz"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal ${
                errors.password ? 'border-red-500 border-2' : ''
              }`}
              {...register('password', {
                required: "Parol majburiy kiritilishi kerak",
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
            )}
          </label>
        </div>
        <div className="flex md:px-4 py-3">
          <Button
            type='submit'
            variant={'default'}
            disabled={loading || isSubmitting}
            className="cursor-pointer overflow-hidden rounded-xl w-full h-12 bg-black text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate"> {loading ? 'Hisobga kirish...' : 'Hisobga kirish'}</span>
          </Button>
        </div>
        <div className='flex justify-center gap-2 py-3'>
          <span className="text-[#6B6B6B] text-sm font-normal leading-normal text-center">Yoki</span>
          <Link href={'/sign-up'} className="text-[#6B6B6B] text-sm font-normal leading-normal text-center underline">Ro&apos;yxatdan o&apos;tish</Link>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
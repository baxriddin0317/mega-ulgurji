"use client"
import React, { useState } from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, fireDB } from '@/firebase/config';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { useAuthStore } from '@/store/authStore';
import { FirebaseError } from 'firebase/app';

type Role = "admin" | "user"

// Form inputs type
interface SignUpFormInputs {
  name: string
  email: string
  password: string
  role: Role
}

// User type for Firestore
interface User {
  name: string
  email: string | null
  uid: string
  role: Role
  time: Timestamp // Timestamp
  date: string
}


const SignUpForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { setUser, setUserData } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<SignUpFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user"
    }
  })

  const userSignupFunction: SubmitHandler<SignUpFormInputs> = async (data) => {
    setLoading(true)
    
    // Debug: Signup ma'lumotlarini tekshirish
    console.log('Signup attempt with:', {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordLength: data.password.length
    })

    try {
      // Firebase authentication - user yaratish
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
      const firebaseUser = userCredential.user
      
      console.log('Firebase user created:', firebaseUser.uid)

      // Firestore uchun user obyektini yaratish
      const user: User = {
        name: data.name,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        role: data.role,
        time: Timestamp.now(),
        date: new Date().toLocaleString(
          "en-US",
          {
            month: "short",
            day: "2-digit",
            year: "numeric",
          }
        )
      }

      console.log('User object to save:', user)

      // Firestore ga user ma'lumotlarini saqlash
      const userReference = collection(fireDB, "user")
      const docRef = await addDoc(userReference, user)
      
      console.log('User saved to Firestore with ID:', docRef.id)

      // Zustand store'ni yangilash
      setUser(firebaseUser)
      setUserData(user)

      // Form ni tozalash
      reset()

      // Success message
      toast.success("Signup Successfully")
      
      setLoading(false)
      
      // Login sahifasiga yo'naltirish
      router.push('/login')

    } catch (error) {
      setLoading(false)
      if (error instanceof FirebaseError) {
        // Handle specific Firebase auth errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            toast.error("This email is already registered. Please use a different email or login.")
            break
          case 'auth/weak-password':
            toast.error("Password is too weak. Please use at least 6 characters.")
            break
          case 'auth/invalid-email':
            toast.error("Invalid email address format")
            break
          case 'auth/operation-not-allowed':
            toast.error("Email/password accounts are not enabled")
            break
          case 'auth/network-request-failed':
            toast.error("Network error. Please check your connection")
            break
          default:
            toast.error("Signup failed. Please try again")
            console.log('Unhandled error code:', error.code)
        }
      } else {
        toast.error("Noma'lum xatolik yuz berdi")
      }
    }
  }
  
  return (
    <div className='bg-white flex items-center justify-center w-full h-full rounded-2xl p-4 shadow-2xl'>
      <form onSubmit={handleSubmit(userSignupFunction)} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
        <h1 className="text-black text-[22px] text-center font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Sign up to Mega</h1>
        {/* full name */}
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Full Name</p>
            <input
              type='text'
              placeholder="Your full name"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal ${
                errors.name ? 'border-red-500 border-2' : ''
              }`}
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                pattern: {
                  value: /^[A-Za-z\s]+$/,
                  message: 'Name can only contain letters and spaces'
                }
              })}
            />
            {errors.name && (
              <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
            )}
          </label>
        </div>
        {/* email name */}
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Email</p>
            <input
              type='email'
              placeholder="Your email"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal ${
                errors.email ? 'border-red-500 border-2' : ''
              }`}
              {...register('email', {
                required: 'Email is required',
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
         {/* Password Field */}
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Password</p>
            <input
              type='password'
              placeholder="Your password"
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal ${
                errors.password ? 'border-red-500 border-2' : ''
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
                  message: 'Password must contain at least one letter and one number'
                }
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
            )}
          </label>
        </div>
         {/* Submit Button */}
        <div className="flex md:px-4 py-3">
          <Button
            type='submit'
            variant={'default'}
            disabled={loading || isSubmitting}
            className="cursor-pointer overflow-hidden rounded-xl w-full h-12 bg-black text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">
              {loading ? 'Creating Account...' : 'Sign up'}
            </span>
          </Button>
        </div>
        <div className='flex justify-center gap-2 py-3'>
          <span className="text-[#6B6B6B] text-sm font-normal leading-normal text-center">Already have an account?</span>
          <Link href={'/login'} className="text-[#6B6B6B] text-sm font-normal leading-normal text-center underline">Login</Link>
        </div>
      </form>
    </div>
  )
}

export default SignUpForm
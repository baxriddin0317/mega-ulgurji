"use client"
import React, { FormEvent, useState } from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const router = useRouter();

  const [userLogin, setUserLogin] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/admin')
  }

  return (
    <div className='bg-white flex items-center justify-center w-full h-full rounded-2xl p-4 shadow-2xl'>
      <form onSubmit={handleSubmit} className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
        <h1 className="text-black text-[22px] text-center font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Log in to Mega</h1>
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Email</p>
            <input
              type='email'
              placeholder="Your email"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal"
              value={userLogin.email}
              onChange={(e) => {
                setUserLogin({
                  ...userLogin,
                  email: e.target.value,
                });
              }}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-end gap-4 md:px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-black text-base font-medium leading-normal pb-2">Password</p>
            <input
              type='password'
              placeholder="Your password"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-black focus:outline-0 focus:ring-0 border-none bg-[#EEEEEE] focus:border-none h-10 placeholder:text-[#6B6B6B] p-4 text-base font-normal leading-normal"
              value={userLogin.password}
              onChange={(e) => {
                setUserLogin({
                  ...userLogin,
                  password: e.target.value,
                });
              }}
            />
          </label>
        </div>
        <div className="flex md:px-4 py-3">
          <Button
            type='submit'
            variant={'default'}
            className="cursor-pointer overflow-hidden rounded-xl w-full h-12 bg-black text-[#FFFFFF] text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Log in</span>
          </Button>
        </div>
        <div className='flex justify-center gap-2 py-3'>
          <span className="text-[#6B6B6B] text-sm font-normal leading-normal text-center">Or</span>
          <Link href={'/sign-up'} className="text-[#6B6B6B] text-sm font-normal leading-normal text-center underline">Sign up</Link>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
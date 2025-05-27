"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoIosMenu } from "react-icons/io";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '@/store/authStore';

const Header = () => {
  const [fixed, setFixed] = useState(false);
  const { isAuthenticated, isAdmin, logout } = useAuthStore();

 useEffect(() => {
    const handleScroll = () => {
      if (document.documentElement.scrollTop > 100) {
        setFixed(true);
      } else {
        setFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`${fixed ? 'py-4 bg-black/80 rounded-full' : 'py-8'} sticky max-w-7xl w-full flex items-center justify-between mx-auto transition-all duration-500 px-6 md:px-8 lg:px-20 top-4 z-50`}>
      <Link href={'/'} className="relative flex w-6 h-8">
        <Image className="absolute size-full object-cover" src="/images/logo.png" fill alt="site logo" />
      </Link>
      <nav className="hidden md:flex items-center gap-10">
        <Links />
        {!isAuthenticated ? (
          <Link href={'/login'} className='flex items-center bg-white rounded-md text-accent-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground transition-all h-9 px-4 has-[>svg]:px-3 cursor-pointer' type='button'>Login</Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer'>
              <Avatar className='size-10'>
                <AvatarImage src="" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              {isAdmin() && (
                <DropdownMenuItem className='cursor-pointer'>
                  <Link href="/admin">Go to Admin</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='cursor-pointer' onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
      <Sheet>
        <SheetTrigger className='md:hidden text-white cursor-pointer'>
          <IoIosMenu size={28} />
        </SheetTrigger>
        <SheetContent side='top' className="w-full h-[60vh] bg-black/80 border-none">
          <SheetHeader>
            <SheetTitle className="sr-only">Logo</SheetTitle>
            <nav className="flex flex-col items-center gap-10 pt-10">
              <Links />
              {!isAuthenticated ? (
                <Link href={'/login'} className='flex items-center bg-white rounded-md text-accent-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground transition-all h-9 px-4 has-[>svg]:px-3 cursor-pointer' type='button'>Login</Link>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {isAdmin() && (
                    <Link href="/admin" className="text-lg text-[#d1d1d1] hover:text-white">Go to Admin</Link>
                  )}
                  <button onClick={logout} className="text-lg text-[#d1d1d1] hover:text-white cursor-pointer">Log out</button>
                </div>
              )}
            </nav>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </header>
  )
}

const Links = () => {
  return (
    <>
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/'}>Home</Link>
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/#category'}>Katalog</Link>
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/#location'}>Manzil</Link>
    </>
  )
}

export default Header
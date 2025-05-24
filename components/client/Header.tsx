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

const Header = () => {
  const [fixed, setFixed] = useState(false);

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
      <Link href={'/login'} className='flex items-center bg-white rounded-md text-accent-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground transition-all h-9 px-4 has-[>svg]:px-3 cursor-pointer' type='button'>Login</Link>
    </>
  )
}

export default Header
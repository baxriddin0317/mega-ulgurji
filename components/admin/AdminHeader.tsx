"use client"
import React from 'react'
import { FiSidebar } from 'react-icons/fi'
import { Button } from '../ui/button'
import { useSidebarStore } from '@/store/useToggleStore';
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet"
import MobileMenu from './MobileMenu';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';

const AdminHeader = () => {
  const { toggle } = useSidebarStore();
  const {logout} = useAuthStore();
  return (
    <header className="sticky z-50 top-0 bg-white shadow-bottom-only p-4 px-6 flex items-center justify-between">
      <div>
        <Button onClick={toggle} className='hidden lg:inline-block cursor-pointer' variant={'ghost'}>
          <FiSidebar />
        </Button>
        <Sheet >
          <SheetTrigger className='lg:hidden cursor-pointer size-10 flex justify-center items-center'><FiSidebar /></SheetTrigger>
          <MobileMenu />
        </Sheet>
      </div>
      <div className='flex items-center gap-3'>
        <Link className='flex items-center h-9 px-4 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90' href={'/'}>
          Go to Home
        </Link>
        {/* avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer'>
            <Avatar className='size-10'>
              <AvatarImage src="" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem className='cursor-pointer' onClick={logout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default AdminHeader
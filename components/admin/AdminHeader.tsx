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
import NotificationPanel from './NotificationPanel';

const AdminHeader = () => {
  const { toggle } = useSidebarStore();
  const {logout} = useAuthStore();
  return (
    <header className="sticky z-50 top-0 bg-white shadow-bottom-only p-3 px-4 sm:p-4 sm:px-6 flex items-center justify-between">
      <div>
        {/* Desktop sidebar toggle */}
        <Button onClick={toggle} className='hidden lg:inline-block cursor-pointer' variant={'ghost'}>
          <FiSidebar />
        </Button>
        {/* Mobile hamburger — hidden since we have BottomNav, but kept for tablet */}
        <Sheet>
          <SheetTrigger className='lg:hidden cursor-pointer size-9 flex justify-center items-center'><FiSidebar /></SheetTrigger>
          <MobileMenu />
        </Sheet>
      </div>
      <div className='flex items-center gap-2 sm:gap-3'>
        <NotificationPanel />
        {/* "Back to store" link — desktop only */}
        <Link className='hidden sm:flex items-center h-9 px-4 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 text-sm' href={'/'}>
          Bosh sahifaga qaytish
        </Link>
        {/* avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer'>
            <Avatar className='size-9 sm:size-10'>
              <AvatarImage src="" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">Bosh sahifaga qaytish</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer' onClick={logout}>Chiqish</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default AdminHeader

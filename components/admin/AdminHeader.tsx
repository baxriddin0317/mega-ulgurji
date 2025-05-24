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

const AdminHeader = () => {
  const { isOpen, toggle } = useSidebarStore();
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
        <div className='size-10 rounded-full bg-link-hover cursor-pointer'>

        </div>
      </div>
    </header>
  )
}

export default AdminHeader
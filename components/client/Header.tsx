"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useRef } from 'react'
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
import useProductStore from '@/store/useProductStore';
import { Search, ShoppingCart, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCartProductStore from '@/store/useCartStore';
import { matchesSearch } from '@/lib/searchMatch';

const Header = ({ forceFixed = false }: { forceFixed?: boolean }) => {
  const [fixed, setFixed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, logout } = useAuthStore();
  const { cartProducts } = useCartProductStore();
  const { products, fetchProducts } = useProductStore();
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (forceFixed) { setFixed(true); return; }
    const handleScroll = () => setFixed(document.documentElement.scrollTop > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [forceFixed]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredProducts = searchQuery.length >= 2
    ? products.filter((p) => (
        matchesSearch(p.title, searchQuery) ||
        matchesSearch(p.category ?? '', searchQuery)
      )).slice(0, 6)
    : [];

  return (
    <header className={`${fixed ? 'py-4 bg-black/80 rounded-full' : 'py-8'} sticky max-w-7xl w-full flex items-center justify-between mx-auto transition-all duration-500 px-6 md:px-8 lg:px-20 top-4 z-50`}>
      <Link href={'/'} className="relative flex w-6 h-8">
        <Image className="absolute size-full object-cover" src="/images/logo.png" fill alt="site logo" />
      </Link>

      {/* Search bar */}
      <div ref={searchRef} className="relative hidden md:block flex-1 max-w-xs mx-6">
        <div className="flex items-center bg-white/10 rounded-xl px-3 h-9 border border-white/20 focus-within:bg-white/20 transition-colors">
          <Search className="size-4 text-gray-400 shrink-0" />
          <input
            className="bg-transparent text-white placeholder:text-gray-400 text-sm px-2 w-full focus:outline-none"
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchOpen(false); }} className="cursor-pointer">
              <X className="size-4 text-gray-400" />
            </button>
          )}
        </div>
        {searchOpen && filteredProducts.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  router.push(`/product/${p.id}`);
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              >
                {p.productImageUrl?.[0] && (
                  <img src={p.productImageUrl[0].url} alt="" className="size-8 rounded-md object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="hidden md:flex items-center gap-10">
        <Links />
        {!isAuthenticated ? (
          <Link href={'/login'} className='flex items-center bg-white rounded-md text-accent-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground transition-all h-9 px-4 has-[>svg]:px-3 cursor-pointer' type='button'>Hisobga kirish</Link>
        ) : (
          <>
          <Link href="/cart-product" className="relative" aria-label="Savat">
            <ShoppingCart className="size-5 text-white" />
            {cartProducts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                {cartProducts.length}
              </span>
            )}
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className='cursor-pointer'>
              <Avatar className='size-10'>
                <AvatarImage src="" />
                <AvatarFallback>{useAuthStore.getState().userData?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MH'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Mening hisobim</DropdownMenuLabel>
              {isAdmin() && (
                <DropdownMenuItem className='cursor-pointer'>
                  <Link href="/admin">Adminga o&apos;tish</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='cursor-pointer'>
                <Link href="/history-order">Buyurtmalar tarixi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer' onClick={logout}>Chiqish</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        )}
      </nav>

      {/* Mobile */}
      <Sheet>
        <SheetTrigger className='md:hidden text-white cursor-pointer'>
          <IoIosMenu size={28} />
        </SheetTrigger>
        <SheetContent side='top' className="w-full h-[60vh] bg-black/80 border-none">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu</SheetTitle>
            {/* Mobile search */}
            <div className="px-6 pt-4">
              <div className="flex items-center bg-white/10 rounded-xl px-3 h-10 border border-white/20">
                <Search className="size-4 text-gray-400" />
                <input
                  className="bg-transparent text-white placeholder:text-gray-400 text-sm px-2 w-full focus:outline-none"
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery.length >= 2 && (
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.id}`}
                      className="block text-white text-sm px-3 py-2 hover:bg-white/10 rounded-lg"
                      onClick={() => setSearchQuery('')}
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <nav className="flex flex-col items-center gap-10 pt-6">
              <Links />
              {!isAuthenticated ? (
                <Link href={'/login'} className='flex items-center bg-white rounded-md text-accent-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground transition-all h-9 px-4 has-[>svg]:px-3 cursor-pointer' type='button'>Hisobga kirish</Link>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  {isAdmin() && (
                    <Link href="/admin" className="text-lg text-[#d1d1d1] hover:text-white">Adminga o&apos;tish</Link>
                  )}
                  <Link href="/history-order" className="text-lg text-[#d1d1d1] hover:text-white">Buyurtmalar tarixi</Link>
                  <button onClick={logout} className="text-lg text-[#d1d1d1] hover:text-white cursor-pointer">Chiqish</button>
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
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/'}>Bosh sahifa</Link>
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/#category'}>Katalog</Link>
      <Link className="text-lg text-[#d1d1d1] hover:text-white" href={'/#location'}>Manzil</Link>
    </>
  )
}

export default Header

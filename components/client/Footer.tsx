import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BiLogoTelegram } from 'react-icons/bi'
import { FiInstagram } from 'react-icons/fi'
import { Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className='bg-black py-16'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Left column: Logo + description */}
          <div>
            <div className='relative w-[192px] h-12 mb-4'>
              <Image className='absolute object-cover' src={'/images/black-logo.png'} fill alt='' />
            </div>
            <p className='text-gray-400 text-sm'>MegaHome — Eng yaxshi ulgurji narxlar</p>
          </div>

          {/* Middle column: Links */}
          <div>
            <h4 className='text-white font-bold mb-4'>Sahifalar</h4>
            <nav className='flex flex-col gap-2'>
              <Link href='/' className='text-gray-400 text-sm hover:text-white transition-colors'>Bosh sahifa</Link>
              <Link href='/#category' className='text-gray-400 text-sm hover:text-white transition-colors'>Katalog</Link>
              <Link href='/history-order' className='text-gray-400 text-sm hover:text-white transition-colors'>Buyurtmalar tarixi</Link>
              <Link href='/login' className='text-gray-400 text-sm hover:text-white transition-colors'>Kirish</Link>
            </nav>
          </div>

          {/* Right column: Contact */}
          <div>
            <h4 className='text-white font-bold mb-4'>Aloqa</h4>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center gap-2'>
                <Phone className='size-4 text-gray-400 shrink-0' />
                <span className='text-gray-400 text-sm'>+998 XX XXX XX XX</span>
              </div>
              <div className='flex items-center gap-2'>
                <MapPin className='size-4 text-gray-400 shrink-0' />
                <span className='text-gray-400 text-sm'>Toshkent, O&apos;zbekiston</span>
              </div>
              <div className='flex items-center gap-4 mt-2'>
                <Link href={'#'}>
                  <BiLogoTelegram className='text-gray-400 hover:text-white transition-colors' size={22} />
                </Link>
                <Link href={'#'}>
                  <FiInstagram className='text-gray-400 hover:text-white transition-colors' size={22} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='border-t border-gray-800 mt-10 pt-6'>
          <p className='text-gray-400 text-sm text-center'>&copy; 2026 MegaHome Ulgurji. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
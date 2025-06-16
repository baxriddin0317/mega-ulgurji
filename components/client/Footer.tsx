import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { BiLogoTelegram } from 'react-icons/bi'
import { FiInstagram } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className=' py-20'>
      <div data-aos="fade-up" className='container flex justify-between mx-auto px-4'>
        <div className='relative w-[192px] h-12'>
          <Image className='absolute object-cover' src={'/images/black-logo.png'} fill alt=''  />
        </div>
        <div className='flex items-center gap-8'>
          <Link href={'#'}>
            <FiInstagram className='text-white' size={24} />
          </Link>
          <Link href={'#'}>
            <BiLogoTelegram className='text-white' size={24} />
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
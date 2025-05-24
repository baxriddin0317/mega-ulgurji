import Image from 'next/image'
import React from 'react'

const ProductCard = () => {
  return (
    <div className='cursor-pointer group'>
      <div className='relative w-full h-64 overflow-hidden rounded-xl mb-3'>
        <Image className='absolute object-cover group-hover:scale-105 transition-all duration-500' src={'/images/banner-2.jpg'} fill alt='' />
      </div>
      <h3 className='font-bold text-lg md:text-xl'>Stol va stullar to'plami</h3>
      <p className='font-semibold text-brand-gray-200'>1 300 000 so'm</p>
    </div>
  )
}

export default ProductCard
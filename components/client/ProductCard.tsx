import { FormattedPrice } from '@/hooks'
import { ProductT } from '@/lib/types'
import Image from 'next/image'
import React from 'react'

interface ProductProps {
  product: ProductT
}

const ProductCard = ({product}: ProductProps) => {
  return (
    <div className='cursor-pointer group'>
      <div className='relative w-full h-64 overflow-hidden rounded-xl mb-3'>
        <Image className='absolute object-cover group-hover:scale-105 transition-all duration-500' src={product.productImageUrl[0].url} fill alt='' />
      </div>
      <h3 className='font-bold text-lg md:text-xl'>{product.title}</h3>
      <p className='font-semibold text-brand-gray-200'>{FormattedPrice(product.price)} UZS</p>
    </div>
  )
}

export default ProductCard
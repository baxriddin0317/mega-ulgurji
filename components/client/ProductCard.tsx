import { FormattedPrice } from '@/hooks'
import { ProductT } from '@/lib/types'
import Image from 'next/image'
import React from 'react'
import { useAuthStore } from '@/store/authStore'

interface ProductProps {
  product: ProductT
}

const ProductCard = ({product}: ProductProps) => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className='cursor-pointer group'>
      <div className='relative w-full h-64 overflow-hidden rounded-xl mb-3'>
        <Image className='absolute object-cover group-hover:scale-105 transition-all duration-500' src={product.productImageUrl[0].url} fill alt='' />
      </div>
      <h3 className='font-bold text-lg md:text-xl'>{product.title}</h3>
      {isAuthenticated ? (
        <p className='font-semibold text-brand-gray-200'>{FormattedPrice(product.price)} UZS</p>
      ) : (
        <p className='font-semibold text-red-500'>Narxni ko‘rish uchun ro‘yxatdan o‘ting</p>
      )}
    </div>
  )
}

export default ProductCard
import { FormattedPrice } from '@/hooks'
import { ProductT } from '@/lib/types'
import Image from 'next/image'
import React from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

interface ProductProps {
  product: ProductT
}

const ProductCard = ({product}: ProductProps) => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <div className='cursor-pointer group'>
      <div className='relative w-full h-64 overflow-hidden rounded-xl mb-3'>
        {product.productImageUrl && product.productImageUrl.length > 0 ? <Image className='absolute object-cover group-hover:scale-105 transition-all duration-500' src={product.productImageUrl[0].url} fill alt='' /> : <div className='absolute size-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs'>Rasm yo&apos;q</div>}
      </div>
      <Link href={`/product/${product.id}`}>
        <h3 className='font-bold text-lg md:text-xl line-clamp-1'>{product.title}</h3>
        {isAuthenticated ? (
          <p className='font-semibold text-brand-gray-200'>{FormattedPrice(product.price)} UZS</p>
        ) : (
          <p className='text-xs md:text-base font-semibold text-red-500'>Narxni ko‘rish uchun ro‘yxatdan o‘ting</p>
        )}
      </Link>
    </div>
  )
}

export default ProductCard
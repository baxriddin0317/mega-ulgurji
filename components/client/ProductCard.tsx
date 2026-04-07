import { formatUZS } from '@/lib/formatPrice'
import { ProductT } from '@/lib/types'
import Image from 'next/image'
import React from 'react'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import WishlistButton from './WishlistButton'
import ShareButton from './ShareButton'

interface ProductProps {
  product: ProductT
}

const ProductCard = ({product}: ProductProps) => {
  const { isAuthenticated } = useAuthStore();

  // undefined stock = product existed before stock system = treat as available
  const hasStock = product.stock !== undefined && product.stock !== null;
  const outOfStock = hasStock && (product.stock as number) <= 0;

  return (
    <Link href={`/product/${product.id}`} className={`cursor-pointer group block ${outOfStock ? 'opacity-60' : ''}`}>
      <div className='relative w-full h-64 overflow-hidden rounded-xl mb-3'>
        {product.productImageUrl && product.productImageUrl.length > 0 ? <Image className='absolute object-cover group-hover:scale-105 transition-all duration-500' src={product.productImageUrl[0].url} fill alt='' /> : <div className='absolute size-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs'>Rasm yo&apos;q</div>}
        {outOfStock ? (
          <div className='absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10'>
            Mavjud emas
          </div>
        ) : hasStock && (product.stock as number) <= 10 ? (
          <div className='absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10'>
            Faqat {product.stock} ta qoldi!
          </div>
        ) : null}
        {/* Wishlist + Share buttons */}
        <div className='absolute top-2 right-2 flex flex-col gap-1.5 z-10'>
          <WishlistButton productId={product.id} className='bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors' />
          <ShareButton product={{ title: product.title, price: product.price, id: product.id }} className='bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm hover:bg-white transition-colors' />
        </div>
      </div>
      <h3 className='font-bold text-lg md:text-xl line-clamp-1'>{product.title}</h3>
      {isAuthenticated ? (
        <p className='font-semibold text-brand-gray-200'>{formatUZS(product.price)}</p>
      ) : (
        <p className='text-xs md:text-base font-semibold text-red-500'>Narxni ko&apos;rish uchun ro&apos;yxatdan o&apos;ting</p>
      )}
    </Link>
  )
}

export default ProductCard

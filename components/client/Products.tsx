"use client"
import React from 'react'
import ProductCard from './ProductCard'
import { ProductT } from '@/lib/types';

interface Props {
  products: ProductT[]
}

const Products = ({products}: Props) => {
  return (
    <section className='py-8 sm:py-12 px-4 sm:px-8' id="products">
      <div className="max-w-7xl mx-auto">
        {/* Result count */}
        <p className="text-sm text-gray-400 mb-6">
          {products.length} ta mahsulot
        </p>

        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'>
          {products.map((item) => (
            <ProductCard product={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Products

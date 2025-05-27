import React from 'react'
import ProductCard from './ProductCard'
import { ProductT } from '@/lib/types';

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

interface Props {
  products: ProductT[]
}

const Products = ({products}: Props) => {
  const chunkedProducts = chunkArray(products, 4);
  return (
    <section className='py-20 px-4' id="products">
      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        {chunkedProducts.map((group, index) => (
          <div data-aos="fade-up" className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5' key={index}>
            {group.map((item, i) => (
              <ProductCard product={item} key={i} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Products
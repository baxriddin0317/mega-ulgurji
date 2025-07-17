import React, { useState, useEffect } from 'react'
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

const getChunkSize = (width: number) => {
  if (width < 768) return 2; // mobile
  if (width < 1024) return 3; // md
  return 4; // lg and up
};

const Products = ({products}: Props) => {
  const [chunkSize, setChunkSize] = useState(getChunkSize(typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    const handleResize = () => {
      setChunkSize(getChunkSize(window.innerWidth));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chunkedProducts = chunkArray(products, chunkSize);
  return (
    <section className='pt-5 pb-20 px-4' id="products">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 lg:gap-14">
        {chunkedProducts.map((group, index) => (
          <div data-aos="fade-up" className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-10' key={index}>
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
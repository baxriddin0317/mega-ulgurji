import React from 'react'
import ProductCard from './ProductCard'

const products = Array(11).fill(null); // Misol uchun 11 ta product bor

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const Products = () => {
  const chunkedProducts = chunkArray(products, 4);
  return (
    <section className='py-20 px-4' id="products">
      <div data-aos="fade-up" className='text-center mb-8 md:mb-12'>
        <h2 className='text-3xl font-bold mb-4'>
          Elektronika mahsulotlari
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eum amet suscipit iusto facere rerum tenetur ea alias itaque?
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-5">
        {chunkedProducts.map((group, index) => (
          <div data-aos="fade-up" className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5' key={index}>
            {group.map((_, i) => (
              <ProductCard key={i} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Products
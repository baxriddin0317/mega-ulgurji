"use client"
import React, { useEffect, useMemo } from 'react'
import Header from './Header'
import Products from './Products'
import LocationSection from './LocationSection'
import useCategoryStore from '@/store/useCategoryStore'
import useProductStore from '@/store/useProductStore'
import AOSWrapper from '@/components/client/AOSWrapper'

const CategoryContent = ({slug}: {slug:string}) => {
  const { category, fetchSingleCategory } = useCategoryStore()
  const { products, fetchProducts } = useProductStore()

  useEffect(() => {
    fetchProducts();
    fetchSingleCategory(slug);    
  }, [fetchSingleCategory, fetchProducts, slug]);

   // Search filter logic
   const filteredProducts = useMemo(() => {
     return products.filter(product => product.category === category?.name);
   }, [products, category]);
   
  return (
    <AOSWrapper>
      <div className={`relative h-[95vh] bg-no-repeat bg-cover bg-fixed bg-center`} style={{backgroundImage: `url(${category?.categoryImgUrl[0].url})`}}>
        <div className="bg-black/90 absolute size-full left-0 top-0"></div>
        {/* header start */}
        <Header />
        {/* header end */}
        {/* hero section srart */}
        <section id="hero" className="max-w-7xl mx-auto pt-48 px-4 sm:pl-10 lg:pl-40 relative z-10">
          <div data-aos="fade-up" className="max-w-2xl">
              <h1 className="text-5xl text-[#d1d1d1] capitalize">
                {category?.name}
              </h1>
              <p className="text-3xl md:text-4xl mt-2 text-white/70">
                {category?.description}
              </p>
          </div>
        </section>
        {/* hero section end */}
      </div>
      <div className="py-10"></div>
      <Products products={filteredProducts} />
      <LocationSection />
    </AOSWrapper>
  )
}

export default CategoryContent
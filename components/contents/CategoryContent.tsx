"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Header from '../client/Header'
import Products from '../client/Products'
import LocationSection from '../client/LocationSection'
import useCategoryStore from '@/store/useCategoryStore'
import useProductStore from '@/store/useProductStore'
import AOSWrapper from '@/components/client/AOSWrapper'
import { Button } from '../ui/button'

const CategoryContent = ({slug}: {slug:string}) => {
  const { category, fetchSingleCategory } = useCategoryStore()
  const { products, fetchProducts } = useProductStore()

  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    fetchSingleCategory(slug);    
  }, [fetchSingleCategory, fetchProducts, slug]);

   // Search filter logic
   const filteredProducts = useMemo(() => {
     let filtered = products.filter(product => product.category === category?.name);
     if (activeSubcategory !== 'all' && category?.subcategory?.length) {
       filtered = filtered.filter(product => product.subcategory === activeSubcategory);
     }
     return filtered;
   }, [products, category, activeSubcategory]);
   
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
              <h1 className="text-4xl md:text-5xl text-[#d1d1d1] capitalize">
                {category?.name}
              </h1>
              <p className="text-lg sm:text-xl md:text-xl lg:text-3xl xl:text-4xl mt-2 text-white/70 ">
                {category?.description}
              </p>
          </div>
        </section>
        {/* hero section end */}
      </div>
      <div className="py-10"></div>
      {/* Subcategory filter start */}
      {category?.subcategory && category.subcategory.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2">
          <Button
            variant={"default"}
            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeSubcategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
            onClick={() => setActiveSubcategory('all')}
          >
            Barchasi
          </Button>
          {category.subcategory.map((subcat: string) => (
            <Button
              variant={"default"}
              key={subcat}
              className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeSubcategory === subcat ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
              onClick={() => setActiveSubcategory(subcat)}
            >
              {subcat}
            </Button>
          ))}
        </div>
      )}
      {/* Subcategory filter end */}
      <Products products={filteredProducts} />
      <LocationSection />
    </AOSWrapper>
  )
}

export default CategoryContent
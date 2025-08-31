"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Header from '../client/Header'
import Products from '../client/Products'
import LocationSection from '../client/LocationSection'
import useCategoryStore from '@/store/useCategoryStore'
import useProductStore from '@/store/useProductStore'
import AOSWrapper from '@/components/client/AOSWrapper'
import { Button } from '../ui/button'
import Search from '@/components/admin/Search'

const CategoryContent = ({slug}: {slug:string}) => {
  const { category, fetchSingleCategory } = useCategoryStore()
  const { products, fetchProducts } = useProductStore()

  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchSingleCategory(slug);    
  }, [fetchSingleCategory, fetchProducts, slug]);

  // Derived collections and counts
  const productsInCategory = useMemo(() => (
    products.filter(product => product.category === category?.name)
  ), [products, category?.name]);

  const allInCategoryCount = productsInCategory.length;

  const subcategoryCounts: Record<string, number> = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of productsInCategory) {
      if (!product.subcategory) continue;
      counts[product.subcategory] = (counts[product.subcategory] ?? 0) + 1;
    }
    return counts;
  }, [productsInCategory]);

  // Search + subcategory filter logic
  const filteredProducts = useMemo(() => {
    let filtered = productsInCategory;
    if (activeSubcategory !== 'all' && category?.subcategory?.length) {
      filtered = filtered.filter(product => product.subcategory === activeSubcategory);
    }
    if (search.trim().length >= 2) {
      const needle = search.toLowerCase();
      filtered = filtered.filter(product => product.title.toLowerCase().includes(needle));
    }
    return filtered;
  }, [productsInCategory, category, activeSubcategory, search]);
   
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
      
      {/* Search */}
      <div className="max-w-7xl mx-auto">
        <Search search={search} handleSearchChange={setSearch} placeholder='Mahsulotlarni qidirish' />
      </div>

      {/* Subcategory filter start */}
      {category?.subcategory && category.subcategory.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2">
          <Button
            variant={"default"}
            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeSubcategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
            onClick={() => setActiveSubcategory('all')}
          >
            Barchasi ({allInCategoryCount})
          </Button>
          {category.subcategory.map((subcat: string) => (
            <Button
              variant={"default"}
              key={subcat}
              className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeSubcategory === subcat ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
              onClick={() => setActiveSubcategory(subcat)}
            >
              {subcat} ({subcategoryCounts[subcat] ?? 0})
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
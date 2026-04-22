"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Header from '../client/Header'
import Products from '../client/Products'
import LocationSection from '../client/LocationSection'
import useCategoryStore from '@/store/useCategoryStore'
import useProductStore from '@/store/useProductStore'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { ImageAutoSlider } from '@/components/ui/image-auto-slider'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import Image from 'next/image'
import { matchesSearch } from '@/lib/searchMatch'

const CategoryContent = ({slug}: {slug:string}) => {
  const { category, fetchSingleCategory } = useCategoryStore()
  const { products, fetchProducts } = useProductStore()
  const heroRef = useRef<HTMLDivElement>(null)

  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    fetchSingleCategory(slug);
  }, [fetchSingleCategory, fetchProducts, slug]);

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

  const filteredProducts = useMemo(() => {
    let filtered = productsInCategory;
    if (activeSubcategory !== 'all' && category?.subcategory?.length) {
      filtered = filtered.filter(product => product.subcategory === activeSubcategory);
    }
    if (search.trim().length >= 2) {
      filtered = filtered.filter((product) => (
        matchesSearch(product.title, search) ||
        matchesSearch(product.subcategory ?? '', search)
      ));
    }
    return filtered;
  }, [productsInCategory, category, activeSubcategory, search]);

  // Product images for the auto-slider
  const sliderImages = useMemo(() =>
    productsInCategory
      .filter(p => p.productImageUrl?.length > 0)
      .map(p => ({ url: p.productImageUrl[0].url, alt: p.title }))
      .slice(0, 14),
    [productsInCategory]
  );

  return (
    <main className="bg-white min-h-screen">
      {/* ═══════════════════ CATEGORY HERO ═══════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />
        {category?.categoryImgUrl?.[0]?.url && (
          <Image
            src={category.categoryImgUrl[0].url}
            alt={category.name || ''}
            fill
            className="absolute inset-0 object-cover opacity-20"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <Header />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-36 sm:pt-44 pb-16">
          <TimelineContent as="div" animationNum={1} timelineRef={heroRef}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-1.5 mb-6"
          >
            <span className="size-2 rounded-full bg-[#00bad8]" />
            <span className="text-sm text-gray-300">{allInCategoryCount} ta mahsulot</span>
          </TimelineContent>

          <TimelineContent as="h1" animationNum={2} timelineRef={heroRef}
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white capitalize leading-tight max-w-3xl"
          >
            {category?.name}
          </TimelineContent>

          {category?.description && (
            <TimelineContent as="p" animationNum={3} timelineRef={heroRef}
              className="text-lg text-gray-400 mt-4 max-w-2xl leading-relaxed"
            >
              {category.description}
            </TimelineContent>
          )}
        </div>

        {/* Hero bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* ═══════════════════ PRODUCT IMAGE SLIDER ═══════════════════ */}
      {sliderImages.length > 4 && (
        <section className="bg-black py-8 sm:py-10 overflow-hidden">
          <ImageAutoSlider images={sliderImages} speed="normal" size="md" />
        </section>
      )}

      {/* ═══════════════════ SEARCH + FILTERS ═══════════════════ */}
      <section className="bg-white sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Mahsulotlarni qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00bad8]/30 focus:bg-white border border-transparent focus:border-[#00bad8]/30 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <X className="size-3.5 text-gray-400" />
                </button>
              )}
            </div>
            {category?.subcategory && category.subcategory.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
                <SlidersHorizontal className="size-4" />
                <span>{category.subcategory.length} ta filtr</span>
              </div>
            )}
          </div>

          {/* Subcategory pills */}
          {category?.subcategory && category.subcategory.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
              <button
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSubcategory === 'all'
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setActiveSubcategory('all')}
              >
                Barchasi ({allInCategoryCount})
              </button>
              {category.subcategory.map((subcat: string) => (
                <button
                  key={subcat}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    activeSubcategory === subcat
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveSubcategory(subcat)}
                >
                  {subcat} ({subcategoryCounts[subcat] ?? 0})
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ PRODUCTS GRID ═══════════════════ */}
      {filteredProducts.length === 0 ? (
        <section className="py-24 text-center">
          <div className="max-w-sm mx-auto">
            <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="size-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mahsulot topilmadi</h3>
            <p className="text-sm text-gray-500">
              {search ? `"${search}" bo'yicha natija topilmadi` : 'Bu kategoriyada hozircha mahsulot yo\'q'}
            </p>
            {(search || activeSubcategory !== 'all') && (
              <button
                onClick={() => { setSearch(''); setActiveSubcategory('all'); }}
                className="mt-4 text-sm font-medium text-[#00bad8] hover:underline cursor-pointer"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        </section>
      ) : (
        <Products products={filteredProducts} />
      )}

      {/* ═══════════════════ LOCATION ═══════════════════ */}
      <LocationSection />
    </main>
  )
}

export default CategoryContent

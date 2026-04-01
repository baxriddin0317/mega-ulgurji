"use client"
import PanelTitle from '@/components/admin/PanelTitle';
import ProductTable from '@/components/admin/ProductTable';
import Search from '@/components/admin/Search';
import React, { useMemo, useState } from 'react'
import useCategoryStore from '@/store/useCategoryStore';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useProductStore from '@/store/useProductStore';
import { exportProductsToExcel } from '@/lib/exportExcel';
import BulkPriceUpdateModal from '@/components/admin/BulkPriceUpdateModal';
import { Download, Percent, Plus, FolderPlus } from 'lucide-react';
import Link from 'next/link';

const CategoryFilter = ({ activeCategory, setActiveCategory, categoryCounts, totalCount }: { activeCategory: string, setActiveCategory: (cat: string) => void, categoryCounts: Record<string, number>, totalCount: number }) => {
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-4">
      <Button
        variant={"default"}
        className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
        onClick={() => setActiveCategory('all')}
      >
        Barchasi ({totalCount})
      </Button>
      {categories.map((cat) => (
        <Button
          variant={"default"}
          key={cat.id}
          className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeCategory === cat.name ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
          onClick={() => setActiveCategory(cat.name)}
        >
          {cat.name} ({categoryCounts[cat.name] ?? 0})
        </Button>
      ))}
    </div>
  );
};

const Products = () => {
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const { categories } = useCategoryStore();
  const { products, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e: string) => {
    setSearch(e)
  }

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setActiveSubcategory('all');
  };

  const SubcategoryFilter = ({
    activeCategory,
    activeSubcategory,
    setActiveSubcategory,
  }: {
    activeCategory: string;
    activeSubcategory: string;
    setActiveSubcategory: (subcat: string) => void;
  }) => {
    const selectedCategory = categories.find((cat) => cat.name === activeCategory);

    // Compute memoized values before any early returns to satisfy hooks rules
    const productsInCategory = useMemo(() => (
      products.filter((p) => p.category === activeCategory)
    ), [activeCategory]);

    const allInCategoryCount = productsInCategory.length;

    const subcategoryCounts: Record<string, number> = useMemo(() => {
      const counts: Record<string, number> = {};
      for (const p of productsInCategory) {
        if (!p.subcategory) continue;
        counts[p.subcategory] = (counts[p.subcategory] ?? 0) + 1;
      }
      return counts;
    }, [productsInCategory]);

    if (!selectedCategory || !selectedCategory.subcategory || selectedCategory.subcategory.length === 0) {
      return null;
    }

    return (
      <div className='px-4 pb-4'>
        <h3 className='text-sm font-medium mb-2 pl-1'>Subkategoriya boyicha filter</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={"default"}
            className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeSubcategory === 'all' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
            onClick={() => setActiveSubcategory('all')}
          >
            Barchasi ({allInCategoryCount})
          </Button>
          {selectedCategory.subcategory.map((subcat: string) => (
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
      </div>
    );
  };

  return (
    <div>
      <PanelTitle title='Mahsulotlar' />
      <div className="flex gap-2 px-4 pb-4">
        <Link href="/admin/create-product">
          <Button className="rounded-xl cursor-pointer text-sm gap-1.5 bg-black text-white hover:bg-black/90">
            <Plus className="size-4" /> Mahsulot qo&apos;shish
          </Button>
        </Link>
        <Link href="/admin/create-category">
          <Button variant="outline" className="rounded-xl cursor-pointer text-sm gap-1.5">
            <FolderPlus className="size-4" /> Kategoriya qo&apos;shish
          </Button>
        </Link>
      </div>
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Mahsulotlarni qidirish' />
      <CategoryFilter
        activeCategory={activeCategory}
        setActiveCategory={handleCategoryChange}
        categoryCounts={useMemo(() => {
          const counts: Record<string, number> = {};
          for (const p of products) {
            counts[p.category] = (counts[p.category] ?? 0) + 1;
          }
          return counts;
        }, [products])}
        totalCount={products.length}
      />
      <SubcategoryFilter
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
      />
      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-3">
        <Button
          variant="outline"
          className="rounded-xl cursor-pointer text-xs h-8 gap-1"
          onClick={() => setShowBulkUpdate(true)}
        >
          <Percent className="size-3.5" /> Narxni ommaviy yangilash
        </Button>
        <Button
          variant="outline"
          className="rounded-xl cursor-pointer text-xs h-8 gap-1"
          onClick={() => {
            const filtered = activeCategory === 'all'
              ? products
              : products.filter((p) => p.category === activeCategory);
            exportProductsToExcel(filtered, `mahsulotlar_${activeCategory}`);
          }}
        >
          <Download className="size-3.5" /> Excel yuklab olish
        </Button>
      </div>

      <ProductTable search={search} category={activeCategory} subcategory={activeSubcategory} />

      {showBulkUpdate && (
        <BulkPriceUpdateModal
          productIds={
            (activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory))
              .map((p) => p.id)
          }
          onClose={() => setShowBulkUpdate(false)}
        />
      )}
    </div>
  )
}

export default Products
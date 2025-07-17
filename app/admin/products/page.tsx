"use client"
import PanelTitle from '@/components/admin/PanelTitle';
import ProductTable from '@/components/admin/ProductTable';
import Search from '@/components/admin/Search';
import React, { useState } from 'react'
import useCategoryStore from '@/store/useCategoryStore';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const CategoryFilter = ({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (cat: string) => void }) => {
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
        Barchasi
      </Button>
      {categories.map((cat) => (
        <Button
          variant={"default"}
          key={cat.id}
          className={`cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all ${activeCategory === cat.name ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-100/90 text-black'}`}
          onClick={() => setActiveCategory(cat.name)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );
};

const Products = () => {
  const [search, setSearch] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('all');
  const { categories } = useCategoryStore();

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
            Barchasi
          </Button>
          {selectedCategory.subcategory.map((subcat: string) => (
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
      </div>
    );
  };

  return (
    <div>
      <PanelTitle title='Mahsulotlar' />
      <Search search={search} handleSearchChange={handleSearchChange} placeholder='Mahsulotlarni qidirish' />
      <CategoryFilter activeCategory={activeCategory} setActiveCategory={handleCategoryChange} />
      <SubcategoryFilter
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        setActiveSubcategory={setActiveSubcategory}
      />
      <ProductTable search={search} category={activeCategory} subcategory={activeSubcategory} />
    </div>
  )
}

export default Products
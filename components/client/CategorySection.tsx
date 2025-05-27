"use client"
import useCategoryStore from '@/store/useCategoryStore'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'

const CategorySection = () => {
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <section className='pb-8' id='category'>
      <div className='text-center mb-8 md:mb-12'>
        <h2 className='text-3xl font-bold mb-4'>
          Mahsulot kategoriyalari
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Bizning mahsulotlarimizni kategoriyalar bo&apos;yicha ko&apos;rishingiz mumkin. Har bir kategoriya sifatli maxsulotlar bilan to&apos;ldirilgan.
        </p>
      </div>
      {categories.map((item, idx) => (
        <div key={item.id} data-aos="fade-up" className={`max-w-6xl mx-auto px-8 md:px-12 lg:px-14 mb-12 md:mb-32 lg:mb-52 ${categories.length == idx+1 ? '!mb-0' : ''}`}>
          <div className='relative overflow-hidden rounded-md w-full h-52 md:h-80 lg:h-[400px] mb-5 md:mb-10'>
            <Image className='absolute object-cover' src={item.categoryImgUrl[0].url} fill alt={item.name} />
          </div>
          <div className='pl-4 md:pl-14'>
            <h3 className='text-2xl font-semibold capitalize mb-4'>
              {item.name}
            </h3>
            <p className='text-xl text-brand-gray-200 md:w-3/4 mb-8 lg:pl-4'>
              {item.description}
            </p>
            <Link href={`/category/${item.id}`} className='transition-all duration-500 border border-black hover:border-[#00bad8] text-brand-gray-200 font-bold py-3 px-7 text-xs lg:ml-4'>
              Katalogni ko&apos;rish
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}

export default CategorySection
"use client"
import useCategoryStore from '@/store/useCategoryStore'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { TimelineContent } from '@/components/ui/timeline-animation'
import { ArrowRight } from 'lucide-react'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const CategorySection = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (categories.length === 0) return null;

  return (
    <section ref={sectionRef} className='bg-white py-20 sm:py-28' id='category'>
      <div className='max-w-7xl mx-auto px-4 sm:px-8'>
        <TimelineContent as="div" animationNum={0} timelineRef={sectionRef} className="text-center mb-14">
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
            Mahsulot kategoriyalari
          </h2>
          <p className='text-lg text-gray-500 max-w-2xl mx-auto'>
            Bizning mahsulotlarimizni kategoriyalar bo&apos;yicha ko&apos;ring.
            Har bir kategoriya sifatli mahsulotlar bilan to&apos;ldirilgan.
          </p>
        </TimelineContent>

        <div className='grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
          {categories.map((item, idx) => (
            <TimelineContent
              as="div"
              key={item.id}
              animationNum={idx + 1}
              timelineRef={sectionRef}
            >
              <Link
                href={`/category/${item.id}`}
                className='group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100'
              >
                {/* Image */}
                {item.categoryImgUrl?.[0]?.url && (
                  <Image
                    src={item.categoryImgUrl[0].url}
                    alt={item.name}
                    fill
                    className='object-cover group-hover:scale-105 transition-transform duration-700'
                  />
                )}

                {/* Gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

                {/* Progressive blur at bottom */}
                <ProgressiveBlur
                  className='pointer-events-none absolute bottom-0 left-0 h-[40%] w-full'
                  blurIntensity={0.4}
                />

                {/* Content */}
                <div className='absolute bottom-0 left-0 right-0 p-4 sm:p-6'>
                  <h3 className='text-lg sm:text-xl lg:text-2xl font-bold text-white capitalize leading-tight'>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className='text-sm text-white/70 mt-1 line-clamp-2 hidden sm:block'>
                      {item.description}
                    </p>
                  )}
                  <div className='inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#00bad8] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300'>
                    Ko&apos;rish
                    <ArrowRight className='size-3.5' />
                  </div>
                </div>
              </Link>
            </TimelineContent>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CategorySection

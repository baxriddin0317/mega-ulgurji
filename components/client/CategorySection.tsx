import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const categories = [
  {
    id: 1,
    img: "/images/banner-2.jpg",
    title: "Elektronika",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
  {
    id: 2,
    img: "/images/sliderbg.jpg",
    title: "Mebellar",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
  {
    id: 3,
    img: "/images/banner-2.jpg",
    title: "Kiyim-Kechak",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
  {
    id: 4,
    img: "/images/sliderbg.jpg",
    title: "Maishiy texnika",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
  {
    id: 5,
    img: "/images/banner-2.jpg",
    title: "Go'zallik",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
  {
    id: 6,
    img: "/images/sliderbg.jpg",
    title: "Sport",
    description: "A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime."
  },
]

const CategorySection = () => {
  return (
    <section className='pb-8' id='category'>
      <div className='text-center mb-8 md:mb-12'>
        <h2 className='text-3xl font-bold mb-4'>
          Mahsulot kategoriyalari
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Bizning mahsulotlarimizni kategoriyalar bo'yicha ko'rishingiz mumkin. Har bir kategoriya sifatli maxsulotlar bilan to'ldirilgan.
        </p>
      </div>
      {categories.map((item, idx) => (
        <div key={item.id} data-aos="fade-up" className={`max-w-6xl mx-auto px-8 md:px-12 lg:px-14 mb-52 md:mb-80 lg:mb-[400px] ${categories.length == idx+1 ? '!mb-0' : ''}`}>
          <div className='relative overflow-hidden rounded-md w-full h-52 md:h-80 lg:h-[400px]'>
            <Image className='absolute object-cover' src={item.img} fill alt='category image' />
          </div>
          <div className='pl-4 md:pl-14 mt-10'>
            <h3 className='text-2xl font-semibold capitalize mb-4'>
              {item.title}
            </h3>
            <p className='text-xl text-brand-gray-200 md:w-3/4 mb-8 lg:pl-4'>
              {item.description}
            </p>
            <Link className='transition-all duration-500 border border-black hover:border-[#00bad8] text-brand-gray-200 font-bold py-3 px-7 text-xs lg:ml-4' href={`/category/${item.id}`}>
              Katalogni ko'rish
            </Link>
          </div>
        </div>
      ))}
    </section>
  )
}

export default CategorySection
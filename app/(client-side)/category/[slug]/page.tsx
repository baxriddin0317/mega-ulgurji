"use client"
import AOSWrapper from '@/components/client/AOSWrapper'
import Header from '@/components/client/Header'
import LocationSection from '@/components/client/LocationSection'
import Products from '@/components/client/Products'
import React from 'react'

const Category = () => {
  return (
    <AOSWrapper>
      <div className="relative h-[95vh]">
        {/* header start */}
        <Header />
        {/* header end */}
        {/* hero section srart */}
        <section id="hero" className="max-w-7xl mx-auto pt-48 px-4 sm:pl-10 lg:pl-40 relative z-10">
          <div data-aos="fade-up" className="max-w-2xl">
              <h1 className="text-5xl text-[#d1d1d1]">
                Elektronika
              </h1>
              <p className="text-3xl md:text-4xl mt-2 text-white/70">
                A suspended seat we created both as a product and as a brand: a weightless and playful idea, inspired by springtime.
              </p>
          </div>
        </section>
        {/* hero section end */}
      </div>
      <div className="py-10"></div>
      <Products />
      <LocationSection />
    </AOSWrapper>
  )
}

export default Category
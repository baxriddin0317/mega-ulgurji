"use client"
import AOSWrapper from "@/components/client/AOSWrapper";
import CategorySection from "@/components/client/CategorySection";
import Header from "@/components/client/Header";
import LocationSection from "@/components/client/LocationSection";

export default function Home() {


  return (
    <AOSWrapper>
      <div className="relative h-[95vh] bg-[url(/images/banner-2.jpg)] bg-no-repeat bg-cover bg-fixed bg-center">
        <div className="bg-black/90 absolute size-full left-0 top-0"></div>
        {/* header start */}
        <Header />
        {/* header end */}
        {/* hero section srart */}
        <section id="hero" className="max-w-7xl mx-auto pt-48 px-4 sm:pl-10 lg:pl-40 relative z-10">
          <div data-aos="fade-up" className="max-w-2xl">
              <h1 className="text-5xl text-[#d1d1d1]">
                Sifatli mahsulotlar katalogi
              </h1>
              <p className="text-3xl md:text-4xl mt-2 text-white/70">
                Bizning katalog orqali siz eng sifatli va zamonaviy mahsulotlarimizni topishingiz mumkin.
              </p>
          </div>
        </section>
        {/* hero section end */}
      </div>
      <div className="py-10"></div>
      <CategorySection />
      <LocationSection />
    </AOSWrapper>
  );
}

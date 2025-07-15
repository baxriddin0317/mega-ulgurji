"use client";
import useProductStore from "@/store/useProductStore";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BsCartDash } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";
import { HiMinus } from "react-icons/hi";
import Image from "next/image";
import { FormattedPrice } from "@/utils";
import useCartProductStore from "@/store/useCartStore";
import { Button } from "../ui/button";
import { useAuthStore } from "@/store/authStore";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ProductItem = ({ id }: { id: string }) => {
  const { fetchSingleProduct, loading, product } = useProductStore();
  const { addToBasket, getItemQuantity, load, calculateTotals } = useCartProductStore();
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuthStore();
  const [currentImg, setCurrentImg] = useState(0);
  
  // navigate
  const navigate = useRouter();
  const quantityInBasket = getItemQuantity(id);
  
  useEffect(() => {
    if (id) {
      fetchSingleProduct(id as string);
      setQuantity(quantityInBasket || 1);
    }
  }, [fetchSingleProduct, id, quantityInBasket]);
  
  if (loading || !product) {
    return <div className="flex items-center justify-center">Yuklanmoqda...</div>
  }

  // images
  const images = product.productImageUrl || [];

  const handleAddQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handledeleteQuantity = () => {
    setQuantity(quantity - 1);
  };

  const handleSubmit = async () => {
    addToBasket({...product, quantity: quantity});
    calculateTotals();
    toast.success("Mahsulot savatga muvaffaqiyatli qo'shildi");
    navigate.back();
  };

  const handlePrev = () => {
    setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  return (
    <div className="flex md:justify-between flex-col md:flex-row gap-6 md:gap-10 md:py-5">
      <div className="relative rounded-xl overflow-hidden w-full h-[512px]">
        {images.length > 0 && (
          <>
            <Image
              fill
              src={images[currentImg].url}
              alt=""
              className="absolute hover:scale-105 transition-all duration-500 w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-10"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full z-10"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`block w-2 h-2 rounded-full ${idx === currentImg ? 'bg-white' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <div className="space-y-5 md:space-y-9 w-full">
        <div className="space-y-3">
          <h1 className="text-xl">{product?.title}</h1>
          <p className="text-sm text-gray-900">{product?.description}</p>
        </div>
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-300 flex items-center gap-8 w-fit py-1.5 px-2">
            <Button
              variant={'outline'}
              onClick={handledeleteQuantity}
              disabled={quantity == 1}
              className="cursor-pointer size-9 bg-gray-200 flex items-center justify-center rounded-full"
            >
              <HiMinus className="text-black" />
            </Button>
            <div className="w-14 border-b">
              <span className="block text-center">{quantity}</span>
            </div>
            <Button
              onClick={handleAddQuantity}
              className="cursor-pointer size-9 bg-black text-white flex items-center justify-center rounded-full"
            >
              <LuPlus className="text-white" />
            </Button>
          </div>
          <div>
            <div className="text-sm text-gray-500">Umumiy</div>
            <div className="font-bold">{FormattedPrice(Number(product.price))} UZS</div>
          </div>
          <Button
            onClick={handleSubmit}
            variant={'default'}
            disabled={loading || load || !isAuthenticated}
            className="cursor-pointer overflow-hidden rounded-xl w-full h-12 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            {load ? <span>Yuklanmoqda...</span> : !isAuthenticated ? <span>Iltimos, ro&apos;yxatdan o&apos;ting</span> :  (
              <>
                <BsCartDash className="text-white text-xl" />
                <span>Savatga qo&apos;shish</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;

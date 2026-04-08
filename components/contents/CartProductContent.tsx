"use client";
import useCartProductStore from "@/store/useCartStore";
import React, { useState } from "react";
import Quantity from "../client/Quantity";
import { BsCartDash } from "react-icons/bs";
import SubmitModal from "../client/Modal";
import Image from "next/image";
import { Button } from "../ui/button";
import { formatUZS } from "@/lib/formatPrice";

const CartProductContent = () => {
  const [open, setOpen] = useState(false);
  const { cartProducts, totalPrice, totalQuantity } = useCartProductStore();

  return (
    <div className="grid lg:grid-cols-6 gap-4 md:gap-6 md:py-5">
      {/* Cart items */}
      <div className="order-1 bg-white shadow-md border border-gray-300 rounded-xl p-3 sm:p-5 flex lg:col-span-4 flex-col gap-6 py-5">
        {cartProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <BsCartDash className="text-4xl mb-3 opacity-30" />
            <p className="text-sm">Savat bo&apos;sh</p>
          </div>
        ) : cartProducts.map((cart) => (
          <div key={cart.id} className="flex items-center gap-3 sm:gap-4">
            <div className="relative size-20 sm:size-32 md:size-44 shrink-0 overflow-hidden rounded-md">
              <Image
                fill
                className="absolute size-full object-cover"
                src={cart.productImageUrl[0]?.url || ''}
                alt={cart.title}
                sizes="(max-width: 640px) 80px, 176px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base truncate">{cart.title}</h3>
              <p className="text-brand-gray-200 font-semibold text-sm">{formatUZS(cart.price)}</p>
            </div>
            <Quantity id={cart.id} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white shadow-md border border-gray-300 rounded-xl p-4 sm:p-5 order-2 lg:order-3 lg:col-span-2 space-y-2 font-medium">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">Mahsulotlar soni</p>
          <p className="text-gray-800">{totalQuantity} ta</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">Umumiy summa</p>
          <p className="text-gray-800 font-bold text-lg">{formatUZS(totalPrice)}</p>
        </div>
        <Button
          variant={"default"}
          onClick={() => setOpen(true)}
          disabled={cartProducts.length === 0}
          className="cursor-pointer h-10 gap-2 bg-black transition-all ease-in-out rounded-xl max-w-lg w-full text-white p-3 !mt-6"
        >
          <BsCartDash className="text-white text-xl" />
          <span>Buyurtma berish</span>
        </Button>
      </div>
      {open && <SubmitModal setOpen={setOpen} />}
    </div>
  );
};

export default CartProductContent;

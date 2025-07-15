"use client";
import useCartProductStore from "@/store/useCartStore";
import React, { useState } from "react";
import Quantity from "../client/Quantity";
import { BsCartDash } from "react-icons/bs";
import SubmitModal from "../client/Modal";
import Image from "next/image";
import { Button } from "../ui/button";

const CartProductContent = () => {
  const [open, setOpen] = useState(false);
  const { cartProducts, totalPrice, totalQuantity } = useCartProductStore();

  return (
    <div className="grid lg:grid-cols-6 gap-6 md:py-5">
      <div className="order-2 bg-white shadow-md border border-gray-300 rounded-xl p-5 flex lg:col-span-4 flex-col gap-10 py-5">
        {cartProducts.map((cart) => (
          <div key={cart.id} className="flex flex-wrap items-center gap-4">
            <div className="relative size-44 overflow-hidden rounded-md">
              <Image
                fill
                className="absolute size-full object-cover"
                src={cart.productImageUrl[0].url}
                alt=""
              />
            </div>
            <div className="flex flex-col ml-4">
              <h3>{cart.title}</h3>
              <p>{cart.price}UZS</p>
            </div>
            <Quantity id={cart.id} />
          </div>
        ))}
      </div>
      <div className="max-h-60 bg-white shadow-md border border-gray-300 rounded-xl p-5 order-1 lg:order-3 lg:col-span-2 space-y-2 font-medium">
        <div className="flex items-center justify-between">
          <p className="text-slate-400">Mahsulotlar soni</p>
          <p className="text-gray-800">{totalQuantity} ta</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-400">Umumiy summa</p>
          <p className="text-gray-800 ">{totalPrice} UZS</p>
        </div>
        <Button
          variant={"default"}
          onClick={() => setOpen(true)}
          className="cursor-pointer h-10 gap-2 bg-black transition-all ease-in-out rounded-xl max-w-lg w-full text-white p-3 !mt-6"
        >
          <BsCartDash className="text-white text-xl" />
          <span>Adminga Yuborish</span>
        </Button>
      </div>
      {open && <SubmitModal setOpen={setOpen} />}
    </div>
  );
};

export default CartProductContent;

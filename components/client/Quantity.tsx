import useCartProductStore from "@/store/useCartStore";
import React from "react";
import { HiMinus } from "react-icons/hi";
import { LuPlus } from "react-icons/lu";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const Quantity = ({id}: {id: string}) => {
  const { cartProducts, incrementQuantity, decrementQuantity, getItemQuantity, calculateTotals } = useCartProductStore();
  const quantityInBasket = getItemQuantity(id);
  const router = useRouter();

  // Get stock from the cart item (ProductT carries stock field)
  const cartItem = cartProducts.find((item) => item.id === id);
  const stock = cartItem?.stock ?? 999;

  const handleAddQuantity = () => {
    if (quantityInBasket >= stock) return;
    incrementQuantity(id);
    calculateTotals();
  };

  const handleDeleteQuantity = () => {
    decrementQuantity(id);
    calculateTotals();
    if (quantityInBasket === 0) {
      router.push("/");
    }
  };

  return (
    <div className="ml-auto rounded-xl border border-gray-300 flex items-center gap-8 w-fit py-1.5 px-2">
      <Button
        variant={'outline'}
        onClick={handleDeleteQuantity}
        disabled={quantityInBasket == 0}
        className="cursor-pointer size-9 bg-gray-200 flex items-center justify-center rounded-full"
      >
        <HiMinus className="text-black" />
      </Button>
      <div className="w-14 border-b">
        <span className="block text-center">{quantityInBasket}</span>
      </div>
      <Button
        onClick={handleAddQuantity}
        disabled={quantityInBasket >= stock}
        className="cursor-pointer size-9 bg-black text-white flex items-center justify-center rounded-full disabled:opacity-40"
      >
        <LuPlus className="text-white" />
      </Button>
    </div>
  );
};

export default Quantity;

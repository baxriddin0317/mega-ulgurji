"use client";
import React from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import useWishlistStore from "@/store/useWishlistStore";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

const WishlistButton = ({ productId, className = "" }: WishlistButtonProps) => {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const active = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId);
    if (active) {
      toast("Sevimlilardan olib tashlandi", { icon: "💔" });
    } else {
      toast.success("Sevimlilar ga qo'shildi");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-press cursor-pointer rounded-full bg-white/90 hover:bg-white p-2 shadow-md transition-all duration-200 ${className}`}
      aria-label={active ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
    >
      <Heart
        className={`size-5 transition-colors duration-200 ${
          active ? "fill-red-500 text-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
};

export default WishlistButton;

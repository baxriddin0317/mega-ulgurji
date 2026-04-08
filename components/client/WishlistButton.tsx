"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [liked, setLiked] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved).includes(productId) : false;
  });

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved: string[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const next = liked ? saved.filter((id) => id !== productId) : [...saved, productId];
    localStorage.setItem("wishlist", JSON.stringify(next));
    setLiked(!liked);
  };

  return (
    <button onClick={toggle} className={cn("cursor-pointer", className)} aria-label="Sevimli">
      <Heart className={`size-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
    </button>
  );
}

"use client";
import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  product: { title: string; price: string; id: string };
  className?: string;
}

export default function ShareButton({ product, className }: ShareButtonProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${product.id}`;
    const text = `${product.title} — ${product.price} so'm`;

    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Havola nusxalandi!");
    }
  };

  return (
    <button onClick={handleShare} className={cn("cursor-pointer", className)} aria-label="Ulashish">
      <Share2 className="size-4 text-gray-600" />
    </button>
  );
}

"use client"
import Header from "@/components/client/Header";
import LocationSection from "@/components/client/LocationSection";
import CartProductContent from "@/components/contents/CartProductContent";
import { Button } from "@/components/ui/button";
import { useWhiteBody } from "@/hooks/useWhiteBody";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const CartProduct = () => {
  useWhiteBody();
  const router = useRouter();
  return (
    <main className="bg-white min-h-screen">
      <div className="bg-gray-950">
        <Header forceFixed={true} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-16">
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-1.5 w-fit text-gray-500 text-sm hover:text-gray-900 mb-6 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          <span>Orqaga qaytish</span>
        </Button>
        <CartProductContent />
      </div>
      <LocationSection />
    </main>
  );
};

export default CartProduct;

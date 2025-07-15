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
    <main className="h-full min-h-screen">
      <Header forceFixed={true} />
      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-20">
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-1 w-fit text-gray-900 text-sm hover:text-black py-4 px-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="text-xl" />
          <span>Orqaga</span>
        </Button>
        <CartProductContent />
      </div>
      <LocationSection forceColor={true} />
    </main>
  );
};

export default CartProduct;

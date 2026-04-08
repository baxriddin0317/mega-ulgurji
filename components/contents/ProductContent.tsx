"use client";
import React from "react";
import Header from "../client/Header";
import LocationSection from "../client/LocationSection";
import ProductItem from "../client/ProductItem";
import { ArrowLeft } from "lucide-react";
import { useWhiteBody } from "@/hooks/useWhiteBody";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const ProductContent = ({ slug }: { slug: string }) => {
  useWhiteBody();
  const router = useRouter();
  return (
    <main className="bg-white min-h-screen">
      {/* Dark header area */}
      <div className="bg-gray-950">
        <Header forceFixed={true} />
      </div>

      {/* Product content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-16">
        <Button
          variant="ghost"
          className="flex cursor-pointer items-center gap-1.5 w-fit text-gray-500 text-sm hover:text-gray-900 mb-6 -ml-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          <span>Orqaga qaytish</span>
        </Button>
        <ProductItem id={slug} />
      </div>

      <LocationSection />
    </main>
  );
};

export default ProductContent;

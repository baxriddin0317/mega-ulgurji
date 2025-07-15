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
    <>
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
        <ProductItem id={slug} />
      </div>
      <LocationSection forceColor={true} />
    </>
  );
};

export default ProductContent;

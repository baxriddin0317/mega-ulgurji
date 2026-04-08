"use client";
import Header from "@/components/client/Header";
import ProductCard from "@/components/client/ProductCard";
import { Button } from "@/components/ui/button";
import useCartProductStore from "@/store/useCartStore";
import useProductStore from "@/store/useProductStore";
import useWishlistStore from "@/store/useWishlistStore";
import { useWhiteBody } from "@/hooks/useWhiteBody";
import { ArrowLeft, Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

const WishlistPage = () => {
  useWhiteBody();
  const router = useRouter();
  const { wishlistItems, clearWishlist } = useWishlistStore();
  const { products, fetchProducts } = useProductStore();
  const { addToBasket, calculateTotals } = useCartProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const wishlistProducts = products.filter((p) =>
    wishlistItems.includes(p.id)
  );

  const handleAddAllToCart = () => {
    let added = 0;
    for (const product of wishlistProducts) {
      const hasStock = product.stock !== undefined && product.stock !== null;
      const outOfStock = hasStock && (product.stock as number) <= 0;
      if (!outOfStock) {
        addToBasket({ ...product, quantity: 1 });
        added++;
      }
    }
    calculateTotals();
    if (added > 0) {
      toast.success(`${added} ta mahsulot savatga qo'shildi`);
    } else {
      toast.error("Savatga qo'shiladigan mahsulot topilmadi");
    }
  };

  const handleClear = () => {
    clearWishlist();
    toast("Sevimlilar tozalandi", { icon: "🗑️" });
  };

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

        <div className="flex items-center justify-between mt-4 mb-8">
          <div className="flex items-center gap-3">
            <Heart className="size-7 text-red-500 fill-red-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Sevimlilar</h1>
            {wishlistProducts.length > 0 && (
              <span className="text-gray-500 text-lg">
                ({wishlistProducts.length})
              </span>
            )}
          </div>
          {wishlistProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAddAllToCart}
                className="cursor-pointer bg-black text-white hover:bg-gray-800 text-sm"
              >
                <ShoppingCart className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Hammasini savatga</span>
                <span className="sm:hidden">Savatga</span>
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 text-sm"
              >
                <Trash2 className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Tozalash</span>
              </Button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="size-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Hali sevimli mahsulotlar yo&apos;q
            </h2>
            <p className="text-gray-500 mb-6">
              Mahsulotlarni sevimlilar ro&apos;yxatiga qo&apos;shing
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Bosh sahifaga qaytish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-10">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default WishlistPage;

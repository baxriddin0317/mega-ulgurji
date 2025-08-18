"use client"
import Image from 'next/image';
import React, { useEffect, useMemo } from 'react'
import { Button } from '../ui/button';
import { BiEdit, BiTrash } from 'react-icons/bi';
import { useRouter } from 'next/navigation';
import useProductStore from '@/store/useProductStore';
import { FormattedPrice } from '@/hooks';
import { ProductT } from '@/lib/types';
import { fireStorage } from '@/firebase/config';
import { deleteObject, listAll, ref } from 'firebase/storage';
import toast from 'react-hot-toast';

interface ProductTableProps {
  search: string;
  category?: string;
  subcategory?: string;
}

const ProductTable = ({ search, category = 'all', subcategory = 'all' }: ProductTableProps) => {
  const router = useRouter();
  const { products, fetchProducts, deleteProduct } = useProductStore();
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search + Category + Subcategory filter logic
  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category);
    }
    if (subcategory !== 'all') {
      filtered = filtered.filter(product => product.subcategory === subcategory);
    }
    if (search.length >= 2) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [products, search, category, subcategory]);

  const handleEdit = (id: string) => {
    router.push(`/admin/update-product/${id}`);
  }

  const handleDelete = async (item: ProductT) => {
    if (item.id) {
      const imageFolderRef = ref(fireStorage, `products/${item.storageFileId}`);
      const imageRefs = await listAll(imageFolderRef);
      
      const deleteImagePromises = imageRefs.items.map(async (itemRef) => {
        await deleteObject(itemRef);
      });
      await Promise.all(deleteImagePromises);

      await deleteProduct(item.id);
      toast.success('Mahsulot muvaffaqiyatli o‘chirildi');
    }
  };
  
  return (
     <div className="w-full px-4 py-3">
      {/* Desktop and Tablet view */}
      <div className="hidden custom:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full w-full">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Nomi</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Rasm</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Narxi</th>
              <th className="px-4 py-3 text-left text-black text-sm max-w-[100px] font-medium">Kategoriya</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Subkategoriya</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Tahrirlash</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">O&apos;chirish</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-20 px-4 py-2 text-center text-gray-500">
                  {search.length >= 2 ? "Mahsulotlar topilmadi" : "Mahsulotlar mavjud emas"}
                </td>
              </tr>
            ) : (filteredProducts.map((product, index) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">
                  {product.title}
                </td>
                <td className="h-20 px-4 py-2 text-sm font-normal">
                  <div className='size-16 relative overflow-hidden rounded-2xl'>
                    {product.productImageUrl && product.productImageUrl.length > 0 ? (
                      <Image className='absolute size-full object-cover' src={product.productImageUrl[0].url} fill alt={product.title} />
                    ) : (
                      <div className='absolute size-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs'>
                        Rasm yo'q
                      </div>
                    )}
                  </div>
                </td>
                <td className="h-20 px-4 py-2 text-gray-700 text-sm font-normal">{FormattedPrice(product.price)} UZS</td>
                <td className="max-w-xs h-20 px-4 py-2 text-sm font-normal">
                  <span className="flex min-w-[84px] text-center cursor-pointer items-center justify-center rounded-xl min-h-8 px-1 bg-gray-100 text-black text-sm font-medium w-full">
                    {product.category}
                  </span>
                </td>
                <td className="h-20 px-4 py-2 text-sm">
                  {product.subcategory ? (
                    <span className="flex min-w-[84px] text-center cursor-pointer items-center justify-center rounded-xl min-h-8 px-1 bg-gray-100 text-black text-sm font-medium w-full">
                      {product.subcategory}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">----</span>
                  )}
                </td>
                <td className="w-20 h-20 px-4 py-2 text-gray-700 text-sm font-normal">
                  <Button onClick={() => handleEdit(product.id)} className='flex items-center justify-center mx-auto cursor-pointer' variant={'ghost'}>
                    <BiEdit size={24} />
                  </Button>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-sm font-normal">
                  <Button onClick={() => handleDelete(product)} className="flex items-center justify-center mx-auto cursor-pointer" variant={'default'}>
                    <BiTrash size={24} />
                  </Button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card layout */}
      <div className="custom:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center text-gray-500">
            {search.length >= 2 ? "Mahsulotlar topilmadi" : "Mahsulotlar mavjud emas"}
          </div>
        ) : (filteredProducts.map((product, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-black">{product.title}</h3>
              <span className="text-gray-700">{FormattedPrice(product.price)} UZS</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Rasm</span>
                <div className='size-16 relative overflow-hidden rounded-2xl'>
                  {product.productImageUrl && product.productImageUrl.length > 0 ? (
                    <Image className='absolute size-full object-cover' src={product.productImageUrl[0].url} fill alt={product.title} />
                  ) : (
                    <div className='absolute size-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs'>
                      Rasm yo'q
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Turi</span>
                <button className="rounded-xl bg-gray-100 text-sm px-3 py-1">
                  {product.category}
                </button>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-500">Subkategoriya</span>
                {product.subcategory ? (
                  <span className="rounded-xl bg-gray-100 text-sm px-3 py-1">
                    {product.subcategory}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">----</span>
                )}
              </div>
              <div className="flex flex-1 gap-3 flex-wrap pt-3 justify-end">
                <Button
                  onClick={() => handleEdit(product.id)}
                  variant={'secondary'}
                  className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Yangilash</span>
                </Button>
                <Button
                  onClick={() => handleDelete(product)}
                  variant={'default'}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  O&apos;chirish
                </Button>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}

export default ProductTable
"use client"
import { ProductForm, ProductFormData } from '@/components/admin/ProductForm';
import { ImageT, ProductT } from '@/lib/types';
import useCategoryStore from '@/store/useCategoryStore';
import useProductStore from '@/store/useProductStore';
import { Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const emptyTimestamp = new Timestamp(0, 0);

const UpdateProduct = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { product, loading, fetchSingleProduct, updateProduct } = useProductStore();
  const [isLoading, setIsLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const { categories, fetchCategories } = useCategoryStore();
  const [existingProduct, setExistingProduct] = useState<ProductT>({
    id: params.id || '',
    title: '',
    price: "0",
    productImageUrl: [] as ImageT[],
    category: '',
    description: '',
    quantity: 0,
    time: product?.time || emptyTimestamp,
    date: product?.date || emptyTimestamp,
    storageFileId: ''
  });

  useEffect(() => {
    const getId = async () => {
      const { id } = await params;
      setProductId(id)
    }
    getId()
  }, [params]);

  useEffect(() => {
    if (productId) {
      fetchSingleProduct(productId as string);
    }
  }, [productId, fetchSingleProduct]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (product) {
      setExistingProduct({
        id: product.id,
        title: product.title,
        price: product.price,
        productImageUrl: product.productImageUrl,
        category: product.category,
        description: product.description,
        quantity: product.quantity,
        time: product.time,
        date: product.date,
        storageFileId: product.storageFileId
      });
    }
  }, [product]);

  const handleUpdateProduct = async (data: ProductFormData) => {
    try {
      setIsLoading(true);
      
      const updatedProduct = {
        ...data,
        id: productId,
        // Keep existing date/time or update as needed
        updatedAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };
      
      // API call to update product
      // await updateProductInAPI(productId, updatedProduct);
      console.log(updatedProduct);
      
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  if (isLoading && !existingProduct) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="relative flex size-full justify-center">
      <ProductForm
        initialData={existingProduct || undefined}
        onSubmit={handleUpdateProduct}
        onCancel={handleCancel}
        submitButtonText="Update Product"
        title="Update Product"
        isLoading={isLoading}
      />
    </div>
  )
}

export default UpdateProduct
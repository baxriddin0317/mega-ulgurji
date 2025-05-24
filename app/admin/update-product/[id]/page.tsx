"use client"
import { ProductForm, ProductFormData } from '@/components/admin/ProductForm';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const UpdateProduct = ({ params }: { params: Promise<{ id: string }> }) => {
  const router = useRouter();
  const [existingProduct, setExistingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productId, setProductId] = useState("");

  useEffect(() => {
    const getId = async () => {
      const { id } = await params;
      setProductId(id)
    }
    getId()
  }, [params])

  useEffect(() => {
    // Fetch existing product data
    const fetchProduct = async () => {
      try {
        // const product = await getProductById(productId);
        // setExistingProduct(product);
        setExistingProduct(null)
        console.log('get product by id');
        
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
"use client"
import React from 'react'
import { ProductForm } from '@/components/admin/ProductForm';
import { useRouter } from 'next/navigation';

const AddProduct = () => {
  const router = useRouter();

  const handleAddProduct = async (data: any) => {
    try {
      // Add product logic
      const newProduct = {
        ...data,
        // time: Timestamp.now(),
        createdAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        storageFileId: ""
      };
      
      // API call to add product
      console.log(newProduct);
      
      
      // Redirect after successful add
      // router.push('/products');
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="relative flex size-full justify-center">
      <ProductForm
        onSubmit={handleAddProduct}
        onCancel={handleCancel}
        submitButtonText="Add Product"
        title="Add New Product"
      />
    </div>
  )
}

export default AddProduct
"use client"
import React from 'react'
import { ProductForm, ProductFormData } from '@/components/admin/ProductForm';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { fireDB } from '@/firebase/config';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const router = useRouter();

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      const newProduct = {
        ...data,
        // time: Timestamp.now(),
        createdAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      };
      
      // API call to add product
      console.log(newProduct);
      
      const productRef = collection(fireDB, "products");
      await addDoc(productRef, newProduct);
      toast.success("Add product successfully");
      router.push("/admin");
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error("Add product failed");
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
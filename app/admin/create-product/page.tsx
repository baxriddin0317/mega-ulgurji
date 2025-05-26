"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { fireDB, fireStorage } from '@/firebase/config';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CgClose } from 'react-icons/cg';
import { GrGallery } from 'react-icons/gr';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageT } from '@/lib/types';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import useDraftStore from '@/store/useDraftStore';
import useCategoryStore from '@/store/useCategoryStore';

const AddProduct = () => {
  const navigate = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  // product state
  const [product, setProduct] = useState({
    title: "",
    price: "",
    productImageUrl: [] as ImageT[],
    category: "",
    description: "",
    quantity: 0,
    time: Timestamp.now(),
    date: new Date().toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }),
    storageFileId: ""
  });

  const { 
    saveProductDraft, 
    loadProductDraft, 
    deleteProductDraft, 
    removeProductDraft,
    hasProductDraft 
  } = useDraftStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Component yuklanganda draft'ni tekshirish
  useEffect(() => {
    if (hasProductDraft()) {
      setShowDraftModal(true);
    }
  }, [hasProductDraft]);

  // Draft'ni yuklash
  const handleLoadDraft = () => {
    const draftData = loadProductDraft();
    if (draftData) {
      setProduct(draftData.newProduct || {
        id: "",
        name: "",
        description: "",
        categoryImgUrl: [],
        storageFileId: ""
      });
      toast.success("Draft restored successfully");
    }
    setShowDraftModal(false);
  };

  // Draft'ni o'chirish
  const handleDeleteDraft = async () => {
    await deleteProductDraft();
    setShowDraftModal(false);
    toast.success("Draft deleted successfully");
  };

  // Ma'lumotlar o'zgarganda draft'ni saqlash
  useEffect(() => {
    if (product.productImageUrl.length > 0) {
      const timeoutId = setTimeout(() => {
        saveProductDraft({
          newProduct: product
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [product, saveProductDraft]);

  // handle upload image
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setImageUploading(true);

    let currentStorageFileId = product.storageFileId;
    if (currentStorageFileId.length === 0) {
      currentStorageFileId = uuidv4();
      setProduct((prevProduct) => ({
        ...prevProduct,
        storageFileId: currentStorageFileId
      }));
    }
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(fireStorage, `products/${currentStorageFileId}/${file.name}`);

      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return { url: downloadUrl, path: storageRef.fullPath };
    });

    const imageUrls = await Promise.all(uploadPromises);
    setProduct((prevProduct) => ({
      ...prevProduct,
      productImageUrl: [...prevProduct.productImageUrl, ...imageUrls]
    }));
    setImageUploading(false);
  };
  // remove image
  const handleDeleteImage = async (imageUrl: string) => {
    
    const imageRef = ref(fireStorage, `products/${product.storageFileId}/${imageUrl.split('/').pop()}`);
    try {
      await deleteObject(imageRef);
      // Remove the image URL from the state
      setProduct((prevProduct) => ({
        ...prevProduct,
        productImageUrl: prevProduct.productImageUrl.filter((url) => url.path !== imageUrl),
      }));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  // handle cencel
  const handleCancel = async () => {
    await deleteProductDraft();
    
    // State'ni tozalash
    setProduct({
      title: "",
      price: "",
      productImageUrl: [] as ImageT[],
      category: "",
      description: "",
      quantity: 0,
      time: Timestamp.now(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      storageFileId: ""
    });
    
    navigate.back();
  };

  // handle create product
  const handleCreateProduct = async () => {
    if (
      product.title == "" ||
      product.price == "" ||
      product.productImageUrl.length == 0 ||
      product.category == "" ||
      product.description == ""
    ) {
      return toast.error("all fields are required");
    }

    setLoading(true);
    try {
      const productRef = collection(fireDB, "products");
      await addDoc(productRef, product);
      toast.success("Add product successfully");
      removeProductDraft();
      navigate.push("/admin");
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error("Add product failed");
    }
  };

  return (
    <>
      {/* Draft modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Draft topildi</h3>
            <p className="text-gray-600 mb-6">
              Avval yaratilgan product draft&apos;i mavjud. Uni tiklashni xohlaysizmi?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleLoadDraft}
                className="flex-1"
              >
                Ha, tiklash
              </Button>
              <Button
                onClick={handleDeleteDraft}
                variant="outline"
                className="flex-1"
              >
                Yo&apos;q, o&apos;chirish
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="relative flex size-full justify-center">
        <div className="flex gap-4 px-4 flex-col md:w-[512px] py-5 max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 mb-5">
            <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">
              Add product
            </h2>
          </div>

          {/* Upload Images */}
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-x-4 flex-wrap'>
              {product.productImageUrl.length > 0 && product.productImageUrl.map((img, index) => (
                <div key={index} className='size-28 relative overflow-hidden rounded-2xl'>
                  <Image 
                    className='absolute size-full object-cover' 
                    src={img.url}
                    fill 
                    alt={`product image ${index + 1}`}
                  />
                  <Button 
                    type='button' 
                    className='absolute top-2 right-2 cursor-pointer z-10 bg-white size-6 hover:bg-gray-100' 
                    variant={'ghost'}
                    onClick={() => handleDeleteImage(img.path)}
                  >
                    <CgClose size={12} className="text-black" />
                  </Button>
                </div>
              ))}
              
              <label 
                className='flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all h-9 px-4 py-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 cursor-pointer' 
                htmlFor='upload'
              >
                <GrGallery />
                <span>{imageUploading ? 'Uploading...' : 'Upload img'}</span>
              </label>
              <input 
                className='sr-only' 
                id='upload' 
                type="file" 
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
              />
              {imageUploading && <p>loading...</p>}
            </div>
            {product.productImageUrl.length === 0 && (
              <p className="text-red-500 text-sm">At least one product image is required</p>
            )}
          </div>

          {/* Product Name */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
                Product name*
              </p>
              <input
                placeholder="Enter product name"
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
                value={product.title}
                onChange={(e) => setProduct({ ...product, title: e.target.value })}
              />
            </label>
          </div>

          {/* Category */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
                Select a category*
              </p>
              <Select onValueChange={(value) => setProduct({ ...product, category: value })}>
                <SelectTrigger className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !max-h-[53px] placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal cursor-pointer">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((value) => {
                    const { name, id } = value;
                    return (
                      <SelectItem className='capitalize' key={id} value={name}>{name}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </label>
          </div>

          {/* Price */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
                Price*
              </p>
              <input
                placeholder="$0.00"
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
                value={product.price}
                onChange={(e) => setProduct({ ...product, price: e.target.value })}
              />
            </label>
          </div>

          {/* Description */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
                Description*
              </p>
              <textarea
                placeholder="Enter product description"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex flex-1 gap-3 flex-wrap justify-end">
            <Button
              type='button'
              variant={'secondary'}
              className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={handleCancel}
              disabled={loading}
            >
              <span className="truncate">Cancel</span>
            </Button>
            <Button
              type='button'
              variant={'default'}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
              onClick={handleCreateProduct}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'add product'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddProduct
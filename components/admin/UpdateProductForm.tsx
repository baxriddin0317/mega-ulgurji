"use client"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fireStorage } from "@/firebase/config";
import { ImageT, ProductT } from "@/lib/types";
import useCategoryStore from "@/store/useCategoryStore";
import useProductStore from "@/store/useProductStore";
import { FirebaseError } from "firebase/app";
import { Timestamp } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { GrGallery } from "react-icons/gr";

const emptyTimestamp = new Timestamp(0, 0);

const UpdateProductForm = ({ id }: { id: string }) => {
  const navigate = useRouter();
  const [imageUploading, setImageUploading] = useState(false);
  const [submitUploading, setSubmitUploading] = useState(false);
  const { product, loading, fetchSingleProduct, updateProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [updatedProduct, setUpdatedProduct] = useState<ProductT>({
    id: id || '',
    title: '',
    price: '0',
    productImageUrl: [] as ImageT[],
    category: '',
    description: '',
    quantity: 0,
    time: product?.time || emptyTimestamp,
    date: product?.date || emptyTimestamp,
    storageFileId: ''
  });

  useEffect(() => {
    if (id) {
      fetchSingleProduct(id as string);
    }
  }, [id, fetchSingleProduct]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (product) {
      setUpdatedProduct({
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
  
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setImageUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(fireStorage, `products/${updatedProduct.storageFileId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return { url: downloadUrl, path: storageRef.fullPath };
    });

    const imageUrls = await Promise.all(uploadPromises);
    setUpdatedProduct((prevProduct) => ({
      ...prevProduct,
      productImageUrl: [...prevProduct.productImageUrl, ...imageUrls],
    }));
    setImageUploading(false);
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const imageRef = ref(fireStorage, `products/${updatedProduct.storageFileId}/${imageUrl.split('/').pop()}`);
    try {
      await deleteObject(imageRef);
      setUpdatedProduct((prevProduct) => ({
        ...prevProduct,
        productImageUrl: prevProduct.productImageUrl.filter((url) => url.path !== imageUrl),
      }));
      toast.success("Rasm muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Rasmni o'chirishda xatolik yuz berdi");
    }
  };

  // handle cencel
  const handleCancel = () => {
    navigate.back();
  };

  const handleUpdate = async () => {
    if (id) {
      setSubmitUploading(true);
      try {
        await updateProduct(id, updatedProduct);
        toast.success('Mahsulot muvaffaqiyatli yangilandi');
        setSubmitUploading(false);
        navigate.push('/admin');
      } catch (error) {
        if (error instanceof FirebaseError) {
        setSubmitUploading(false);
        toast.error("Mahsulotni yangilashda xatolik yuz berdi");
        }
      }
    }
  };

  if(loading){
    return <div className="flex items-center justify-center">Yuklanmoqda...</div>
  }
  return (
    <>
      {/* Upload Images */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center gap-x-4 flex-wrap'>
          {updatedProduct.productImageUrl.length > 0 && updatedProduct.productImageUrl.map((img, index) => (
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
            <span>{imageUploading ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
          </label>
          <input 
            className='sr-only' 
            id='upload' 
            type="file" 
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            accept="image/*"
          />
          {imageUploading && <p>Yuklanmoqda...</p>}
        </div>
        {updatedProduct.productImageUrl.length === 0 && (
          <p className="text-red-500 text-sm">Kamida bitta mahsulot rasmi talab qilinadi</p>
        )}
      </div>

      {/* Product Name */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Mahsulot nomi*
          </p>
          <input
            placeholder="Mahsulot nomini kiriting"
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedProduct.title}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, title: e.target.value })}
          />
        </label>
      </div>

      {/* Category */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#0e141b] text-base font-medium leading-normal pb-2">
            Kategoriyani tanlang*
          </p>
          <Select onValueChange={(value) => setUpdatedProduct({ ...updatedProduct, category: value })}>
            <SelectTrigger className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !max-h-[53px] placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal cursor-pointer">
              <SelectValue placeholder="Kategoriyani tanlang" />
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
            Narxi*
          </p>
          <input
            placeholder="0 so'm"
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none !h-10 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedProduct?.price}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, price: e.target.value })}
          />
        </label>
      </div>

      {/* Description */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">
            Tavsif*
          </p>
          <textarea
            placeholder="Mahsulot tavsifini kiriting"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedProduct.description}
            onChange={(e) => setUpdatedProduct({ ...updatedProduct, description: e.target.value })}
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
          disabled={loading || submitUploading}
        >
          <span className="truncate">Bekor qilish</span>
        </Button>
        <Button
          type='button'
          variant={'default'}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em] capitalize"
          onClick={handleUpdate}
          disabled={loading}
        >
          {submitUploading ? 'Yuklanmoqda...' : 'Mahsulotni yangilash'}
        </Button>
      </div> 
    </>
  )
}

export default UpdateProductForm
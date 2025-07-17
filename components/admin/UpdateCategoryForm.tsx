"use client"
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { GrGallery } from 'react-icons/gr'
import { CgClose } from 'react-icons/cg'
import Image from 'next/image'
import { CategoryI, ImageT } from '@/lib/types'
import { useRouter } from 'next/navigation'
import useCategoryStore from '@/store/useCategoryStore'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { fireStorage } from '@/firebase/config'
import toast from 'react-hot-toast'
import { FirebaseError } from 'firebase/app'

const UpdateCategoryForm = ({ id }: { id: string }) => {
  const navigate = useRouter();
  const [imageUploading, setImageUploading] = useState(false);
  const [submitUploading, setSubmitUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [updatedCategory, setUpdatedCategory] = useState<CategoryI>({
    id: id || "",
    name: "",
    description: "",
    categoryImgUrl: [] as ImageT[],
    storageFileId: "",
    subcategory: []
  });
  const {loading, category, fetchSingleCategory, updateCategory } = useCategoryStore();

  useEffect(() => {
    if (id) {
      fetchSingleCategory(id as string);
    }
  }, [id, fetchSingleCategory]);

  useEffect(() => {
    if (category) {
      setUpdatedCategory({
        id: category.id,
        name: category.name,
        description: category.description,
        categoryImgUrl: category.categoryImgUrl,
        storageFileId: category.storageFileId,
        subcategory: category.subcategory || []
      });
    }
  }, [category]);
  
  // handle upload image
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setImageUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const storageRef = ref(fireStorage, `categories/${updatedCategory.storageFileId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      return { url: downloadUrl, path: storageRef.fullPath };
    });

    const imageUrls = await Promise.all(uploadPromises);
    setUpdatedCategory((prevCategory) => ({
      ...prevCategory,
      categoryImgUrl: [...prevCategory.categoryImgUrl, ...imageUrls],
    }));
    setImageUploading(false);
  };

  // handle delete image
  const handleDeleteImage = async (imageUrl: string) => {
    const imageRef = ref(fireStorage, `categories/${updatedCategory.storageFileId}/${imageUrl.split('/').pop()}`);
    try {
      await deleteObject(imageRef);
      setUpdatedCategory((prevCategory) => ({
        ...prevCategory,
        categoryImgUrl: prevCategory.categoryImgUrl.filter((url) => url.path !== imageUrl),
      }));
      toast.success("Rasm muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Rasmni o'chirishda xatolik yuz berdi");
    }
  };

  // Tag/Subcategory handlers
  const handleAddTag = () => {
    if (tagInput.trim() === "") {
      toast.error("Subkategoriya bo'sh bo'lishi mumkin emas");
      return;
    }
    if (updatedCategory.subcategory && updatedCategory.subcategory.includes(tagInput.trim())) {
      toast.error("Bu subkategoriya allaqachon mavjud");
      return;
    }
    setUpdatedCategory({
      ...updatedCategory,
      subcategory: [...(updatedCategory.subcategory || []), tagInput.trim()]
    });
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setUpdatedCategory({
      ...updatedCategory,
      subcategory: (updatedCategory.subcategory || []).filter(t => t !== tag)
    });
  };

  // handle cencel
  const handleCancel = () => {
    navigate.back();
  };

  const handleUpdate = async () => {
    if (id) {
      if (
        updatedCategory.name === "" ||
        updatedCategory.categoryImgUrl.length === 0 ||
        updatedCategory.subcategory.length < 1
      ) {
        toast.error("Barcha maydonlarni to'ldiring");
        return;
      }
      setSubmitUploading(true);
      try {
        await updateCategory(id, updatedCategory);
        toast.success('Kategoriya muvaffaqiyatli yangilandi');
        setSubmitUploading(false);
        navigate.push('/admin/categories');
      } catch (error) {
        setSubmitUploading(false);
        if (error instanceof FirebaseError) {
          toast.error("Kategoriyani yangilashda xatolik yuz berdi");
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
          {updatedCategory.categoryImgUrl.length > 0 && updatedCategory.categoryImgUrl.map((img, index) => (
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
            <span>{false ? 'Yuklanmoqda...' : 'Rasm yuklash'}</span>
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
        {updatedCategory.categoryImgUrl.length === 0 && (
          <p className="text-red-500 text-sm">Kamida bitta mahsulot rasmi talab qilinadi</p>
        )}
      </div>
      {/* category name */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Kategoriya nomi*</p>
          <input
            placeholder="Kategoriya nomini kiriting"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedCategory.name}
            onChange={(e) => setUpdatedCategory({ ...updatedCategory, name: e.target.value })}
          />
        </label>
      </div>
      {/* subcategory/tags */}
      <div className="flex flex-col max-w-[480px] gap-4">
        <div className="flex items-end space-x-2">
          <label className="flex flex-col min-w-40 flex-1">
            <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Subkategoriya qo&apos;shish</p>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Subkategoriya qo'shish"
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            />
          </label>
          <Button onClick={handleAddTag} type="button" className="h-13 border-none bg-black hover:bg-gray-800 text-white px-4 py-2 font-bold rounded-xl text-nowrap text-sm">
            Qo&apos;shish
          </Button>
        </div>
        {updatedCategory.subcategory.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
          {updatedCategory.subcategory.map((tag, index) => (
            <div
              key={index}
              className="flex items-center bg-[#e7edf3] text-brand-black-text px-3 py-1 rounded-xl text-sm"
            >
              {tag}
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemoveTag(tag)}
                className="ml-2 text-black hover:text-red-500 px-2 py-0 h-6"
              >
                ×
              </Button>
            </div>
          ))}
        </div>}
      </div>
      {/* category description */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Tavsif</p>
          <textarea
            placeholder="Kategoriya tavsifini kiriting"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none min-h-36 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedCategory.description}
            onChange={(e) => setUpdatedCategory({ ...updatedCategory, description: e.target.value })}
          ></textarea>
        </label>
      </div>
      {/* submit or cancel button */}
      <div className="flex flex-1 gap-3 flex-wrap justify-end">
        <Button
          type='button'
          variant={'secondary'}
          onClick={handleCancel}
          className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
        >
          <span className="truncate">Bekor qilish</span>
        </Button>
        <Button
          type='button'
          variant={'default'}
          onClick={handleUpdate}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
          {submitUploading ? 'Yuklanmoqda..' : 'Kategoriyani yangilash'}
        </Button>
      </div> 
    </>
  )
}

export default UpdateCategoryForm
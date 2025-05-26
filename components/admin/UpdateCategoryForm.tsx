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
  const [updatedCategory, setUpdatedCategory] = useState<CategoryI>({
    id: id || "",
    name: "",
    description: "",
    categoryImgUrl: [] as ImageT[],
    storageFileId: ""
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
        storageFileId: category.storageFileId
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
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
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
        await updateCategory(id, updatedCategory);
        toast.success('Category Updated Successfully');
        setSubmitUploading(false);
        navigate.push('/admin/categories');
      } catch (error) {
        setSubmitUploading(false);
        if (error instanceof FirebaseError) {
          toast.error("Update Category failed");
        }
      }
    }
  };

  if(loading){
    return <div className="flex items-center justify-center">Loading...</div>
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
            <span>{false ? 'Uploading...' : 'Upload img'}</span>
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
        {updatedCategory.categoryImgUrl.length === 0 && (
          <p className="text-red-500 text-sm">At least one product image is required</p>
        )}
      </div>
      {/* category name */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Category name*</p>
          <input
            placeholder="Enter category name"
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-brand-black-text focus:outline-0 focus:ring-0 border-none bg-[#e7edf3] focus:border-none h-14 placeholder:text-[#4e7397] p-4 text-base font-normal leading-normal"
            value={updatedCategory.name}
            onChange={(e) => setUpdatedCategory({ ...updatedCategory, name: e.target.value })}
          />
        </label>
      </div>
      {/* category description */}
      <div className="flex max-w-[480px] flex-wrap items-end gap-4">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Description</p>
          <textarea
            placeholder="Enter category description"
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
          <span className="truncate">Cancel</span>
        </Button>
        <Button
          type='button'
          variant={'default'}
          onClick={handleUpdate}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
        >
          {submitUploading ? 'Loading..' : 'Update category'}
        </Button>
      </div> 
    </>
  )
}

export default UpdateCategoryForm
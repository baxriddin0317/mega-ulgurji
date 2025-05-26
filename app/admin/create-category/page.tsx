"use client"
import { Button } from '@/components/ui/button'
import { fireStorage } from '@/firebase/config';
import { CategoryI, ImageT } from '@/lib/types';
import useCategoryStore from '@/store/useCategoryStore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { GrGallery } from 'react-icons/gr';
import { v4 as uuidv4 } from 'uuid';

const DRAFT_KEY = 'category_draft';

const CreateCategory = () => {
  const [imageUploading, setImageUploading] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryI>({
    id: "",
    name: "",
    description: "",
    categoryImgUrl: [] as ImageT[],
    storageFileId: ""
  });
  const { addCategory, loading } = useCategoryStore();
  const navigate = useRouter();

  // Component yuklanganda draft'ni tekshirish
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      setShowDraftModal(true);
    }
  }, []);

  // Draft'ni saqlash
  const saveDraft = () => {
    const draftData = {
      newCategory,
      timestamp: Date.now()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  };

  // Draft'ni yuklash
  const loadDraft = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      setNewCategory(draftData.newCategory || {
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
  const deleteDraft = async () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      // Draft'dagi rasmlarni storage'dan o'chirish
      if (draftData.newCategory?.categoryImgUrl?.length > 0) {
        await Promise.all(
          draftData.newCategory.categoryImgUrl.map(async (img: ImageT) => {
            try {
              const imageRef = ref(fireStorage, img.path);
              await deleteObject(imageRef);
            } catch (error) {
              console.error("Error deleting draft image:", error);
            }
          })
        );
      }
    }
    localStorage.removeItem(DRAFT_KEY);
    setShowDraftModal(false);
  };

  // Ma'lumotlar o'zgarganda draft'ni saqlash
  useEffect(() => {
    if (newCategory.categoryImgUrl.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDraft();
      }, 1000); // 1 soniya kechikish bilan saqlash

      return () => clearTimeout(timeoutId);
    }
  }, [newCategory]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    setImageUploading(true);

    let currentStorageFileId = newCategory.storageFileId;
    if (currentStorageFileId.length === 0) {
      currentStorageFileId = uuidv4();
      setNewCategory((prevCategory) => ({
        ...prevCategory,
        storageFileId: currentStorageFileId
      }));
    }

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(fireStorage, `categories/${currentStorageFileId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        return { url: downloadUrl, path: storageRef.fullPath };
      });

      const imageUrls = await Promise.all(uploadPromises);
      
      setNewCategory((prevCategory) => ({
        ...prevCategory,
        categoryImgUrl: [...prevCategory.categoryImgUrl, ...imageUrls]
      }));
      
      toast.success("Images uploaded successfully");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setImageUploading(false);
    }
  };

  // remove image
  const handleDeleteImage = async (imageUrl: string) => {
    
    const imageRef = ref(fireStorage, `categories/${newCategory.storageFileId}/${imageUrl.split('/').pop()}`);
    try {
      await deleteObject(imageRef);
      // Remove the image URL from the state
      setNewCategory((prevProduct) => ({
        ...prevProduct,
        categoryImgUrl: prevProduct.categoryImgUrl.filter((url) => url.path !== imageUrl),
      }));
      toast.success("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  // handle cencel
  const handleCancel = async () => {
    // Yuklangan rasmlarni storage'dan o'chirish
    if (newCategory.categoryImgUrl.length > 0) {
      await Promise.all(
        newCategory.categoryImgUrl.map(async (img) => {
          try {
            const imageRef = ref(fireStorage, img.path);
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image during cancel:", error);
          }
        })
      );
    }
    
    // Draft'ni ham o'chirish
    localStorage.removeItem(DRAFT_KEY);
    
    // State'ni tozalash
    setNewCategory({
      id: "",
      name: "",
      description: "",
      categoryImgUrl: [],
      storageFileId: ""
    });
    
    navigate.back();
  };

  // submit
  const handleAddCategory = async () => {
    if (
      newCategory.name == "" ||
      newCategory.categoryImgUrl.length == 0
    ) {
      return toast.error("all fields are required");
    }
    
    try {
      await addCategory(newCategory);
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Add category successfully");
      navigate.push("/admin/categories");
    } catch (error) {
      console.log(error);
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
              Avval yaratilgan category draft'i mavjud. Uni tiklashni xohlaysizmi?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={loadDraft}
                className="flex-1"
              >
                Ha, tiklash
              </Button>
              <Button
                onClick={deleteDraft}
                variant="outline"
                className="flex-1"
              >
                Yo'q, o'chirish
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative flex size-full justify-center">
        <div className="flex flex-col gap-4 md:w-[512px] py-5 max-w-[960px] flex-1 px-4">
          <div className="flex flex-wrap justify-between gap-3 mb-5">
            <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">Add Category</h2>
          </div>
          {/* Upload Images */}
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-x-4 flex-wrap'>
              {newCategory.categoryImgUrl.length > 0 && newCategory.categoryImgUrl.map((img, index) => (
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
            {newCategory.categoryImgUrl.length === 0 && (
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
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
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
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
              onClick={handleAddCategory}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              Add category
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateCategory
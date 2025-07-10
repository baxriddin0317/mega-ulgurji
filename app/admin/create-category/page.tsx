"use client"
import { Button } from '@/components/ui/button'
import { fireStorage } from '@/firebase/config';
import { CategoryI, ImageT } from '@/lib/types';
import useCategoryStore from '@/store/useCategoryStore';
import useDraftStore from '@/store/useDraftStore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { GrGallery } from 'react-icons/gr';
import { v4 as uuidv4 } from 'uuid';

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
  const { 
    saveCategoryDraft, 
    loadCategoryDraft, 
    deleteCategoryDraft, 
    removeCategoryDraft,
    hasCategoryDraft 
  } = useDraftStore();

  // Component yuklanganda draft'ni tekshirish
  useEffect(() => {
    if (hasCategoryDraft()) {
      setShowDraftModal(true);
    }
  }, [hasCategoryDraft]);

  // Draft'ni yuklash
  const handleLoadDraft = () => {
    const draftData = loadCategoryDraft();
    if (draftData) {
      setNewCategory(draftData.newCategory || {
        id: "",
        name: "",
        description: "",
        categoryImgUrl: [],
        storageFileId: ""
      });
      toast.success("Draft muvaffaqiyatli tiklandi");
    }
    setShowDraftModal(false);
  };

  // Draft'ni o'chirish
  const handleDeleteDraft = async () => {
    await deleteCategoryDraft();
    setShowDraftModal(false);
    toast.success("Draft muvaffaqiyatli o'chirildi");
  };

  // Ma'lumotlar o'zgarganda draft'ni saqlash
  useEffect(() => {
    if (newCategory.categoryImgUrl.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCategoryDraft({
          newCategory
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [newCategory, saveCategoryDraft]);

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
      
      toast.success("Rasmlar muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Rasmlarni yuklashda xatolik yuz berdi");
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
      toast.success("Rasm muvaffaqiyatli o'chirildi");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Rasmni o'chirishda xatolik yuz berdi");
    }
  };

  // handle cencel
  const handleCancel = async () => {
    await deleteCategoryDraft();
    
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
      return toast.error("Barcha maydonlarni to'ldiring");
    }
    
    try {
      await addCategory(newCategory);
      removeCategoryDraft();
      toast.success("Kategoriya muvaffaqiyatli qo'shildi");
      navigate.push("/admin/categories");
    } catch (error) {
      console.log(error);
      toast.error("Kategoriya qo'shilmadi");
    }
  };
  
  return (
    <>
      {/* Draft modal */}
      {showDraftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Qoralama topildi</h3>
            <p className="text-gray-600 mb-6">
              Avval yaratilgan kategoriya qoralamasi mavjud. Uni tiklashni xohlaysizmi?
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
        <div className="flex flex-col gap-4 md:w-[512px] py-5 max-w-[960px] flex-1 px-4">
          <div className="flex flex-wrap justify-between gap-3 mb-5">
            <h2 className="text-brand-black-text tracking-light text-4xl font-bold leading-tight min-w-72">Kategoriya qo&apos;shish</h2>
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
            {newCategory.categoryImgUrl.length === 0 && (
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
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </label>
          </div>
          {/* category description */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-brand-black-text text-base font-medium leading-normal pb-2">Tavsif</p>
              <textarea
                placeholder="Kategoriya tavsifini kiriting"
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
              <span className="truncate">Bekor qilish</span>
            </Button>
            <Button
              type='button'
              variant={'default'}
              onClick={handleAddCategory}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              {loading ? 'Yuklanmoqda..' : "Kategoriya qo'shish"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateCategory
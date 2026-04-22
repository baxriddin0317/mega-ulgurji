"use client"
import { Button } from '@/components/ui/button'
import { fireStorage } from '@/firebase/config';
import { CategoryI, ImageT } from '@/lib/types';
import { sanitizeFilename } from '@/lib/sanitizeFilename';
import useCategoryStore from '@/store/useCategoryStore';
import useDraftStore from '@/store/useDraftStore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { CgClose } from 'react-icons/cg';
import { ImagePlus, Loader2, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

const CreateCategory = () => {
  const [imageUploading, setImageUploading] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryI>({
    id: "",
    name: "",
    description: "",
    categoryImgUrl: [] as ImageT[],
    storageFileId: "",
    subcategory: []
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
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (hasCategoryDraft()) {
      setShowDraftModal(true);
    }
  }, [hasCategoryDraft]);

  const handleLoadDraft = () => {
    const draftData = loadCategoryDraft();
    if (draftData) {
      setNewCategory(draftData.newCategory || {
        id: "",
        name: "",
        description: "",
        categoryImgUrl: [],
        storageFileId: "",
        subcategory: []
      });
      toast.success("Qoralama tiklandi");
    }
    setShowDraftModal(false);
  };

  const handleDeleteDraft = async () => {
    await deleteCategoryDraft();
    setShowDraftModal(false);
    toast.success("Qoralama o'chirildi");
  };

  useEffect(() => {
    if (newCategory.categoryImgUrl.length > 0) {
      const timeoutId = setTimeout(() => {
        saveCategoryDraft({ newCategory });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [newCategory, saveCategoryDraft]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImageUploading(true);

    let currentStorageFileId = newCategory.storageFileId;
    if (currentStorageFileId.length === 0) {
      currentStorageFileId = uuidv4();
      setNewCategory((prev) => ({ ...prev, storageFileId: currentStorageFileId }));
    }

    try {
      const validFiles = Array.from(files).filter((f) => {
        if (!f.type.startsWith('image/')) {
          toast.error(`${f.name} rasm fayli emas`);
          return false;
        }
        if (f.size > MAX_FILE_BYTES) {
          toast.error(`${f.name} 10 MB dan katta`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        setImageUploading(false);
        return;
      }

      const uploadPromises = validFiles.map(async (file) => {
        const safeName = sanitizeFilename(file.name);
        const storageRef = ref(fireStorage, `categories/${currentStorageFileId}/${safeName}`);
        await uploadBytes(storageRef, file, { contentType: file.type || 'application/octet-stream' });
        const downloadUrl = await getDownloadURL(storageRef);
        return { url: downloadUrl, path: storageRef.fullPath };
      });

      const imageUrls = await Promise.all(uploadPromises);

      setNewCategory((prev) => ({
        ...prev,
        categoryImgUrl: [...prev.categoryImgUrl, ...imageUrls]
      }));

      toast.success(`${imageUrls.length} ta rasm yuklandi`);
    } catch (error) {
      console.error("Error uploading images:", error);
      if (error instanceof FirebaseError) {
        if (error.code === 'storage/unauthorized') {
          toast.error("Ruxsat yo'q — admin sifatida kiring");
        } else if (error.code === 'storage/quota-exceeded') {
          toast.error("Xotira to'ldi — adminga murojaat qiling");
        } else if (error.code === 'storage/retry-limit-exceeded') {
          toast.error("Internet ulanishini tekshiring va qayta urining");
        } else {
          toast.error(`Rasmni yuklab bo'lmadi: ${error.code}`);
        }
      } else {
        toast.error("Rasmlarni yuklashda xatolik yuz berdi");
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return;
    const imageRef = ref(fireStorage, `categories/${newCategory.storageFileId}/${fileName}`);
    try {
      await deleteObject(imageRef);
      setNewCategory((prev) => ({
        ...prev,
        categoryImgUrl: prev.categoryImgUrl.filter((url) => url.path !== imageUrl),
      }));
      toast.success("Rasm o'chirildi");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Rasmni o'chirishda xatolik yuz berdi");
    }
  };

  const handleCancel = async () => {
    await deleteCategoryDraft();
    setNewCategory({
      id: "",
      name: "",
      description: "",
      categoryImgUrl: [],
      storageFileId: "",
      subcategory: []
    });
    navigate.back();
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed === "") {
      toast.error("Subkategoriya bo'sh bo'lishi mumkin emas");
      return;
    }
    if (newCategory.subcategory?.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Bu subkategoriya allaqachon mavjud");
      return;
    }
    setNewCategory({
      ...newCategory,
      subcategory: [...(newCategory.subcategory || []), trimmed]
    });
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setNewCategory({
      ...newCategory,
      subcategory: (newCategory.subcategory || []).filter(t => t !== tag)
    });
  };

  const handleAddCategory = async () => {
    if (newCategory.name.trim() === "") {
      return toast.error("Kategoriya nomini kiriting");
    }
    if (newCategory.categoryImgUrl.length === 0) {
      return toast.error("Kamida bitta rasm yuklang");
    }
    if (newCategory.subcategory.length < 1) {
      return toast.error("Kamida bitta subkategoriya qo'shing");
    }

    try {
      await addCategory(newCategory);
      removeCategoryDraft();
      toast.success("Kategoriya qo'shildi");
      navigate.push("/admin/categories");
    } catch (error) {
      console.log(error);
      toast.error("Kategoriya qo'shilmadi");
    }
  };

  return (
    <>
      {showDraftModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 sm:p-6 rounded-2xl max-w-md w-full shadow-2xl">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Qoralama topildi</h3>
            <p className="text-sm text-gray-600 mb-5">
              Avval yaratilgan kategoriya qoralamasi mavjud. Uni tiklashni xohlaysizmi?
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <Button onClick={handleDeleteDraft} variant="outline" className="flex-1 h-11 rounded-xl">
                Yo&apos;q, o&apos;chirish
              </Button>
              <Button onClick={handleLoadDraft} className="flex-1 h-11 rounded-xl">
                Ha, tiklash
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-5 sm:mb-8">
          <h2 className="text-brand-black-text text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            Kategoriya qo&apos;shish
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Yangi kategoriya yarating va subkategoriyalarini belgilang
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Image Upload */}
          <section>
            <label className="text-brand-black-text text-sm sm:text-base font-semibold block mb-2">
              Kategoriya rasmlari*
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
              {newCategory.categoryImgUrl.map((img, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 ring-1 ring-gray-200">
                  <Image
                    className="object-cover"
                    src={img.url}
                    fill
                    sizes="(max-width: 640px) 33vw, 25vw"
                    alt={`category image ${index + 1}`}
                  />
                  <button
                    type="button"
                    aria-label="Rasmni o'chirish"
                    className="absolute top-1.5 right-1.5 z-10 flex items-center justify-center size-7 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md active:scale-95 transition"
                    onClick={() => handleDeleteImage(img.path)}
                  >
                    <CgClose size={14} className="text-black" />
                  </button>
                </div>
              ))}

              <label
                htmlFor="upload"
                className={`flex flex-col items-center justify-center gap-1.5 aspect-square rounded-xl sm:rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  imageUploading
                    ? 'border-gray-200 bg-gray-50 opacity-70 cursor-wait'
                    : 'border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100 active:scale-[0.98]'
                }`}
              >
                {imageUploading ? (
                  <>
                    <Loader2 className="size-5 sm:size-6 text-gray-500 animate-spin" />
                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Yuklanmoqda</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-5 sm:size-6 text-gray-500" />
                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium">Rasm qo&apos;shish</span>
                  </>
                )}
              </label>
              <input
                className="sr-only"
                id="upload"
                type="file"
                multiple
                disabled={imageUploading}
                onChange={(e) => handleImageUpload(e.target.files)}
                accept="image/*"
              />
            </div>
            {newCategory.categoryImgUrl.length === 0 && (
              <p className="text-red-500 text-xs sm:text-sm mt-2">Kamida bitta rasm talab qilinadi</p>
            )}
          </section>

          {/* Category name */}
          <div>
            <label htmlFor="cat-name" className="text-brand-black-text text-sm sm:text-base font-semibold block mb-2">
              Kategoriya nomi*
            </label>
            <input
              id="cat-name"
              placeholder="Masalan: Oshxona mebellari"
              className="w-full h-12 sm:h-12 rounded-xl text-brand-black-text border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 px-4 text-sm sm:text-base font-normal transition"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            />
          </div>

          {/* Subcategory */}
          <div>
            <label htmlFor="subcat" className="text-brand-black-text text-sm sm:text-base font-semibold block mb-2">
              Subkategoriya qo&apos;shish*
            </label>
            <div className="flex gap-2">
              <input
                id="subcat"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); }
                }}
                placeholder="Subkategoriya nomi"
                className="flex-1 min-w-0 h-12 rounded-xl text-brand-black-text border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 px-4 text-sm sm:text-base font-normal transition"
              />
              <Button
                onClick={handleAddTag}
                type="button"
                className="shrink-0 h-12 px-4 sm:px-5 bg-black hover:bg-gray-800 text-white font-semibold rounded-xl text-sm"
              >
                <Plus className="size-4 sm:hidden" />
                <span className="hidden sm:inline">Qo&apos;shish</span>
              </Button>
            </div>
            {newCategory.subcategory.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {newCategory.subcategory.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 text-brand-black-text px-3 py-1.5 rounded-full text-xs sm:text-sm border border-gray-200"
                  >
                    <span className="max-w-[160px] truncate">{tag}</span>
                    <button
                      type="button"
                      aria-label={`${tag} ni o'chirish`}
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 text-gray-500 hover:text-red-500 transition cursor-pointer"
                    >
                      <CgClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="desc" className="text-brand-black-text text-sm sm:text-base font-semibold block mb-2">
              Tavsif
            </label>
            <textarea
              id="desc"
              placeholder="Kategoriya haqida qisqacha ma'lumot"
              rows={4}
              className="w-full rounded-xl text-brand-black-text border border-gray-200 bg-gray-50 focus:bg-white focus:border-black focus:outline-none focus:ring-2 focus:ring-black/5 placeholder:text-gray-400 p-4 text-sm sm:text-base font-normal resize-none min-h-28 transition"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row sm:justify-end sticky bottom-0 sm:static pt-2 sm:pt-0 bg-white pb-[env(safe-area-inset-bottom)]">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="bg-gray-100 hover:bg-gray-200 text-brand-black-text rounded-xl h-12 px-6 cursor-pointer text-sm font-semibold tracking-wide w-full sm:w-auto"
            >
              Bekor qilish
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleAddCategory}
              disabled={loading || imageUploading}
              className="flex items-center justify-center rounded-xl h-12 px-6 bg-black text-white hover:bg-gray-900 text-sm font-semibold tracking-wide w-full sm:w-auto cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Yuklanmoqda...' : "Kategoriya qo'shish"}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateCategory

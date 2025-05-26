import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategoryI } from '@/lib/types';
import { deleteObject, ref } from 'firebase/storage';
import { fireStorage } from '@/firebase/config';
import toast from 'react-hot-toast';

interface CategoryDraftData {
  newCategory: CategoryI;
  timestamp: number;
}

interface ProductDraftData {
  newProduct: any;
  timestamp: number;
}

interface DraftStore {
  // Category draft
  categoryDraft: CategoryDraftData | null;
  
  // Product draft (kelajakda)
  productDraft: ProductDraftData | null;
  
  // Category draft actions
  saveCategoryDraft: (data: Omit<CategoryDraftData, 'timestamp'>) => void;
  loadCategoryDraft: () => CategoryDraftData | null;
  deleteCategoryDraft: () => Promise<void>;
  removeCategoryDraft: () => void;
  hasCategoryDraft: () => boolean;
  
  // Product draft actions (kelajakda)
  saveProductDraft: (data: Omit<ProductDraftData, 'timestamp'>) => void;
  loadProductDraft: () => ProductDraftData | null;
  deleteProductDraft: () => Promise<void>;
  removeProductDraft: () => void;
  hasProductDraft: () => boolean;
  
  // Utility functions
  clearAllDrafts: () => Promise<void>;
  isDraftExpired: (timestamp: number, expiryHours?: number) => boolean;
}

const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      categoryDraft: null,
      productDraft: null,

      // Category Draft Actions
      saveCategoryDraft: (data) => {
        const draftData: CategoryDraftData = {
          ...data,
          timestamp: Date.now()
        };
        set({ categoryDraft: draftData });
      },

      loadCategoryDraft: () => {
        const { categoryDraft, isDraftExpired } = get();
        
        if (!categoryDraft) return null;
        
        // 24 soatdan eski draft'larni o'chirish
        if (isDraftExpired(categoryDraft.timestamp, 24)) {
          get().deleteCategoryDraft();
          return null;
        }
        
        return categoryDraft;
      },

      deleteCategoryDraft: async () => {
        const { categoryDraft } = get();
        
        if(categoryDraft == null) return;

        if (categoryDraft?.newCategory?.categoryImgUrl?.length > 0) {
          // Draft'dagi rasmlarni storage'dan o'chirish
          const deletePromises = categoryDraft.newCategory.categoryImgUrl.map(async (img) => {
            try {
              const imageRef = ref(fireStorage, img.path);
              await deleteObject(imageRef);
            } catch (error) {
              console.error("Error deleting draft image:", error);
            }
          });
          
          await Promise.all(deletePromises);
        }
        
        set({ categoryDraft: null });
      },

      removeCategoryDraft: () => {
        set({ categoryDraft: null });
      },

      hasCategoryDraft: () => {
        const { categoryDraft, isDraftExpired } = get();
        
        if (!categoryDraft) return false;
        
        // Eski draft'ni tekshirish
        if (isDraftExpired(categoryDraft.timestamp, 24)) {
          get().deleteCategoryDraft();
          return false;
        }
        
        return true;
      },

      // Product Draft Actions (kelajakda ishlatish uchun)
      saveProductDraft: (data) => {
        const draftData: ProductDraftData = {
          ...data,
          timestamp: Date.now()
        };
        set({ productDraft: draftData });
      },

      loadProductDraft: () => {
        const { productDraft, isDraftExpired } = get();
        
        if (!productDraft) return null;
        
        if (isDraftExpired(productDraft.timestamp, 24)) {
          get().deleteProductDraft();
          return null;
        }
        
        return productDraft;
      },

      deleteProductDraft: async () => {
        const { productDraft } = get();
        if(productDraft == null) return;

        // Product rasmlarini o'chirish logikasi
        if (productDraft?.newProduct?.productImgUrl?.length > 0) {
          const deletePromises = productDraft.newProduct.productImgUrl.map(async (img: any) => {
            try {
              const imageRef = ref(fireStorage, img.path);
              await deleteObject(imageRef);
            } catch (error) {
              console.error("Error deleting product draft image:", error);
            }
          });
          
          await Promise.all(deletePromises);
        }
        
        set({ productDraft: null });
      },

      removeProductDraft: () => {
        set({ productDraft: null });
      },

      hasProductDraft: () => {
        const { productDraft, isDraftExpired } = get();
        
        if (!productDraft) return false;
        
        if (isDraftExpired(productDraft.timestamp, 24)) {
          get().deleteProductDraft();
          return false;
        }
        
        return true;
      },

      // Utility Functions
      clearAllDrafts: async () => {
        await get().deleteCategoryDraft();
        await get().deleteProductDraft();
        toast.success("All drafts cleared");
      },

      isDraftExpired: (timestamp, expiryHours = 24) => {
        const now = Date.now();
        const expiryTime = expiryHours * 60 * 60 * 1000; // hours to milliseconds
        return (now - timestamp) > expiryTime;
      }
    }),
    {
      name: 'draft-storage', // localStorage key
      partialize: (state) => ({
        categoryDraft: state.categoryDraft,
        productDraft: state.productDraft
      })
    }
  )
);

export default useDraftStore;
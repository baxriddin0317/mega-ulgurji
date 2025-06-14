import React, { useEffect, useMemo } from 'react'
import { Button } from '../ui/button';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Image from 'next/image';
import useCategoryStore from '@/store/useCategoryStore';
import { useRouter } from 'next/navigation';
import { CategoryI } from '@/lib/types';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { fireStorage } from '@/firebase/config';
import toast from 'react-hot-toast';

interface CategoryTableProps {
  search: string;
}

const CategoryTable = ({ search }: CategoryTableProps) => {
  const { categories, fetchCategories, deleteCategory } = useCategoryStore();

  const navigate = useRouter()

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Search filter logic
  const filteredCategories = useMemo(() => {
    if (search.length < 2) {
      return categories;
    }
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const handleEdit = (id: string) => {
    navigate.push(`/admin/update-category/${id}`);
  }

  const handleDelete = async (item: CategoryI) => {
    if (item.id) {
      const imageFolderRef = ref(
        fireStorage,
        `categories/${item.storageFileId}`
      );
      const imageRefs = await listAll(imageFolderRef);

      const deleteImagePromises = imageRefs.items.map(async (itemRef) => {
        await deleteObject(itemRef);
      });
      await Promise.all(deleteImagePromises);
      deleteCategory(item.id);
      toast.success("Product Deleted Successfully");
    }
  };

  return (
     <div className="w-full px-4 py-3">
      {/* Desktop and Tablet view */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full w-full">
          <thead>
            <tr className="bg-white">
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Title</th>
              <th className="px-4 py-3 text-left text-black text-sm font-medium">Image</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Edit</th>
              <th className="px-4 py-3 text-black text-sm font-medium text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-20 px-4 py-2 text-center text-gray-500">
                  {search.length >= 2 ? 'No category found' : 'No category available'}
                </td>
              </tr>
            ) : (filteredCategories.map((category) => (
              <tr key={category.id} className="border-t border-gray-200">
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">
                  {category.name}
                </td>
               <td className="h-20 px-4 py-2 text-sm font-normal">
                  <div className='size-16 relative overflow-hidden rounded-2xl'>
                    <Image className='absolute size-full object-cover' src={category.categoryImgUrl[0].url} fill alt={category.name} />
                  </div>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-gray-700 text-sm font-normal">
                  <Button onClick={() => handleEdit(category.id)} className='flex items-center justify-center mx-auto cursor-pointer' variant={'ghost'}>
                    <BiEdit size={24} />
                  </Button>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-sm font-normal">
                  <Button onClick={() => handleDelete(category)} className="flex items-center justify-center mx-auto cursor-pointer" variant={'default'}>
                    <BiTrash size={24} />
                  </Button>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center text-gray-500">
            {search.length >= 2 ? 'No category found' : 'No category available'}
          </div>
        ) : (filteredCategories.map((category, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-black">{category.name}</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Image</span>
                <div className='size-16 relative overflow-hidden rounded-2xl'>
                  <Image className='absolute size-full object-cover' src={category.categoryImgUrl[0].url} fill alt={category.name} />
                </div>
              </div>
              
              <div className="flex flex-1 gap-3 flex-wrap pt-3 justify-end">
                <Button
                  onClick={() => handleEdit(category.id)}
                  variant={'secondary'}
                  className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Update</span>
                </Button>
                <Button
                  onClick={() => handleDelete(category)}
                  variant={'default'}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
}

export default CategoryTable
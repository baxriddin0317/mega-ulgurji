import React from 'react'
import { Button } from '../ui/button';
import { BiEdit, BiTrash } from 'react-icons/bi';
import Image from 'next/image';

const categories = [
    {
      id: "234ashvjwhd",
      title: "Runnr Free Metcon 5",
      Image: "https://picsum.photos/200/300",
    },
    {
      id: "123ashvjwhd",
      title: "Air Jordan 1 Mid",
      Image: "https://picsum.photos/200/300",
    },
    {
      id: "879ashvjwhd",
      title: "Adidas Ultraboost 22",
      Image: "https://picsum.photos/200/300",
    },
    {
      id: "654ashvjwhd",
      title: "New Balance 990v5",
      Image: "https://picsum.photos/200/300",
    },
    {
      id: "254ashvjwhd",
      title: "Puma RS-X",
      Image: "https://picsum.photos/200/300",
    },
  ];

const CategoryTable = () => {
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
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-gray-200">
                <td className="h-20 px-4 py-2 text-black text-sm font-normal">
                  {category.title}
                </td>
               <td className="h-20 px-4 py-2 text-sm font-normal">
                  <div className='size-16 relative overflow-hidden rounded-2xl'>
                    <Image className='absolute size-full object-cover' src={category.Image} fill alt={category.title} />
                  </div>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-gray-700 text-sm font-normal">
                  <Button className='flex items-center justify-center mx-auto cursor-pointer' variant={'ghost'}>
                    <BiEdit size={24} />
                  </Button>
                </td>
                <td className="w-20 h-20 px-4 py-2 text-sm font-normal">
                  <Button className="flex items-center justify-center mx-auto cursor-pointer" variant={'default'}>
                    <BiTrash size={24} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view - Card layout */}
      <div className="md:hidden space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-black">{category.title}</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Image</span>
                <div className='size-16 relative overflow-hidden rounded-2xl'>
                  <Image className='absolute size-full object-cover' src={category.Image} fill alt={category.title} />
                </div>
              </div>
              
              <div className="flex flex-1 gap-3 flex-wrap pt-3 justify-end">
                <Button
                  variant={'secondary'}
                  className="bg-[#e7edf3] rounded-xl h-10 px-4 cursor-pointer text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Update</span>
                </Button>
                <Button
                  variant={'default'}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-black text-white text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryTable
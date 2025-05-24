"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { BiFolderPlus } from 'react-icons/bi'
import { LuBookPlus } from 'react-icons/lu'

const Menu = () => {
  const pathname = usePathname();
  
  // Function to check if link is active
  const isActive = (path:string) => {
      // Exact path matching
    if (pathname === path) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="flex flex-col gap-2 py-4">
      <Link href={'/admin'} className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-link-hover ${isActive('/admin') ? 'bg-brand-gray-100' : ''}`}>
        <div className="text-black" data-icon="Table" data-size="24px" data-weight="fill">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
            <path
              d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM40,112H80v32H40Zm56,0H216v32H96ZM40,160H80v32H40Zm176,32H96V160H216v32Z"
            ></path>
          </svg>
        </div>
        <p className="text-black text-sm font-medium leading-normal">Products</p>
      </Link>
      <Link href={'/admin/categories'} className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-link-hover ${isActive('/admin/categories') ? 'bg-brand-gray-100' : ''}`}>
        <div className="text-black" data-icon="Package" data-size="24px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
            <path
              d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.34,44-29.77,16.3-80.35-44ZM128,120,47.66,76l33.9-18.56,80.34,44ZM40,90l80,43.78v85.79L40,175.82Zm176,85.78h0l-80,43.79V133.82l32-17.51V152a8,8,0,0,0,16,0V107.55L216,90v85.77Z"
            ></path>
          </svg>
        </div>
        <p className="text-black text-sm font-medium leading-normal">Categories</p>
      </Link>
      <Link href={'/admin/create-product'} className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-link-hover ${isActive('/admin/create-product') ? 'bg-brand-gray-100' : ''}`}>
        <BiFolderPlus size={24} />
        <p className="text-black text-sm font-medium leading-normal">Add product</p>
      </Link>
      <Link href={'/admin/create-category'} className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-link-hover ${isActive('/admin/create-category') ? 'bg-brand-gray-100' : ''}`}>
        <LuBookPlus size={24} />
        <p className="text-black text-sm font-medium leading-normal">Add category</p>
      </Link>
    </div>
  )
}

export default Menu
"use client"
import { useSidebarStore } from "@/store/useToggleStore";
import React from "react";
import Menu from "./Menu";
import Link from "next/link";
import Image from "next/image";

const Sidebar = () => {
 const { isOpen } = useSidebarStore();

  return (
    <aside className={`hidden lg:inline-block sticky ${isOpen ? "translate-x-0 w-64 p-4" : "-translate-x-full w-0"} overflow-hidden top-0 left-0 h-screen bg-white shadow-md text-black transition-all duration-300 ease-in-out`}>
      <div className="flex items-center gap-2 mb-6">
        <Link href={'/'} className="relative flex w-6 h-8">
          <Image className="absolute size-full object-cover" src="/images/logo.png" fill alt="site logo" />
        </Link>
        <h2 className="text-xl font-bold">
          Mega
        </h2>
      </div>
      <Menu />
    </aside>
  );
};

export default Sidebar;

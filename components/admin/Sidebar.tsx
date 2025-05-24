"use client"
import { useSidebarStore } from "@/store/useToggleStore";
import React from "react";
import Menu from "./Menu";

const Sidebar = () => {
 const { isOpen } = useSidebarStore();

  return (
    <aside className={`hidden lg:inline-block sticky ${isOpen ? "translate-x-0 w-64 p-4" : "-translate-x-full w-0"} overflow-hidden top-0 left-0 h-screen bg-white shadow-md text-black transition-all duration-300 ease-in-out`}>
      <h2 className="text-xl font-bold mb-6">Logo</h2>
      <Menu />
    </aside>
  );
};

export default Sidebar;

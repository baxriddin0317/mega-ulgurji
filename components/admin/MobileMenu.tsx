import {
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import Menu from "./Menu";
import Image from "next/image";

const MobileMenu = () => {
  
  return (
    <SheetContent side='left' className="w-64 p-4">
      <SheetTitle className="text-xl font-bold mb-6">
        <Image className="absolute size-full object-cover" src="/images/BRAND-LOGO.png" fill alt="site logo" />
      </SheetTitle>
      <Menu />
    </SheetContent>
  )
}

export default MobileMenu
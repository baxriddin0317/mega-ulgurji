import {
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import Menu from "./Menu";
import Image from "next/image";
import Link from "next/link";

const MobileMenu = () => {
  
  return (
    <SheetContent side='left' className="w-64 p-4">
      <SheetTitle className="text-xl font-bold">
        <Link href={'/'} className="relative flex w-56 h-20">
          <Image className="absolute object-cover" src="/images/BRAND-LOGO.png" fill alt="site logo" />
        </Link>
      </SheetTitle>
      <Menu />
    </SheetContent>
  )
}

export default MobileMenu
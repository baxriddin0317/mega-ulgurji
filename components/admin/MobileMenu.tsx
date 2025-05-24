import {
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import Menu from "./Menu";

const MobileMenu = () => {
  
  return (
    <SheetContent side='left' className="w-64 p-4">
      <SheetTitle className="text-xl font-bold mb-6">Logo</SheetTitle>
      <Menu />
    </SheetContent>
  )
}

export default MobileMenu
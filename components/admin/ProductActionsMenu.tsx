"use client";
/**
 * Enterprise-ERP overflow menu for /admin/products (SAP Fiori "actions" pattern).
 *
 * Before: seven coloured chips in a horizontal `overflow-x-auto scrollbar-hide`
 * row on mobile — the user couldn't see anything past the first three
 * because there was no scroll indicator.
 *
 * Now: two primary actions stay visible (Excel export + Import — the daily
 * drivers for a wholesale shop owner), everything else collapses into one
 * grouped dropdown. Destructive "delete all" lives at the bottom in its own
 * red row, protected by its own confirm modal.
 *
 * All actions stay a single tap away, and the whole set is discoverable
 * from one button instead of seven hidden chips.
 */
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileSpreadsheet,
  MoreHorizontal,
  Percent,
  RefreshCw,
  ScrollText,
  Trash2,
  Upload,
} from "lucide-react";

export interface ProductActionsMenuProps {
  hasProducts: boolean;
  onBulkPriceUpdate: () => void;
  onExportForUpdate: () => void;
  onDownloadTemplate: () => void;
  onReimport: () => void;
  onDeleteAll: () => void;
}

export default function ProductActionsMenu({
  hasProducts,
  onBulkPriceUpdate,
  onExportForUpdate,
  onDownloadTemplate,
  onReimport,
  onDeleteAll,
}: ProductActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-xl gap-1.5 cursor-pointer text-sm shrink-0 px-3 sm:px-4"
          aria-label="Boshqa amallar"
        >
          <MoreHorizontal className="size-4" />
          <span className="hidden xs:inline">Yana</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 max-h-[70vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
          Eksport
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onExportForUpdate}
          className="py-2.5 cursor-pointer gap-3"
        >
          <ScrollText className="size-4 text-cyan-600 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm">Tahrirlash uchun eksport</span>
            <span className="text-[11px] text-gray-500 leading-tight">
              ID ustuni bilan — keyin yangilash uchun
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDownloadTemplate}
          className="py-2.5 cursor-pointer gap-3"
        >
          <FileSpreadsheet className="size-4 text-blue-600 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm">Shablon yuklab olish</span>
            <span className="text-[11px] text-gray-500 leading-tight">
              Bo&apos;sh Excel — yangi import uchun
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
          Import
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onReimport}
          className="py-2.5 cursor-pointer gap-3"
        >
          <RefreshCw className="size-4 text-orange-600 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm">Yangilash uchun import</span>
            <span className="text-[11px] text-gray-500 leading-tight">
              Tahrirlangan Excel faylni qayta yuklash
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
          Ommaviy tahrir
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onBulkPriceUpdate}
          className="py-2.5 cursor-pointer gap-3"
        >
          <Percent className="size-4 text-amber-600 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm">Narxni ommaviy yangilash</span>
            <span className="text-[11px] text-gray-500 leading-tight">
              Foiz yoki fiks summa bilan
            </span>
          </div>
        </DropdownMenuItem>

        {hasProducts && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDeleteAll}
              className="py-2.5 cursor-pointer gap-3 text-red-600 focus:text-red-700 focus:bg-red-50"
            >
              <Trash2 className="size-4 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm">Hammasini o&apos;chirish</span>
                <span className="text-[11px] text-red-400 leading-tight">
                  Qaytarib bo&apos;lmaydi
                </span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ProductPrimaryActionsProps {
  /** Whether there are any products — affects "Excel" disabled state */
  hasProducts: boolean;
  onExportExcel: () => void;
  onImport: () => void;
}

/**
 * Companion: the two always-visible primary buttons (Excel + Import).
 * Sized at h-10 so one-thumb taps land reliably on Samsung devices.
 */
export function ProductPrimaryActions({
  hasProducts,
  onExportExcel,
  onImport,
}: ProductPrimaryActionsProps) {
  return (
    <>
      <Button
        variant="outline"
        className="h-10 rounded-xl gap-1.5 cursor-pointer text-sm shrink-0 px-3 sm:px-4 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 btn-press disabled:opacity-50"
        onClick={onExportExcel}
        disabled={!hasProducts}
      >
        <Download className="size-4" />
        <span>Excel</span>
      </Button>
      <Button
        variant="outline"
        className="h-10 rounded-xl gap-1.5 cursor-pointer text-sm shrink-0 px-3 sm:px-4 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800 btn-press"
        onClick={onImport}
      >
        <Upload className="size-4" />
        <span>Import</span>
      </Button>
    </>
  );
}

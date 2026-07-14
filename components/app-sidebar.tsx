"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  SproutIcon,
  CoinsIcon,
  HomeIcon,
  DownloadIcon,
  MapPlusIcon,
  MapPinnedIcon,
  Grid2x2Check,
  Grid2x2Plus,
} from "lucide-react"

// ─── Nav item definition ───────────────────────────────────────────────────────
interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  subLabel: string
}

interface NavGroup {
  category: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    category: "Produksi Komoditas",
    items: [
      {
        href: "/dashboard/produktivitas-jatim",
        icon: <SproutIcon size={20} />,
        label: "Produktivitas Kedelai",
        subLabel: "Tren",
      },
      {
        href: "/dashboard/peta-produktivitas",
        icon: <MapPinnedIcon size={20} />,
        label: "Peta Persebaran Produktivitas",
        subLabel: "Peta",
      },
      {
        href: "/dashboard/tabel-produktivitas",
        icon: <Grid2x2Check size={20} />,
        label: "Tabel Data Produktivitas",
        subLabel: "Tabel",
      },
    ],
  },
  {
    category: "Harga Komoditas",
    items: [
      {
        href: "/dashboard/harga-jatim",
        icon: <CoinsIcon size={20} />,
        label: "Harga Komoditas Kedelai",
        subLabel: "Tren",
      },
      {
        href: "/dashboard/peta-harga",
        icon: <MapPlusIcon size={20} />,
        label: "Peta Sebaran Harga",
        subLabel: "Peta",
      },
      {
        href: "/dashboard/tabel-harga",
        icon: <Grid2x2Plus size={20} />,
        label: "Tabel Harga Komoditas",
        subLabel: "Tabel",
      },
    ],
  },
]

// ─── Category label split into two words for stacked display ──────────────────
function CategoryLabel({ category }: { category: string }) {
  const words = category.split(" ")
  return (
    <div className="flex flex-col items-center mt-4 mb-2">
      <div className="w-5 h-[1px] bg-green-400/30 mb-2" />
      {words.map((word, index) => (
        <span
          key={index}
          className={`text-center tracking-widest uppercase leading-tight ${
            index === 0
              ? "text-[9px] font-bold text-green-300 opacity-90"
              : "text-[8px] font-medium text-green-300/60"
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  )
}

// ─── Single nav item button ───────────────────────────────────────────────────
function NavItemButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <SidebarMenuItem className="flex justify-center w-full">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={`group flex flex-col items-center justify-center w-[60px] h-[60px] rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-green-400/15 border border-green-400/30 text-green-300 shadow-[0_0_12px_rgba(134,239,172,0.1)]"
                : "border border-transparent text-white/50 hover:bg-white/5 hover:border-green-400/20 hover:text-white/90"
            }`}
          >
            <div className="mb-1 transition-transform group-hover:-translate-y-0.5 group-active:scale-95">
              {item.icon}
            </div>
            <span
              className={`text-[9px] font-semibold tracking-wider uppercase transition-colors ${
                isActive ? "text-green-300" : "text-white/40 group-hover:text-white/70"
              }`}
            >
              {item.subLabel}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-[#0f2d1a] text-green-50 border border-green-400/20 shadow-lg text-xs"
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    </SidebarMenuItem>
  )
}

// ─── Main sidebar component ───────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsible="none"
      // Mengatur lebar fix 96px, warna bg sesuai gambar, hapus border bawaan
      // className="w-[104px] bg-gradient-to-b from-[#0f2d1a] via-[#153821] to-[#0c1f13] border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.15)] sticky top-0 h-screen"
      className="w-[104px] bg-[#0f2d1a] to-[#0c1f13] border-r-0 shadow-[4px_0_24px_rgba(0,0,0,0.15)] sticky top-0 h-screen"
      {...props}
    >
      {/* ── Header: Logo ── */}
      <SidebarHeader className="p-0 pt-6 flex flex-col items-center">
        <Link href="/home" title="Kembali ke Landing Page" className="group">
          <div className="flex flex-col items-center">
            {/* Pastikan path logo sesuai di folder public Anda */}
            <img
              src="/LOGO ONLY SATU DATA.png"
              alt="Logo Satu Data"
              className="w-17 h-17 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {/* <div className="w-8 h-[2px] mt-4 bg-gradient-to-r from-transparent via-green-400/50 to-transparent rounded-full" /> */}
          </div>
        </Link>
      </SidebarHeader>

      {/* ── Main nav ── */}
      <SidebarContent className="flex flex-col items-center gap-2 overflow-y-auto pt-2 pb-4 scrollbar-hide px-0">
        {navGroups.map((group, index) => (
          <React.Fragment key={group.category}>
            {index > 0 && <div className="w-8 h-[1px] bg-white/10 rounded-full mt-2" />}
            <div className="flex flex-col items-center w-full">
              <CategoryLabel category={group.category} />
              <SidebarMenu className="flex flex-col gap-2 items-center w-full px-2 mt-2">
                {group.items.map((item) => (
                  <NavItemButton
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                  />
                ))}
              </SidebarMenu>
            </div>
          </React.Fragment>
        ))}
      </SidebarContent>

      {/* ── Footer: Utility ── */}
      <SidebarFooter className="pb-8 pt-4 flex flex-col items-center gap-4">
        <div className="w-8 h-[1px] bg-white/10 rounded-full" />
        <SidebarMenu className="flex flex-col gap-3 items-center">
          {/* Kembali ke Landing Page */}
          <SidebarMenuItem>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/home"
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/50 transition-all hover:bg-white/10 hover:text-white/90 hover:-translate-y-0.5 active:scale-95"
                >
                  <HomeIcon size={18} />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#0f2d1a] text-green-50 border border-green-400/20 shadow-lg text-xs"
              >
                Kembali ke Landing Page
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem>

          {/* Unduh PDF
          <SidebarMenuItem>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => alert("Fitur unduh PDF belum dikonfigurasi")}
                  className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-white/50 transition-all hover:bg-white/10 hover:text-white/90 hover:-translate-y-0.5 active:scale-95"
                >
                  <DownloadIcon size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[#0f2d1a] text-green-50 border border-green-400/20 shadow-lg text-xs"
              >
                Unduh Halaman (PDF)
              </TooltipContent>
            </Tooltip>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
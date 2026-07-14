import { type ReactNode } from "react"

// Layout ini dikosongkan — setiap halaman dashboard menggunakan
// SidebarProvider-nya sendiri mengikuti pola Shadcn.
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
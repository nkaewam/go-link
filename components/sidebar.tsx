"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Home, LayoutGrid, Code, BookOpen, Palette, Shapes, FileText, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutGrid, label: "Get started", href: "/get-started" },
  { icon: Code, label: "Develop", href: "/develop" },
  { icon: BookOpen, label: "Foundations", href: "/foundations" },
  { icon: Palette, label: "Styles", href: "/styles" },
  { icon: Shapes, label: "Components", href: "/components" },
  { icon: FileText, label: "Blog", href: "/blog" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[80px] bg-surface-container-low transition-transform hidden md:block">
      <div className="flex h-full flex-col items-center py-4">
        {/* Header / Search */}
        <div className="mb-6">
          <Button
            variant="filled"
            size="icon"
            className="h-14 w-14 rounded-2xl bg-primary-container text-on-primary-container hover:bg-primary-container/80 shadow-none"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 w-full flex flex-col items-center gap-2 overflow-y-auto px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 w-full py-2 transition-colors",
                  isActive
                    ? "text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-14 rounded-full transition-colors",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-transparent group-hover:bg-surface-container-highest"
                )}>
                  <item.icon className={cn("h-6 w-6")} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer / Theme Toggle */}
        <div className="mt-auto flex flex-col gap-4 pb-4">
          <Button variant="outlined" size="icon" className="h-10 w-10 rounded-full border-outline-variant text-on-surface-variant">
            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> {/* Placeholder for Pause/History */}
          </Button>
          <Button variant="outlined" size="icon" className="h-10 w-10 rounded-full border-outline-variant text-on-surface-variant">
            <Sun className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}

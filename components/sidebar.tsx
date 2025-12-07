"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Home, Table, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Table, label: "Browse", href: "/-/browse" },
  { icon: BarChart3, label: "Analytics", href: "/-/analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[80px] bg-surface-container-low transition-transform hidden md:block">
      <div className="flex h-full flex-col items-center py-4">
        {/* Header / Search */}
        <div className="mb-6">
          <Link href="/-/search">
            <Button
              variant="filled"
              size="icon"
              className="h-14 w-14 rounded-2xl bg-primary-container text-on-primary-container hover:bg-primary-container/80 shadow-none"
            >
              <Search className="h-5 w-5" />
            </Button>
          </Link>
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
                  <item.icon className={cn("h-5 w-5")} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

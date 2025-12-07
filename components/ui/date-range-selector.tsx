"use client"

import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export type DateRangePreset = "7d" | "30d" | "90d"

interface DateRangeSelectorProps {
  value: DateRangePreset
  onChange: (value: DateRangePreset) => void
  className?: string
  variant?: "icon-only" | "with-label"
}

export function DateRangeSelector({
  value,
  onChange,
  className,
  variant = "with-label",
}: DateRangeSelectorProps) {
  const options: Array<{ value: DateRangePreset; label: string }> = [
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
  ]

  if (variant === "icon-only") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {options.map((option, index) => {
          const isActive = value === option.value
          const isFirst = index === 0
          const isLast = index === options.length - 1
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-center p-2.5 transition-all",
                // Active button: full pill with primary color
                isActive && "rounded-[20px] bg-primary text-on-primary",
                // Inactive buttons: rectangular with soft corners, half pill on edges
                !isActive && [
                  "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                  isFirst && "rounded-l-[20px] rounded-r-[8px]",
                  isLast && "rounded-r-[20px] rounded-l-[8px]",
                  !isFirst && !isLast && "rounded-[8px]",
                ]
              )}
              aria-label={option.label}
            >
              <Calendar className="w-4 h-4" />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {options.map((option, index) => {
        const isActive = value === option.value
        const isFirst = index === 0
        const isLast = index === options.length - 1
        
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all",
              // Active button: full pill with primary color
              isActive && "rounded-[20px] bg-primary text-on-primary",
              // Inactive buttons: rectangular with soft corners, half pill on edges
              !isActive && [
                "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                isFirst && "rounded-l-[20px] rounded-r-[8px]",
                isLast && "rounded-r-[20px] rounded-l-[8px]",
                !isFirst && !isLast && "rounded-[8px]",
              ]
            )}
          >
            <Calendar className="w-4 h-4" />
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Elevated button: Light gray background with shadow/3D effect
        elevated:
          "bg-surface-container-low text-on-surface shadow-md hover:bg-surface-container hover:shadow-lg",
        // Filled button: Dark purple background with white text
        filled:
          "bg-primary-container text-on-primary-container hover:bg-primary-container/90 hover:shadow-md",
        // Tonal button: Light purple background with darker purple text
        tonal:
          "bg-primary-container/30 text-primary hover:bg-primary-container/40",
        // Outlined button: Light gray background with dark gray outline
        outlined:
          "border border-outline bg-surface-container-low text-on-surface hover:bg-surface-container focus:bg-surface-container",
        // Text button: Just text, no background or outline
        text:
          "bg-transparent text-primary hover:bg-primary/10",
        destructive:
          "bg-error text-on-error hover:bg-error/90 hover:shadow-md",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

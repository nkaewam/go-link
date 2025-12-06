import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-38 active:scale-[0.98]",
  {
    variants: {
      variant: {
        filled:
          "bg-primary text-on-primary hover:bg-primary/90 hover:shadow-md hover:elevation-1",
        tonal:
          "bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 hover:shadow-sm",
        outlined:
          "border border-outline bg-transparent text-primary hover:bg-primary/10 focus:bg-primary/10",
        text:
          "bg-transparent text-primary hover:bg-primary/10",
        elevated:
          "bg-surface-container-low text-primary shadow-sm hover:bg-primary/8 hover:shadow-md hover:elevation-1",
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

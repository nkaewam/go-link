import * as React from "react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";

type InputGroupAlign =
  | "inline-start"
  | "inline-end"
  | "block-start"
  | "block-end";

const alignClassNames: Record<InputGroupAlign, string> = {
  "inline-start": "order-[-1]",
  "inline-end": "ml-auto",
  "block-start": "self-start",
  "block-end": "self-end",
};

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "group/input flex min-w-0 w-full items-center gap-3 rounded-full border border-outline/30 bg-surface-container-highest px-4 py-2 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        className
      )}
      {...props}
    />
  );
});
InputGroup.displayName = "InputGroup";

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { align?: InputGroupAlign }
>(({ className, align = "inline-start", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        alignClassNames[align],
        className
      )}
      {...props}
    />
  );
});
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn("rounded-full", className)}
        {...props}
      />
    );
  }
);
InputGroupButton.displayName = "InputGroupButton";

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
InputGroupText.displayName = "InputGroupText";

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input-group-control"
      className={cn(
        "flex-1 min-w-0 bg-transparent text-base leading-none placeholder:text-muted-foreground outline-none border-none h-10 px-0 focus-visible:outline-none focus-visible:ring-0",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
};

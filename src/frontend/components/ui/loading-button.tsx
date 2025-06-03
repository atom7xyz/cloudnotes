import * as React from "react"
import { Button, buttonVariants } from "./button"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends 
  React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn("relative", className)}
        variant={variant}
        size={size}
        asChild={asChild}
        disabled={loading || disabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {loadingText && <span>{loadingText}</span>}
            </div>
          </div>
        )}
        <span className={cn(loading && "invisible")}>
          {children}
        </span>
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton } 
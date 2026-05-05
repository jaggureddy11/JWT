import React from "react"
import { cn } from "../../lib/utils"
import { motion } from "motion/react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-white text-black hover:bg-neutral-200 border border-transparent",
      secondary: "bg-transparent text-white border border-white/20 hover:bg-white/10",
      ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-transparent",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
    }

    return (
      <motion.button
        whileTap={{ scale: 0.98 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    )
  }
)
Button.displayName = "Button"

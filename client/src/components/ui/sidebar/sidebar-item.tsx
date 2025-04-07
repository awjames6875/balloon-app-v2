import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { useLocation } from "wouter"

import { cn } from "@/lib/utils"
import { useSidebar } from "./context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const sidebarItemVariants = cva(
  "group flex items-center gap-x-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors",
  {
    variants: {
      variant: {
        default: "text-foreground/80 hover:text-foreground",
        active: "bg-muted text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SidebarItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarItemVariants> {
  href?: string
  icon?: React.ReactNode
  asChild?: boolean
  showTooltip?: boolean
  tooltipContent?: React.ReactNode
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  (
    {
      className,
      variant,
      asChild = false,
      icon,
      children,
      href,
      showTooltip = true,
      tooltipContent,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const sidebar = useSidebar()
    const [, navigate] = useLocation()
    
    const handleClick = React.useCallback(() => {
      if (href) {
        navigate(href)
      }
    }, [href, navigate])
    
    const content = (
      <Comp
        ref={ref}
        className={cn(sidebarItemVariants({ variant, className }))}
        onClick={handleClick}
        {...props}
      >
        {icon && (
          <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
            {icon}
          </span>
        )}
        {(sidebar.state === "expanded" || !icon) && (
          <span className="truncate">{children}</span>
        )}
      </Comp>
    )
    
    // Only show tooltip in collapsed state and if tooltip is enabled
    if (sidebar.state === "collapsed" && icon && showTooltip) {
      return (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent side="right" align="center">
              {tooltipContent || children}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }
    
    return content
  }
)
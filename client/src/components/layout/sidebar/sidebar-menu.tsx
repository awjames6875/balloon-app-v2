import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { useSidebar } from "./sidebar-context"

// Sidebar Menu
export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

// Sidebar Menu Item
export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// Sidebar Menu Button Variants
export const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "",
        accent:
          "bg-sidebar-accent text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent-foreground data-[active=true]:text-sidebar-accent data-[state=open]:bg-sidebar-accent-foreground data-[state=open]:text-sidebar-accent",
        ghost: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Menu Button Props Interface
export interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean
  active?: boolean
  tooltipDisabled?: boolean
}

// Sidebar Menu Button
export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      className,
      variant,
      active,
      children,
      tooltipDisabled = false,
      ...props
    },
    ref
  ) => {
    const { state } = useSidebar()
    const needsTooltip = state === "collapsed" && !tooltipDisabled
    const renderedComponent = (
      <button
        ref={ref}
        data-sidebar="menu-button"
        data-active={active}
        className={cn(sidebarMenuButtonVariants({ variant }), className)}
        {...props}
      >
        {children}
      </button>
    )

    if (needsTooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{renderedComponent}</TooltipTrigger>
          <TooltipContent side="right" className="flex gap-2 p-2">
            {children}
          </TooltipContent>
        </Tooltip>
      )
    }

    return renderedComponent
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Sidebar Menu Action
export const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-sidebar="menu-action"
    className={cn(
      "absolute right-2 top-1.5 flex size-5 items-center justify-center rounded-md p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      // Increases the hit area of the button on mobile.
      "after:absolute after:-inset-2 after:md:hidden",
      "group-data-[collapsible=icon]:hidden",
      className
    )}
    {...props}
  />
))
SidebarMenuAction.displayName = "SidebarMenuAction"

// Sidebar Menu Skeleton
export const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Skeleton> & { hasAction?: boolean }
>(({ className, hasAction, ...props }, ref) => {
  return (
    <Skeleton
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn(
        "h-9 w-full rounded-md",
        hasAction && "py-2 pl-9 pr-[calc(theme(spacing.8)_+_theme(spacing.1))]",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"
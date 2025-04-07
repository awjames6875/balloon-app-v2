import * as React from "react"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { SidebarProvider, useSidebar, SIDEBAR_WIDTH_MOBILE } from "./context"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function SidebarContent({ className, children, ...props }: SidebarProps) {
  const sidebar = useSidebar()
  
  return (
    <div
      className={cn("h-screen flex flex-col gap-y-4 p-4", className)}
      style={{ width: sidebar.width }}
      {...props}
    >
      {children}
    </div>
  )
}

function SidebarImpl({ className, children, ...props }: SidebarProps) {
  const sidebar = useSidebar()
  const isMobile = useIsMobile()
  
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-10"
          onClick={() => sidebar.setOpen(true)}
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        
        <Sheet open={sidebar.open} onOpenChange={sidebar.setOpen}>
          <SheetContent side="left" className="p-0" style={{ width: SIDEBAR_WIDTH_MOBILE }}>
            <SidebarContent className={className} {...props}>
              {children}
            </SidebarContent>
          </SheetContent>
        </Sheet>
      </>
    )
  }
  
  return (
    <div
      className={cn(
        "relative border-r transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    >
      <SidebarContent>{children}</SidebarContent>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-[-12px] top-4 h-6 w-6 rounded-full border"
        onClick={sidebar.toggle}
      >
        <PanelLeft
          className={cn(
            "h-3 w-3 transition-all",
            sidebar.state === "collapsed" && "rotate-180"
          )}
        />
      </Button>
    </div>
  )
}

// Export wrapper component with provider
export function Sidebar(props: SidebarProps) {
  return (
    <SidebarProvider>
      <SidebarImpl {...props} />
    </SidebarProvider>
  )
}

// Export header component
export function SidebarHeader({ 
  className, 
  children, 
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  const sidebar = useSidebar()
  
  return (
    <div
      className={cn(
        "flex h-14 items-center px-2",
        sidebar.state === "collapsed" && "justify-center",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Export section component
export function SidebarSection({ 
  className, 
  children, 
  title,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { title?: string }) {
  const sidebar = useSidebar()
  
  return (
    <div className={cn("flex flex-col gap-y-1", className)} {...props}>
      {title && sidebar.state === "expanded" && (
        <>
          <h3 className="px-4 text-xs font-medium text-muted-foreground">
            {title}
          </h3>
          <Separator className="mb-1" />
        </>
      )}
      {children}
    </div>
  )
}

// Export nested components to maintain API compatibility
export { SidebarItem } from "./sidebar-item"
import * as React from "react"

// Constants
export const SIDEBAR_COOKIE_NAME = "sidebar:state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Types
export type SidebarState = "expanded" | "collapsed"

export interface SidebarContextValue {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  setState: (state: SidebarState) => void
  width: string
}

// Create context
const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

// Hook for accessing context
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

// Provider component
interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [state, setState] = React.useState<SidebarState>(() => {
    // Initialize from cookie if available
    if (typeof document !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
      
      if (cookie) {
        const value = cookie.split("=")[1]
        return value === "expanded" ? "expanded" : "collapsed"
      }
    }
    
    return "expanded" // Default state
  })
  
  const [open, setOpen] = React.useState(false)
  
  // Save state to cookie when it changes
  React.useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [state])
  
  // Toggle sidebar state
  const toggle = React.useCallback(() => {
    setState((prev) => (prev === "expanded" ? "collapsed" : "expanded"))
  }, [])
  
  // Calculate width based on state
  const width = React.useMemo(() => {
    return state === "expanded" ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON
  }, [state])
  
  // Keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) ||
        (event.key === SIDEBAR_KEYBOARD_SHORTCUT && event.altKey)
      ) {
        toggle()
      }
    }
    
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [toggle])
  
  const value = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      toggle,
      setState,
      width,
    }),
    [state, open, toggle, width]
  )
  
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}
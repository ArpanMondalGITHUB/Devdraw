import { useState, useRef, useEffect, createContext, useContext } from "react"
import { cn } from "../../lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  sideOffset?: number
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  className?: string
  children: React.ReactNode
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuSeparatorProps {
  className?: string
}

const DropdownMenuContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement> | null
}>({ open: false, setOpen: () => {}, triggerRef: null })

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext)
  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen(p => !p)}
      className={className}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  children,
  className,
  side = "bottom",
  align = "end",
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking the trigger button (it handles its own toggle)
      if (triggerRef?.current?.contains(e.target as Node)) {
        return
      }
      // Close if clicking outside the dropdown content
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  const sideClasses = {
    top: `bottom-full mb-2`,
    bottom: `top-full mt-2`,
    left: `right-full mr-2`,
    right: `left-full ml-2`,
  }

  const alignClasses = {
    start: side === "bottom" || side === "top" ? "left-0" : "top-0",
    center: side === "bottom" || side === "top" ? "left-1/2 -translate-x-1/2" : "top-1/2 -translate-y-1/2",
    end: side === "bottom" || side === "top" ? "right-0" : "bottom-0",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-32 overflow-hidden rounded-lg shadow-lg ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95 duration-100",
        sideClasses[side],
        alignClasses[align],
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

function DropdownMenuItem({
  children,
  className,
  variant = "default",
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    setOpen(false)
  }

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none transition-colors",
        variant === "default" &&
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        variant === "destructive" &&
          "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuLabel({ children, className }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  )
}

function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn("my-1 h-px bg-border", className)} />
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}

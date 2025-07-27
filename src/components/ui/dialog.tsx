import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./button"

interface DialogContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

function useDialog() {
  const context = React.useContext(DialogContext)
  if (!context) {
    throw new Error("useDialog must be used within a Dialog")
  }
  return context
}

interface DialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setOpen(false)}
          />
          <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto">
            {React.Children.map(children, child => {
              if (React.isValidElement(child) && child.type === DialogContent) {
                return child
              }
              return null
            })}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

function DialogTrigger({ children, asChild, ...props }: DialogTriggerProps) {
  const { setOpen } = useDialog()
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...children.props,
      onClick: (e: React.MouseEvent) => {
        if (children.props && typeof children.props.onClick === 'function') {
          children.props.onClick(e)
        }
        setOpen(true)
      }
    } as any)
  }

  return (
    <Button {...props} onClick={() => setOpen(true)}>
      {children}
    </Button>
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogContent({ className, children, ...props }: DialogContentProps) {
  const { setOpen } = useDialog()

  return (
    <div
      className={cn(
        "relative bg-background p-6 shadow-lg duration-200 rounded-lg border",
        className
      )}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 h-6 w-6"
        onClick={() => setOpen(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      {children}
    </div>
  )
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  )
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
}
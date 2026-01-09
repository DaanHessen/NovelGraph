import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ComponentType<{ size: number }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
         {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Icon size={16} />
            </div>
         )}
        <select
            className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            Icon ? "pl-10" : "",
            className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }

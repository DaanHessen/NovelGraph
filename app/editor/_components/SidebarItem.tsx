'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  subLabel?: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  isDanger?: boolean;
  customRightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SidebarItem({
  icon: Icon,
  label,
  subLabel,
  href,
  onClick,
  isActive,
  isDanger,
  customRightElement,
  children
}: SidebarItemProps) {
  const content = (
    <>
      <Icon 
        size={16} 
        className={cn(
          "transition-colors duration-200 shrink-0",
          isActive ? "text-primary" : isDanger ? "text-destructive" : "text-muted-foreground group-hover:text-foreground"
        )} 
      />
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        {children ? children : (
            <div className="flex-1 min-w-0">
                 <div className={cn("text-xs font-medium truncate", isDanger && "text-destructive")}>{label}</div>
                 {subLabel && <div className="text-[10px] text-muted-foreground truncate">{subLabel}</div>}
            </div>
        )}
        {customRightElement && !children && (
            <div className="shrink-0">
                {customRightElement}
            </div>
        )}
      </div>
    </>
  );

  const className = cn(
    "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer group mb-1 border select-none",
    isActive 
      ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
      : "text-muted-foreground hover:bg-accent/5 hover:text-foreground border-transparent",
    isDanger && "hover:bg-destructive/10 hover:border-destructive/20"
  );

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {content}
    </div>
  );
}

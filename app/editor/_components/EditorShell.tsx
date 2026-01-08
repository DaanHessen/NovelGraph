'use client';

import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import IconRail from './IconRail';
import ContextSidebar from './ContextSidebar';

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isContextRoute = pathname.includes('/settings') || pathname.includes('/write') || pathname.includes('/graph');
  const [rightOpen, setRightOpen] = useState(true);
  
  // If route doesn't support context, it's effectively closed
  const isActuallyOpen = isContextRoute && rightOpen;
  
  // Base margin is 20 (IconRail, 5rem). Extra sidebar is 64 (16rem).
  const contentMargin = isActuallyOpen ? 'md:ml-[21rem]' : 'md:ml-20';

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="fixed top-0 left-0 w-20 h-full bg-black z-50"></div>}>
         <IconRail />
      </Suspense>
      
      <ContextSidebar open={isActuallyOpen} setOpen={setRightOpen} />
      
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen bg-background text-foreground ${contentMargin}`}
      >
        <div className={pathname.includes('/graph') ? "" : "p-8"}>
            {children}
        </div>
      </main>
    </div>
  );
}

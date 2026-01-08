'use client';

import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import IconRail from './IconRail';
import ContextSidebar from './ContextSidebar';

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isContextVisible = pathname.includes('/settings') || pathname.includes('/write');
  
  // Base margin is 20 (IconRail, 5rem). Extra sidebar is 64 (16rem).
  // Tailwind margins: ml-20 = 5rem. 
  // We need dynamic margin: if context visible -> ml-[21rem] (5+16), else ml-20.
  
  const contentMargin = isContextVisible ? 'md:ml-[21rem]' : 'md:ml-20';

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="fixed top-0 left-0 w-20 h-full bg-black z-50"></div>}>
         <IconRail />
      </Suspense>
      
      <ContextSidebar />
      
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen bg-background text-foreground ${contentMargin}`}
      >
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}

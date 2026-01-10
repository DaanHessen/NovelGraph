'use client';

import { useState, Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import IconRail from './IconRail';
import ContextSidebar from './ContextSidebar';
import { useManuscriptStore } from '../write/_store/useManuscriptStore';

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isContextRoute = pathname.includes('/settings') || pathname.includes('/write') || pathname.includes('/graph') || pathname.includes('/export');
  const [rightOpen, setRightOpen] = useState(true);
  const { addTimeSpent } = useManuscriptStore();
  
  const isActuallyOpen = isContextRoute && rightOpen;
  
  // w-72 is 18rem, w-20 is 5rem. Total 23rem.
  const contentMargin = isActuallyOpen ? 'md:ml-[23rem]' : 'md:ml-20';

  useEffect(() => {
    const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            addTimeSpent(60);
        }
    }, 60000);
    return () => clearInterval(interval);
  }, [addTimeSpent]);

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="fixed top-0 left-0 w-20 h-full bg-black z-50"></div>}>
         <IconRail />
      </Suspense>
      
      <ContextSidebar open={isActuallyOpen} setOpen={setRightOpen} />
      
      <main 
        className={`flex-1 transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] min-h-screen bg-background text-foreground ${contentMargin}`}
      >
            {children}
      </main>
    </div>
  );
}

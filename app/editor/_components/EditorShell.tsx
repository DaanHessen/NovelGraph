'use client';

import { useState, Suspense } from 'react';
import Sidebar from './Sidebar';

export default function EditorShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-16 md:w-64 bg-card border-r border-border h-full fixed left-0 top-0 z-40" />}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </Suspense>
      
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen bg-background text-foreground ${collapsed ? 'md:ml-20' : 'md:ml-72'}`}
      >
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Globe, Network, PenTool, Settings, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useState, useEffect } from 'react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

export default function IconRail() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const [username, setUsername] = useState<string | null>(null);

  const q = projectSlug ? `?project=${projectSlug}` : '';

  useEffect(() => {
     // Fetch profile for avatar
    const loadProfile = async () => {
        try {
            const res = await fetch('/api/settings/profile');
            if (res.ok) {
                const data = await res.json();
                if (data.username) setUsername(data.username);
            }
        } catch (e) { console.error(e); }
    };
    loadProfile();
     const handleUpdate = () => loadProfile();
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);


  const navItems = [
    { label: 'Overview', icon: Home, href: '/editor' },
    { label: 'Write', icon: PenTool, href: '/editor/write' },
    { label: 'World', icon: Globe, href: '/editor/world' },
    { label: 'Graph', icon: Network, href: '/editor/graph' },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-20 bg-[#0a0a0a]/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col items-center py-6 shadow-2xl">
       {/* Logo Icon */}
       <div className="mb-8 p-2 rounded-xl bg-gradient-to-br from-accent to-purple-600 text-white shadow-[0_0_15px_var(--accent)]">
          <Globe size={24} />
       </div>

       {/* Primary Nav */}
       <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={`${item.href}${q}`}
                className={cn(
                  "relative group flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-300",
                  isActive ? "text-white bg-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)] border border-white/10" : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title={item.label}
              >
                 {isActive && (
                    <motion.div 
                        layoutId="rail-active"
                        className="absolute inset-0 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                    />
                 )}
                 <item.icon size={22} className={cn("relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "text-accent")} />
                 
                 {/* Tooltip */}
                 <div className="absolute left-full ml-4 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 translate-x-[-10px] group-hover:translate-x-0 duration-200">
                    {item.label}
                 </div>
              </Link>
            );
          })}
       </nav>

       {/* Bottom Actions */}
       <div className="flex flex-col gap-4 w-full px-2 mt-auto">
          {/* Settings - Special Placement */}
           <Link
                href={`/editor/settings${q}`}
                className={cn(
                  "relative group flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-300",
                  pathname.includes('/settings') ? "text-white bg-white/10 border border-white/10" : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title="Settings"
            >
                 <Settings size={22} />
            </Link>

           {/* Exit */}
           <Link
                href="/"
                className="group flex items-center justify-center w-full aspect-square rounded-2xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Exit"
            >
                 <LogOut size={22} />
            </Link>

             {/* Profile */}
            <div className="relative group w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 p-[1px] shadow-lg mt-2 mx-auto cursor-default">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {username ? username[0].toUpperCase() : <User size={14} />}
                 </div>
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
       </div>
    </div>
  );
}

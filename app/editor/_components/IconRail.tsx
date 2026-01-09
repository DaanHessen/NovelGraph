import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Globe, Network, PenTool, Settings, LogOut, User, Download } from 'lucide-react';
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



  useEffect(() => {
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


  const [storedSlug, setStoredSlug] = useState<string | null>(null);

  useEffect(() => {
      const saved = localStorage.getItem('last_project_slug');
      if (saved) {
          setTimeout(() => setStoredSlug(saved), 0);
      }
  }, []);

  useEffect(() => {
      if (projectSlug) {
          localStorage.setItem('last_project_slug', projectSlug);
      }
  }, [projectSlug]);

  const activeProjectSlug = projectSlug || storedSlug;

  const navItems = [
    { label: 'Overview', icon: Home, href: '/editor' },
    { label: 'Write', icon: PenTool, href: '/editor/write' },
    { label: 'World', icon: Globe, href: '/editor/world' },
    { label: 'Graph', icon: Network, href: '/editor/graph' },
    { label: 'Export', icon: Download, href: '/editor/export' },
  ];
  
  const getHref = (baseHref: string) => {
      if (activeProjectSlug && (baseHref.includes('/graph') || baseHref.includes('/write') || baseHref.includes('/world'))) {
          return `${baseHref}?project=${activeProjectSlug}`;
      }
      return baseHref;
  };

  return (
    <div className="fixed top-0 left-0 h-full w-20 bg-background/90 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col items-center py-6 shadow-2xl">

       <div className="mb-8 flex justify-center">
          <pre className="font-mono text-[5px] leading-[5px] text-accent/90 font-black tracking-tighter select-none pointer-events-none drop-shadow-[0_0_10px_rgba(167,139,250,0.5)]">
{`███    ██  ██████  
████   ██ ██       
██ ██  ██ ██   ███ 
██  ██ ██ ██    ██ 
██   ████  ██████`}
          </pre>
       </div>

       <nav className="flex-1 flex flex-col gap-4 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={getHref(item.href)}
                className={cn(
                  "relative group flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-300",
                  isActive ? "text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                )}
                title={item.label}
              >
                 {isActive && (
                    <motion.div 
                        layoutId="rail-active"
                        className="absolute inset-0 bg-linear-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                 )}
                 <item.icon size={22} className={cn("relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "text-accent drop-shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]")} />
                 
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-linear-to-br from-gray-800 to-black text-xs font-medium text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl z-50 p-px">
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-white/10 rotate-45 transform"></div>
                        {item.label}
                    </div>
              </Link>
            );
          })}
       </nav>

       <div className="flex flex-col gap-4 w-full px-2 mt-auto">
           



           <Link
                href={getHref('/editor/settings')}
                className={cn(
                  "relative group flex items-center justify-center w-full aspect-square rounded-2xl transition-all duration-300",
                  pathname.includes('/settings') 
                ? "bg-white/5 border border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)] scale-110" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                )}
                title="Settings"
            >
                 <Settings size={22} />
            </Link>

           <Link
                href="/"
                className={clsx("w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-300",
                  "text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                )}
                title="Exit"
            >
                 <LogOut size={22} />
            </Link>

            <div className="relative group w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 p-px shadow-lg mt-2 mx-auto cursor-default">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {username ? username[0].toUpperCase() : <User size={14} />}
                 </div>
                 <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full" />
            </div>
       </div>
    </div>
  );
}

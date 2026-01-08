'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Globe, Network, Menu, ChevronLeft, Settings, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Preserve ?project=slug query param in navigation
  const q = projectSlug ? `?project=${projectSlug}` : '';

  useEffect(() => {
    // Fetch profile
    const loadProfile = async () => {
        try {
            const res = await fetch('/api/settings/profile');
            if (res.ok) {
                const data = await res.json();
                if (data.username) setUsername(data.username);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        }
    };
    loadProfile();
    
    // Listen for updates
    const handleUpdate = () => loadProfile();
    window.addEventListener('profile-updated', handleUpdate);
    return () => window.removeEventListener('profile-updated', handleUpdate);
  }, []);

  const navItems = [
    { label: 'Overview', icon: Home, href: '/editor' },
    { label: 'World', icon: Globe, href: '/editor/world' },
    { label: 'Graph', icon: Network, href: '/editor/graph' },
  ];

  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Sidebar Container */}
      <motion.div
        className={cn(
          "fixed top-0 left-0 h-full bg-[#0f1113]/90 backdrop-blur-xl border-r border-white/5 z-40 transition-all duration-300 flex flex-col shadow-2xl",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {!collapsed && (
            <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight"
            >
                NovelGrid
            </motion.span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
             {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={`${item.href}${q}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group relative overflow-hidden",
                  isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
                title={collapsed ? item.label : undefined}
              >
                 {isActive && (
                    <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                 )}
                 {isActive && (
                    <motion.div 
                         layoutId="active-indicator"
                         className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_var(--accent)]" 
                    />
                 )}
                <item.icon size={20} className={cn("relative z-10", isActive ? "text-accent" : "text-gray-500 group-hover:text-gray-300")} />
                {!collapsed && <span className="relative z-10 font-medium text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/5 space-y-2 bg-black/20">
            {/* Exit Project */}
            <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all",
                  collapsed ? "justify-center" : ""
                )}
                title="Back to Projects"
            >
                <LogOut size={18} className="text-gray-500 hover:text-red-400" />
                {!collapsed && <span className="text-sm font-medium">Exit Project</span>}
            </Link>

            {/* Settings Link */}
            <Link
                href={`/editor/settings${q}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all",
                   pathname === '/editor/settings' ? "bg-white/5 text-white" : "",
                  collapsed ? "justify-center" : ""
                )}
                title="Settings"
            >
                 <Settings size={18} />
                 {!collapsed && <span className="text-sm font-medium">Settings</span>}
            </Link>

           {/* User Profile */}
          <div
            className={cn(
              "flex items-center gap-3 w-full p-2 mt-2 rounded-xl border border-white/5 bg-white/5",
              collapsed ? "justify-center p-1 bg-transparent border-0" : ""
            )}
          >
            <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-1 ring-white/10">
                {username ? username[0]?.toUpperCase() : <User size={14} />}
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0f1113] rounded-full" />
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">
                    {username || 'Loading...'}
                </div>
                <div className="text-[10px] text-accent uppercase tracking-wider font-bold">
                  Author
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
       
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

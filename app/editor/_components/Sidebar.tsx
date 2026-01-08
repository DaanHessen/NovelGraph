'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Globe, Network, Menu, ChevronLeft, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import SettingsModal from './SettingsModal';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
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
  const [showSettings, setShowSettings] = useState(false);

  const q = projectSlug ? `?project=${projectSlug}` : '';

  useEffect(() => {
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
  }, []);

  const navItems = [
    { label: 'Overview', icon: Home, href: '/editor' },
    { label: 'World', icon: Globe, href: '/editor/world' },
    { label: 'Graph', icon: Network, href: '/editor/graph' },
  ];

  const sidebarWidth = collapsed ? 'w-20' : 'w-72';

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white shadow-lg"
        >
          <Menu size={20} />
        </button>
      </div>

      <motion.div
        className={cn(
          "fixed top-0 left-0 h-full bg-[#0f1113]/90 backdrop-blur-xl border-r border-white/5 z-40 transition-all duration-300 flex flex-col shadow-2xl",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          {!collapsed && (
            <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="font-bold text-xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight"
            >
                StoryPlanner
            </motion.span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
             {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-8 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={`${item.href}${q}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/5"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                 {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full shadow-[0_0_10px_var(--accent)]" />
                 )}
                <item.icon size={20} className={cn(isActive ? "text-accent" : "text-gray-500 group-hover:text-gray-300")} />
                {!collapsed && <span className="font-medium text-sm tracking-wide">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={() => setShowSettings(true)}
            className={cn(
              "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-all duration-200 group text-left border border-transparent hover:border-white/5",
              collapsed ? "justify-center" : ""
            )}
          >
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-black/50 group-hover:ring-white/20 transition-all">
                {username ? username[0]?.toUpperCase() : '?'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0f1113] rounded-full" />
            </div>
            
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                    {username || <span className="animate-pulse bg-white/10 rounded w-16 h-4 inline-block"/>}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-accent transition-colors mt-0.5">
                  <Settings size={10} />
                  <span>Profile Settings</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </motion.div>
       
      {mobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setMobileOpen(false)}
        />
      )}

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            currentName={username ?? ''}
            onClose={() => setShowSettings(false)}
            onUpdate={(newName) => setUsername(newName)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

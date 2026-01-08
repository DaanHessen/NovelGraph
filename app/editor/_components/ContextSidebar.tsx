'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, FileText, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

export default function ContextSidebar() {
  const pathname = usePathname();
  const isSettings = pathname.includes('/settings');
  const isWrite = pathname.includes('/write');
  
  // Decide which content to show
  let content = null;
  let title = '';

  if (isSettings) {
      title = 'Settings';
      content = (
        <div className="space-y-1">
            <Link 
                href="/editor/settings"
                className="flex items-center gap-3 px-3 py-2 bg-white/5 text-white rounded-lg border border-white/5 cursor-pointer shadow-sm"
            >
                <Settings size={16} className="text-accent" />
                <span className="text-sm font-medium">Profile</span>
                <ChevronRight size={14} className="ml-auto text-gray-500" />
            </Link>
        </div>
      );
  } else if (isWrite) {
      title = 'Manuscript';
      content = (
         <div className="space-y-1">
            {[1, 2, 3].map((i) => (
                <div key={i} className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
                    i === 1 
                        ? "bg-white/5 text-white border border-white/5 shadow-sm" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                )}>
                    <FileText size={16} className={i === 1 ? "text-accent" : "text-gray-600 group-hover:text-gray-400"} />
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">Chapter {i}</div>
                        <div className="text-[10px] text-gray-600 truncate">The Beginning...</div>
                    </div>
                </div>
            ))}
            <button className="w-full mt-4 py-2 border border-dashed border-white/10 rounded-lg text-xs text-gray-500 hover:text-accent hover:border-accent/20 hover:bg-accent/5 transition-all">
                + New Chapter
            </button>
         </div>
      );
  }

  return (
    <AnimatePresence mode="wait">
        {(isSettings || isWrite) && (
            <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                exit={{ x: -10, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                className="fixed top-0 left-20 h-full w-64 bg-[#0f1113]/95 backdrop-blur-xl border-r border-white/5 z-40 py-8 px-4 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.2)]"
            >
                <motion.h2 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                    className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2"
                >
                    {title}
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.05 } }}
                >
                    {content}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}

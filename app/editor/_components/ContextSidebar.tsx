'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, FileText, ChevronRight, Hash } from 'lucide-react';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

export default function ContextSidebar() {
  const pathname = usePathname();

  // Determine context
  const isSettings = pathname.includes('/settings');
  const isWrite = pathname.includes('/write');
  
  if (!isSettings && !isWrite) {
    return null; // No secondary sidebar for Overview/World/Graph yet, or keep it slim
  }

  return (
    <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        className="fixed top-0 left-20 h-full w-64 bg-[#0f1113]/80 backdrop-blur-md border-r border-white/5 z-40 py-8 px-4 flex flex-col"
    >
        {isSettings && (
            <>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Settings</h2>
                <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 bg-white/5 text-white rounded-lg border border-white/5 cursor-pointer">
                        <Settings size={16} className="text-accent" />
                        <span className="text-sm font-medium">Profile</span>
                        <ChevronRight size={14} className="ml-auto text-gray-600" />
                    </div>
                     <div className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-not-allowed opacity-50">
                        <Hash size={16} />
                        <span className="text-sm font-medium">Account</span>
                    </div>
                </div>
            </>
        )}

        {isWrite && (
            <>
                 <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">Manuscript</h2>
                 <div className="space-y-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer group",
                            i === 1 ? "bg-white/5 text-white border border-white/5" : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}>
                            <FileText size={16} className={i === 1 ? "text-accent" : "text-gray-600 group-hover:text-gray-400"} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">Chapter {i}</div>
                                <div className="text-[10px] text-gray-600 truncate">The Beginning...</div>
                            </div>
                        </div>
                    ))}
                    <button className="w-full mt-4 py-2 border border-dashed border-white/10 rounded-lg text-xs text-gray-500 hover:text-accent hover:border-accent/20 transition-all">
                        + New Chapter
                    </button>
                 </div>
            </>
        )}
    </motion.div>
  );
}

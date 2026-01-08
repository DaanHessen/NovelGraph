'use client';

import { Suspense } from 'react';
import { BookOpen, Users, FileText, Target, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

function StatsCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: React.ComponentType<{ size: number }>, trend?: string }) {
  return (
    <motion.div 
        whileHover={{ y: -5 }}
        className="relative overflow-hidden bg-card/30 backdrop-blur-md border border-white/5 p-6 rounded-3xl group"
    >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent/10 rounded-xl text-accent">
                    <Icon size={20} />
                </div>
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            </div>
            <div className="flex items-end gap-3">
                <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
                 {trend && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 mb-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <ArrowUpRight size={12} />
                        {trend}
                    </span>
                 )}
            </div>
        </div>
    </motion.div>
  );
}

function EditorContent() {


  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-12">
        <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Overview</h1>
            <p className="text-gray-400 text-lg">Manage your project statistics and goals.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         <StatsCard title="Total Words" value="12,405" icon={FileText} trend="+2.4k this week" />
         <StatsCard title="Chapters" value="8" icon={BookOpen} />
         <StatsCard title="Characters" value="24" icon={Users} trend="+3 new" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card/20 border border-white/5 rounded-3xl p-8 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-accent/5 to-transparent pointer-events-none" />
               <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Target size={20} className="text-accent" />
                       Writing Goals
                  </h3>
                   <div className="space-y-6">
                       <div>
                           <div className="flex justify-between text-sm mb-2">
                               <span className="text-gray-400">Daily Target (1000 words)</span>
                               <span className="text-white font-medium">75%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-accent w-3/4 rounded-full shadow-[0_0_10px_var(--accent)]" />
                           </div>
                       </div>
                        <div>
                           <div className="flex justify-between text-sm mb-2">
                               <span className="text-gray-400">Chapter 9 Completion</span>
                               <span className="text-white font-medium">30%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-500 w-[30%] rounded-full shadow-[0_0_10px_#3b82f6]" />
                           </div>
                       </div>
                   </div>
               </div>
          </div>

           <div className="bg-card/20 border border-white/5 rounded-3xl p-8 min-h-[300px]">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                   <Clock size={20} className="text-orange-400" />
                   Recent Activity
                </h3>
               <div className="space-y-4">
                   {[1, 2, 3].map((i) => (
                       <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                           <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-accent/20 transition-all">
                               <FileText size={18} />
                           </div>
                           <div>
                               <p className="text-white font-medium">Edited Chapter {9-i}</p>
                               <p className="text-xs text-gray-500">2 hours ago</p>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-accent animate-pulse">Loading dashboard...</div>}>
      <EditorContent />
    </Suspense>
  );
}

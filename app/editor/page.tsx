'use client';

import { Suspense } from 'react';
import { BookOpen, Users, FileText, Target, ArrowUpRight } from 'lucide-react';
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

import { useManuscriptStore } from './write/_store/useManuscriptStore';
import { useGraphStore } from './graph/_store/useGraphStore';
import { useMemo } from 'react';

function EditorContent() {
  const { nodes } = useManuscriptStore();
  const { pages } = useGraphStore();

  const stats = useMemo(() => {
      const chapters = nodes.filter(n => n.type === 'chapter');
      const totalWords = chapters.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
      
      const allNodes = pages.flatMap(p => p.nodes);
      const characters = allNodes.filter(n => n.data.type === 'character').length;
      const locations = allNodes.filter(n => n.data.type === 'location').length;

      return {
          words: totalWords,
          chapters: chapters.length,
          characters,
          locations
      };
  }, [nodes, pages]);

  return (
    <div className="max-w-6xl mx-auto py-10">
      <div className="flex items-center justify-between mb-12">
        <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Overview</h1>
            <p className="text-gray-400 text-lg">Your manuscript at a glance.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <StatsCard title="Total Words" value={stats.words.toLocaleString()} icon={FileText} />
         <StatsCard title="Chapters" value={stats.chapters.toString()} icon={BookOpen} />
         <StatsCard title="Characters" value={stats.characters.toString()} icon={Users} />
         <StatsCard title="Locations" value={stats.locations.toString()} icon={Target} />
      </div>

       {/* Placeholder for future detailed metrics if needed, currently clean as requested */}
       <div className="bg-white/5 border border-white/5 rounded-3xl p-12 text-center text-gray-500">
           <p>Start writing in the &quot;Write&quot; tab or plan in the &quot;Graph&quot; tab to see your progress grow!</p>
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

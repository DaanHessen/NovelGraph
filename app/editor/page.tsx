'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Users, FileText, Target, ArrowUpRight, Clock, BarChart } from 'lucide-react';
import { useManuscriptStore } from './write/_store/useManuscriptStore';
import { useGraphStore } from './graph/_store/useGraphStore';
import { Card, CardContent } from '@/app/_components/ui/Card';
import { Badge } from '@/app/_components/ui/Badge';
import { Button } from '@/app/_components/ui/Button';

function StatsCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: React.ComponentType<{ size: number }>, trend?: string }) {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/10">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <Icon size={64} />
        </div>
        <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Icon size={20} />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</h3>
            </div>
            <div className="flex items-end gap-3">
                <p className="text-4xl font-bold text-foreground tracking-tight">{value}</p>
                 {trend && (
                    <Badge variant="emerald" className="mb-1.5">
                        <ArrowUpRight size={12} className="mr-1" />
                        {trend}
                    </Badge>
                 )}
            </div>
        </CardContent>
    </Card>
  );
}

function EditorContent() {
  const { nodes, totalTimeSpent, activeNodeId } = useManuscriptStore();
  const { pages } = useGraphStore();

  const stats = useMemo(() => {
      const chapters = nodes.filter(n => n.type === 'chapter');
      const totalWords = chapters.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
      
      const allNodes = pages.flatMap(p => p.nodes);
      const characters = allNodes.filter(n => n.data.type === 'character').length;
      const locations = allNodes.filter(n => n.data.type === 'location').length;
      
      const hours = Math.max(0.01, totalTimeSpent / 3600);
      const avgWordsPerHour = totalWords > 0 ? Math.round(totalWords / hours) : 0;

      return {
          words: totalWords,
          chapters: chapters.length,
          characters,
          locations,
          time: totalTimeSpent || 0,
          avgWords: avgWordsPerHour,
      };
  }, [nodes, pages, totalTimeSpent]);
  
  const activeNode = useMemo(() => nodes.find(n => n.id === activeNodeId), [nodes, activeNodeId]);

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-12">
        <div>
            <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-lg">Your manuscript at a glance.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <StatsCard title="Total Words" value={stats.words.toLocaleString()} icon={FileText} />
         <StatsCard title="Est. Words / Hour" value={stats.avgWords.toString()} icon={BarChart} />
         <StatsCard title="Time Spent" value={formatTime(stats.time)} icon={Clock} />
         <StatsCard title="Chapters" value={stats.chapters.toString()} icon={BookOpen} />
         <StatsCard title="Characters" value={stats.characters.toString()} icon={Users} />
         <StatsCard title="Locations" value={stats.locations.toString()} icon={Target} />
      </div>

       <div className="bg-linear-to-b from-card/50 to-card/30 border border-border rounded-3xl p-12 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-primary/5 opacity-50" />
           <div className="relative z-10">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                    {activeNode ? `Pick up where you left off` : 'Ready to start?'}
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
                    {activeNode 
                        ? <span>You were working on <span className="text-foreground font-medium">&quot;{activeNode.title}&quot;</span>. continue writing?</span>
                        : "Start writing your first chapter or organize your thoughts in the graph view."
                    }
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/editor/write">
                        <Button size="lg" className="min-w-40 font-semibold text-md shadow-lg shadow-primary/20 h-12">
                            {activeNode ? 'Resume Editing' : 'Start Writing'}
                        </Button>
                    </Link>
                    <Link href="/editor/graph">
                        <Button variant="outline" size="lg" className="min-w-40 font-semibold text-md h-12 bg-background/50 backdrop-blur-sm">
                            Open Graph
                        </Button>
                    </Link>
                </div>
           </div>
       </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center text-primary animate-pulse">Loading dashboard...</div>}>
      <EditorContent />
    </Suspense>
  );
}

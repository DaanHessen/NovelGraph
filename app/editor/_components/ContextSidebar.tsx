'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, FileText, ChevronRight, ChevronsRight, PanelRightClose, PanelRightOpen, Map as MapIcon, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useGraphStore } from '../graph/_store/useGraphStore';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

interface ContextSidebarProps {
    open: boolean;
    setOpen: (v: boolean) => void;
}

function GraphPageList() {
    const { pages, activePageId, setActivePage, addPage, deletePage, updatePageName } = useGraphStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startEditing = (e: React.MouseEvent, page: { id: string, name: string }) => {
        e.stopPropagation();
        setEditingId(page.id);
        setEditName(page.name);
    };

    const saveName = () => {
        if (editingId && editName.trim()) {
            updatePageName(editingId, editName.trim());
        }
        setEditingId(null);
    };

    return (
        <div className="space-y-1">
            {pages.map((page) => (
                <div 
                    key={page.id} 
                    onClick={() => setActivePage(page.id)}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group relative",
                        page.id === activePageId
                            ? "bg-white/5 text-white border border-white/5 shadow-sm" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                    )}
                >
                    <MapIcon size={16} className={page.id === activePageId ? "text-emerald-500" : "text-gray-600 group-hover:text-gray-400"} />
                    <div className="flex-1 min-w-0">
                        {editingId === page.id ? (
                            <input
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={saveName}
                                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full bg-black/50 text-xs border border-accent/50 rounded px-1 py-0.5 outline-none text-white"
                            />
                        ) : (
                            <>
                                <div className="text-sm font-medium truncate" onDoubleClick={(e) => startEditing(e, page)}>{page.name}</div>
                                <div className="text-[10px] text-gray-600 truncate">{page.nodes.length} nodes</div>
                            </>
                        )}
                    </div>
                    {pages.length > 1 && !editingId && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={12} />
                        </button>
                    )}
                </div>
            ))}
            <button 
                onClick={() => addPage('New Page')}
                className="w-full mt-4 py-2 border border-dashed border-white/10 rounded-lg text-xs text-gray-500 hover:text-emerald-500 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={12} /> New Page
            </button>
        </div>
    );
}

function GraphSidebarContent() {
    const { selectedNodeId } = useGraphStore();
    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                 <GraphPageList />
            </div>
            
            {selectedNodeId && (
                <>
                    <div className="h-px bg-white/10 mb-6" />
                    <NodeEditor />
                </>
            )}
        </div>
    );
}

function NodeEditor() {
    const { pages, activePageId, selectedNodeId, updateNodeData, setSelectedNode } = useGraphStore();
    
    // Derived state
    const activePage = pages.find(p => p.id === activePageId);
    const node = activePage?.nodes.find(n => n.id === selectedNodeId);

    if (!node) return null;

    return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
             <div className="flex items-center gap-2 mb-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Node Properties</div>
                <button onClick={() => setSelectedNode(null)} className="ml-auto text-gray-500 hover:text-white transition-colors">
                    <PanelRightClose size={14} />
                </button>
             </div>

             <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Label</label>
                    <input 
                        type="text" 
                        value={node.data.label as string} 
                        onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['chapter', 'character', 'location'].map(t => (
                            <button
                                key={t}
                                onClick={() => updateNodeData(node.id, { type: t })}
                                className={cn(
                                    "px-1 py-1.5 rounded-md text-[9px] uppercase font-bold border transition-all truncate",
                                    node.data.type === t 
                                        ? "bg-white/10 border-accent text-white" 
                                        : "bg-transparent border-white/10 text-gray-500 hover:border-white/20"
                                )}
                                title={t}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Description</label>
                    <textarea 
                        value={node.data.description as string || ''} 
                        onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors min-h-[100px] resize-none"
                    />
                </div>
             </div>
        </div>
    );
}

export default function ContextSidebar({ open, setOpen }: ContextSidebarProps) {
  const pathname = usePathname();
  const isSettings = pathname.includes('/settings');
  const isWrite = pathname.includes('/write');
  const isGraph = pathname.includes('/graph');
  
  // Auto-open on route change if relevant, but allow user to toggle
  useEffect(() => {
    if (isSettings || isWrite || isGraph) {
        setOpen(true);
    } else {
        setOpen(false);
    }
  }, [isSettings, isWrite, isGraph, setOpen]);

  // Decide which content to show
  let content = null;
  let title = '';

  // Graph has custom sidebar or just nothing? 
  // User asked for "right side be able to be hidden".
  // If we are on graph, maybe we show graph tools? 
  // For now, let's stick to Settings/Write. 
  // If User wants graph tools in sidebar, we can add them.
  // But standard graph tools are floating. 
  // Let's assume this sidebar is primarily for navigation/context.

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
      // ... existing write logic ...
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
  } else if (isGraph) {
      title = 'Graphs';
      content = <GraphSidebarContent />;
  } else {
      // If nothing active, don't show sidebar at all (EditorShell handles this logic too, but good to be safe)
      return null; 
  }

  return (
    <>
        {/* Toggle Button (Visible when closed but context exists) */}
        <AnimatePresence>
            {!open && (isSettings || isWrite || isGraph) && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setOpen(true)}
                    className="fixed top-4 left-24 z-50 p-2 bg-[#0f1113]/50 backdrop-blur-md border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <PanelRightOpen size={18} />
                </motion.button>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {open && (
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ x: -10, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                    className="fixed top-0 left-20 h-full w-64 bg-[#0f1113]/95 backdrop-blur-xl border-r border-white/5 z-40 py-8 px-4 flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.2)]"
                >
                    <div className="flex items-center justify-between mb-6 px-2">
                        <motion.h2 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                            className="text-xs font-bold text-gray-500 uppercase tracking-widest"
                        >
                            {title}
                        </motion.h2>
                        <button 
                            onClick={() => setOpen(false)}
                            className="text-gray-600 hover:text-white transition-colors"
                        >
                            <PanelRightClose size={14} />
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.05 } }}
                    >
                        {content}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
}

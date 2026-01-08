import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, PanelRightClose, PanelRightOpen, Map as MapIcon, Plus, Trash2, User, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGraphStore, type GraphPage } from '../graph/_store/useGraphStore';
import SidebarItem from './SidebarItem';

// ... existing components (GraphPageList, GraphSidebarContent, NodeEditor) ...

import NodeDetailsPanel from '../graph/_components/NodeDetailsPanel';

function GraphSidebarContent() {
    const { pages, activePageId, setActivePage, addPage, deletePage, updatePageName, selectedNodeId } = useGraphStore();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    if (selectedNodeId) {
        return <NodeDetailsPanel key={selectedNodeId} />;
    }

    const handleCreatePage = () => {
        addPage('New Graph');
    };

    const startEditing = (page: GraphPage) => {
        setEditingId(page.id);
        setEditName(page.name);
    };

    const saveEditing = () => {
        if (editingId && editName.trim()) {
            updatePageName(editingId, editName);
        }
        setEditingId(null);
    };

    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="space-y-1">
                <div className="flex items-center justify-between px-2 pb-2">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Your Graphs</span>
                    <button 
                        onClick={handleCreatePage}
                        className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                        title="New Graph"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                
                <div className="space-y-1">
                    {pages.map(page => (
                        <div key={page.id} onDoubleClick={() => startEditing(page)} className="relative group">
                            <SidebarItem
                                icon={MapIcon}
                                label={page.name}
                                isActive={activePageId === page.id}
                                onClick={() => setActivePage(page.id)}
                            >
                                {editingId === page.id ? (
                                    <input 
                                        autoFocus
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={saveEditing}
                                        onKeyDown={(e) => e.key === 'Enter' && saveEditing()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-transparent border-none outline-none text-xs w-full p-0 font-medium text-white"
                                    />
                                ) : (
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-xs font-medium truncate select-none">{page.name}</span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[9px] text-gray-600 tabular-nums">{page.nodes.length}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if(confirm('Delete graph?')) deletePage(page.id);
                                                }}
                                                className="hover:text-red-400 text-gray-600 transition-colors"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </SidebarItem>
                        </div>
                    ))}
                </div>

                {pages.length === 0 && (
                    <div className="text-center py-8 text-gray-600 text-xs">
                        No graphs yet.
                    </div>
                )}
             </div>
        </div>
    );
}



export default function ContextSidebar({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const isSettings = pathname.includes('/settings');
  const isWrite = pathname.includes('/write');
  const isGraph = pathname.includes('/graph');

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

  if (isSettings) {
      const isProfile = pathname.includes('/account');
      const isGraphSettings = pathname.includes('/settings/graph');
      
      content = (
        <div className="space-y-1">
            <SidebarItem 
                icon={User}
                label="Profile"
                href="/editor/settings/account"
                isActive={isProfile}
            />
            <SidebarItem 
                icon={SlidersHorizontal}
                label="Graph Editor"
                href="/editor/settings/graph"
                isActive={isGraphSettings}
            />
        </div>
      );
      title = 'Settings';
  }
  else if (isWrite) {
      title = 'Manuscript';
       content = (
         <div className="space-y-1">
            {[1, 2, 3].map((i) => (
                <SidebarItem 
                    key={i}
                    icon={FileText}
                    label={`Chapter ${i}`}
                    subLabel="The Beginning..."
                    isActive={i === 1}
                />
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
      return null; 
  }

  return (
    <>
        <AnimatePresence>
            {!open && (isSettings || isWrite || isGraph) && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={() => setOpen(true)}
                    className="fixed top-4 left-24 z-50 p-2 bg-panel/50 backdrop-blur-md border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <PanelRightOpen size={18} />
                </motion.button>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {open && (
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] } }}
                    exit={{ x: -50, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }}
                    className="fixed top-0 left-20 h-full w-64 bg-background/95 backdrop-blur-xl z-40 py-8 px-4 flex flex-col shadow-2xl border-r border-white/5"
                >
                    <div className="flex items-center justify-between mb-6 px-2">
                        <motion.h2 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                            className="text-[10px] font-bold text-gray-400 uppercase tracking-widest"
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
                        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
                    >
                        {content}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  );
}

'use client';

import { useCallback, useEffect, useState, useRef, Suspense } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
  Node,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  ReactFlowInstance,
  useOnSelectionChange,
  ConnectionLineType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams } from 'next/navigation';
import { Loader2, User, MapPin, FileText, GripHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

import StoryNode from './_components/StoryNode';
import { useGraphStore } from './_store/useGraphStore';

const nodeTypes = {
  story: StoryNode,
};

function GraphContent() {
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get('project');
  const { screenToFlowPosition, fitView, setViewport } = useReactFlow();

  // Store access
  const { 
      pages, activePageId, 
      setPages, setActivePage, setSelectedNode,
      setNodes: setStoreNodes, setEdges: setStoreEdges,
      getSnapshot 
  } = useGraphStore();

  useOnSelectionChange({
    onChange: ({ nodes }) => {
        setSelectedNode(nodes.length > 0 ? nodes[0].id : null);
    },
  });

  // Local ReactFlow state (synced with store)
  // We use useNodesState for React Flow performance, but we must sync back to store
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isLoaded = useRef(false);

  // 1. Initial Load
  useEffect(() => {
    if (!projectSlug) return;
    
    // Prevent double-load
    // if (isLoaded.current) return; 

    setLoading(true);
    fetch(`/api/projects/graph?project_slug=${projectSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.pages && data.pages.length > 0) {
             setPages(data.pages);
             // Use saved activePageId, or default to first page
             const safeActiveId = data.pages.find((p: any) => p.id === data.activePageId) ? data.activePageId : data.pages[0].id;
             setActivePage(safeActiveId);
             isLoaded.current = true;
        } else {
             // Fallback if empty (should be caught by API, but safety net)
             const defaultPageId = crypto.randomUUID();
             const newPage = { id: defaultPageId, name: 'Story Map', nodes: [], edges: [] };
             setPages([newPage]);
             setActivePage(defaultPageId);
             isLoaded.current = true;
        }
      })
      .catch(err => console.error("Failed to load graph", err))
      .finally(() => setLoading(false));
  }, [projectSlug, setPages, setActivePage]);

  // 2. Sync Active Page from Store to Local State (Smart Merge)
  useEffect(() => {
      if (!isLoaded.current) return;
      if (!activePageId) return;
      
      const activePage = pages.find(p => p.id === activePageId);
      if (!activePage) return;

      setNodes((localNodes) => {
          // If the page just loaded or massive change, or switching pages, maybe we should take store as truth?
          // But to support concurrent editing (Sidebar vs Canvas), we merge.
          // Map store nodes to local nodes, preserving local position/interactions.
          
          if (localNodes.length === 0 && activePage.nodes.length > 0) {
              // Initial hydration for this page
              return activePage.nodes;
          }

          return activePage.nodes.map(storeNode => {
              const localNode = localNodes.find(n => n.id === storeNode.id);
              if (localNode) {
                  return {
                      ...storeNode,
                      // Preserve local state that is ephemeral or authoritative locally
                      position: localNode.position, 
                      selected: localNode.selected,
                      dragging: localNode.dragging,
                      // Ensure data is merged (Store data wins for content)
                      data: { ...localNode.data, ...storeNode.data } 
                  };
              }
              return storeNode;
          });
      });
      
      // Edges are simpler, usually just structural
      setEdges(activePage.edges);

  }, [activePageId, pages, setNodes, setEdges]);
  
  // 3. Sync Local Changes to Store
  // We debounce this to avoid thrashing the store/storage on every drag pixel
  useEffect(() => {
      if (!isLoaded.current) return;
      if (!activePageId) return;
      
      const timer = setTimeout(() => {
           // We only update if there's a difference to avoid cycles?
           // For now, simple set is safest for "saving" state.
           setStoreNodes(nodes);
           setStoreEdges(edges);
      }, 500);
      
      return () => clearTimeout(timer);
  }, [nodes, edges, setStoreNodes, setStoreEdges, activePageId]);

  // 4. Auto-Save Store to Server
  useEffect(() => {
    if (!isLoaded.current || !projectSlug) return;
    
    // Auto-save relies on the Store being up to date.
    // The Store is updated by the effect above (Local -> Store) OR by Sidebar (Direct Store mutation).

    const save = setTimeout(() => {
        setSaving(true);
        const snapshot = getSnapshot();
        
        // Don't save if empty pages (unless intentionally deleting?)
        // if (snapshot.pages.length === 0) return;

        fetch(`/api/projects/graph?project_slug=${projectSlug}`, {
            method: 'POST',
            body: JSON.stringify(snapshot),
        })
        .finally(() => setTimeout(() => setSaving(false), 500));
    }, 1000);

    return () => clearTimeout(save);
  }, [pages, activePageId, projectSlug, getSnapshot]); // 'pages' includes all data modifications



  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a78bfa', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  const addNode = (type: string) => {
    const id = crypto.randomUUID();
    const position = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    });
    
    // Add jitter
    position.x += Math.random() * 50 - 25;
    position.y += Math.random() * 50 - 25;

    const newNode: Node = {
        id,
        type: 'story',
        position,
        data: { 
            label: type === 'chapter' ? 'New Chapter' : type === 'character' ? 'New Character' : type === 'family' ? 'Family Member' : 'New Location',
            type,
            description: 'Click to edit details...'
        },
    };
    
    // Update Local
    const newNodes = nodes.concat(newNode);
    setNodes(newNodes);
    
    // Update Store IMMEDIATELY so Sidebar sees it if we click it right away
    setStoreNodes(newNodes);
  };

  return (
    <div className="h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0a0a0a] relative group">
       {/* Loading State */}
       {loading && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Loader2 className="text-accent animate-spin" size={48} />
         </div>
       )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#050505]"
        colorMode="dark"
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        connectionLineStyle={{ stroke: '#a78bfa', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={2} 
            color="#555" 
            style={{ opacity: 1 }}
        />
        
        <Controls position="bottom-right" className="bg-[#0f1113] border border-white/10 fill-white text-white rounded-lg overflow-hidden [&>button]:!border-white/5 [&>button:hover]:!bg-white/10 shadow-xl" />
        
        <MiniMap 
            position="bottom-left"
            className="!bg-[#0f1113] !border !border-white/10 rounded-xl overflow-hidden shadow-2xl m-4"
            nodeColor={() => '#333'}
            maskColor="rgba(0,0,0,0.6)"
            zoomable
            pannable
        />

        {/* Floating Toolbar - Draggable */}
        <Panel position="top-center" className="mt-4 pointer-events-none">
             <motion.div 
                className="pointer-events-auto flex items-center gap-2 p-1.5 bg-[#0f1113]/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl cursor-grab active:cursor-grabbing"
                drag
                dragMomentum={false}
             >
                <div className="pl-3 pr-1 text-gray-500">
                    <GripHorizontal size={14} />
                </div>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={() => addNode('chapter')} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-xs font-bold text-white uppercase tracking-wider">
                    <FileText size={14} className="text-accent" />
                    Chapter
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={() => addNode('character')} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-xs font-bold text-white uppercase tracking-wider">
                    <User size={14} className="text-pink-500" />
                    Character
                </button>
                <button onClick={() => addNode('location')} className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-colors text-xs font-bold text-white uppercase tracking-wider">
                    <MapPin size={14} className="text-emerald-500" />
                    Location
                </button>
            </motion.div>
        </Panel>
        
        {/* Status Indicator */}
        <Panel position="top-right" className="mt-4 mr-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
                {saving ? (
                    <>
                        <Loader2 size={12} className="animate-spin text-accent" />
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Saving...</span>
                    </>
                ) : (
                    <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Saved</span>
                    </>
                )}
             </div>
        </Panel>

      </ReactFlow>
    </div>
  );
}

export default function GraphPage() {
    return (
        <ReactFlowProvider>
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-[#0a0a0a]"><Loader2 className="animate-spin text-accent" /></div>}>
                <GraphContent />
            </Suspense>
        </ReactFlowProvider>
    );
}

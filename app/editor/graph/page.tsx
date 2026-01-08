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
  useOnSelectionChange
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams } from 'next/navigation';
import { Loader2, User, MapPin, FileText, GripHorizontal, Undo, Redo, Plus } from 'lucide-react';
import { motion } from 'framer-motion';


import StoryNode from './_components/StoryNode';
import { useGraphStore } from './_store/useGraphStore';

const nodeTypes = {
  story: StoryNode,
};

function GraphContent() {
  const searchParams = useSearchParams();
  const initialProjectSlug = searchParams.get('project');
  const { screenToFlowPosition } = useReactFlow();

  // Store access
  const { 
      pages, activePageId, 
      setPages, setActivePage, setSelectedNode,
      setNodes: setStoreNodes, setEdges: setStoreEdges,
      updateViewport,
      getSnapshot,
      graphSettings
  } = useGraphStore();



  useOnSelectionChange({
    onChange: ({ nodes }) => {
        setSelectedNode(nodes.length > 0 ? nodes[0].id : null);
    },
  });

  // Local ReactFlow state (synced with store)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // 6. Sync Edge Styles with Settings
  useEffect(() => {
     // Only run if we have edges and a setting to apply
     if (!graphSettings?.edgeType) return;
     
     setEdges((currentEdges) => {
         if (currentEdges.length === 0) return currentEdges;
         
         // Check if update is needed
         const needsUpdate = currentEdges.some(e => e.type !== graphSettings.edgeType);
         if (!needsUpdate) return currentEdges;

         const newEdges = currentEdges.map(e => ({ 
             ...e, 
             type: graphSettings.edgeType 
         }));
         
         // Update store as well so it persists
         // We do this in a timeout to avoid strict mode/render cycle issues
         setTimeout(() => setStoreEdges(newEdges), 0);
         
         return newEdges;
     });
  }, [graphSettings?.edgeType, setEdges, setStoreEdges]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isLoaded = useRef(false);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);

  const constraintsRef = useRef(null);
  const { setViewport } = useReactFlow();

  // Cast store to any to avoid Zundo type issues for now
  const store = useGraphStore as any;

  // 1. Initial Load (Modified for Project-Scoped Persistence)
  useEffect(() => {
    if (!initialProjectSlug) {
        setLoading(false);
        return;
    }
    
    // Reset store if switching projects
    if (projectSlug && projectSlug !== initialProjectSlug) {
        setPages([]);
        setActivePage('');
        setNodes([]);
        setEdges([]);
        setLoading(true);
        isLoaded.current = false;
    }

    setProjectSlug(initialProjectSlug);
    // Persist slug globally for navigation recovery
    localStorage.setItem('last_project_slug', initialProjectSlug);
    setLoading(true);

    const storageKey = `graph-store-${initialProjectSlug}`;
    const localData = localStorage.getItem(storageKey);

    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            if (parsed.pages && parsed.pages.length > 0) {
                 setPages(parsed.pages);
                 const safeActiveId = parsed.activePageId || parsed.pages[0].id;
                 setActivePage(safeActiveId);
                 
                 const page = parsed.pages.find((p: any) => p.id === safeActiveId);
                 if (page && page.viewport) {
                     setViewport(page.viewport);
                 }

                 isLoaded.current = true;
                 setLoading(false);
                 // We trust local data, but we could trigger background sync here if needed.
                 // For now, local wins.
                 return;
            }
        } catch (e) {
            console.error("Failed to parse local graph data", e);
        }
    }

    // Fallback to API if no local data
    fetch(`/api/projects/graph?project_slug=${initialProjectSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.pages && data.pages.length > 0) {
             setPages(data.pages);
             const safeActiveId = data.pages.find((p: any) => p.id === data.activePageId) ? data.activePageId : data.pages[0].id;
             setActivePage(safeActiveId);
             
             const page = data.pages.find((p: any) => p.id === safeActiveId);
             if (page && page.viewport) {
                 setViewport(page.viewport);
             }

             isLoaded.current = true;
        } else {
             const defaultPageId = crypto.randomUUID();
             const newPage: any = { id: defaultPageId, name: 'Story Map', nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
             setPages([newPage]);
             setActivePage(defaultPageId);
             isLoaded.current = true;
        }
      })
      .catch(err => console.error("Failed to load graph", err))
      .finally(() => setLoading(false));
  }, [initialProjectSlug, setPages, setActivePage, setViewport, projectSlug, setNodes, setEdges]);

  // 2. Sync Active Page (Smart Merge)
  useEffect(() => {
      // NOTE: We relaxed the check for activePageId/pages length in the dependency array
      // to avoid weird loops, but we need to ensure local state sync
      if (!isLoaded.current && pages.length === 0) return;
      if (!activePageId) return;
      
      const activePage = pages.find(p => p.id === activePageId);
      if (!activePage) return;

      setNodes((localNodes) => {
          return activePage.nodes.map(storeNode => {
              const localNode = localNodes.find(n => n.id === storeNode.id);
              if (localNode) {
                  return {
                      ...storeNode,
                      position: localNode.position, 
                      selected: localNode.selected,
                      dragging: localNode.dragging,
                      data: { ...localNode.data, ...storeNode.data } 
                  };
              }
              return storeNode;
          });
      });
      setEdges(activePage.edges);
      
      // Viewport sync logic remains separate
  }, [activePageId, pages, setNodes, setEdges]);
  
  // Separate effect for Viewport Restore on Page Change
  const prevPageIdRef = useRef(activePageId);
  useEffect(() => {
     if (activePageId !== prevPageIdRef.current) {
         const page = pages.find(p => p.id === activePageId);
         if (page && page.viewport) {
             setViewport(page.viewport);
         }
         prevPageIdRef.current = activePageId;
     }
  }, [activePageId, pages, setViewport]);


  // 3. Debounced Auto-Save (Local + Remote)
  useEffect(() => {
    if (!projectSlug) return;
    
    // Save to LocalStorage immediately (or throttled slightly)
    const snapshot = getSnapshot();
    if (snapshot.pages.length > 0) {
        const storageKey = `graph-store-${projectSlug}`;
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
    }

    // Remote Save
    const timeout = setTimeout(() => {
      setSaving(true);
      fetch('/api/projects/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...snapshot, project_slug: projectSlug }),
      })
      .then(() => setSaving(false))
      .catch(err => {
         console.error("Save failed", err);
         setSaving(false);
      });

    }, 1000); 

    return () => clearTimeout(timeout);
  }, [projectSlug, pages, activePageId, getSnapshot]);


  // 4. Sync Local Node Changes to Store (unchanged)
  const onNodesChangeHandler = useCallback((changes: any) => {
      onNodesChange(changes);
  }, [onNodesChange]);

  const onNodeDragStop = useCallback((e: any, node: any) => {
      const p = pages.find(p => p.id === activePageId);
      if (p) {
          const newNodes = p.nodes.map(n => n.id === node.id ? { ...n, position: node.position } : n);
          setStoreNodes(newNodes);
      }
  }, [pages, activePageId, setStoreNodes]);

  // 5. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Delete Node
        if (e.key === 'Delete' || e.key === 'Backspace') {
             // Avoid deleting if editing text inputs (though we are in a graph, check target?)
             const target = e.target as HTMLElement;
             if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

             const selected = nodes.filter(n => n.selected);
             if (selected.length > 0) {
                 e.preventDefault();
                 selected.forEach(node => {
                     store.getState().deleteNode(node.id);
                 });
                 // Also remove from local state immediately to feel snappy
                 // setNodes(nodes => nodes.filter(n => !n.selected));
                 // (But re-render from store update will handle it?)
                 // Store update -> useEffect syncs nodes -> UI updates.
                 // Ideally we want it instant.
             }
        }

        // Undo/Redo
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) {
                store.temporal.getState().redo();
            } else {
                store.temporal.getState().undo();
            }
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
            e.preventDefault();
            store.temporal.getState().redo();
        }

        // Copy/Paste
        if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
             const selected = nodes.filter(n => n.selected);
             if (selected.length > 0) {
                 localStorage.setItem('graph_clipboard', JSON.stringify(selected));
             }
        }

        if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
             const clip = localStorage.getItem('graph_clipboard');
             if (clip) {
                 try {
                     const pasted = JSON.parse(clip) as Node[];
                     if (pasted.length > 0) {
                        const newNodes = pasted.map(p => ({
                            ...p,
                            id: crypto.randomUUID(),
                            position: { x: p.position.x + 20, y: p.position.y + 20 },
                            selected: true,
                        }));
                        
                        // Deselect current
                        const current = nodes.map(n => ({...n, selected: false}));
                        const finalNodes = [...current, ...newNodes];
                        setNodes(finalNodes);
                        setStoreNodes(finalNodes);
                     }
                 } catch(err) { console.error('Paste failed', err); }
             }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, setNodes, setStoreNodes, store]);

  const onConnect = useCallback((params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      setStoreEdges(addEdge(params, edges));
  }, [setEdges, setStoreEdges, edges]);
  
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
    
    // Update Store IMMEDIATELY
    setStoreNodes(newNodes);
  };

  // Viewport Sync
  const onMoveEnd = useCallback((event: any, viewport: any) => {
      updateViewport(viewport);
  }, [updateViewport]);

  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const [toolbarLoaded, setToolbarLoaded] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('graph_toolbar_pos');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              setToolbarPos(parsed);
          } catch (e) { console.error(e); }
      }
      setToolbarLoaded(true);
  }, []);



  // Performance Metrics
  const [metrics, setMetrics] = useState({ x: 0, y: 0, zoom: 1, fps: 60 });
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
      let rafId: number;
      const loop = () => {
          const now = performance.now();
          frameCountRef.current++;
          if (now - lastTimeRef.current >= 1000) {
              setMetrics(prev => ({ ...prev, fps: frameCountRef.current }));
              frameCountRef.current = 0;
              lastTimeRef.current = now;
          }
          rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(rafId);
  }, []);

  // Viewport Metric Sync
  const onMove = useCallback((evt: any, viewport: any) => {
     setMetrics(prev => ({ 
         ...prev, 
         x: Math.round(viewport.x), 
         y: Math.round(viewport.y), 
         zoom: Number(viewport.zoom.toFixed(2)) 
     }));
  }, []);

  if (loading && !isLoaded.current) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] z-50">
            <Loader2 className="animate-spin text-gray-500" />
        </div>
      );
  }

  if (!initialProjectSlug) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-[#0a0a0a] text-gray-500">
              <p>No project selected.</p>
          </div>
      );
  }
  
  return (
    <div className="w-full h-screen overflow-hidden bg-background relative group" ref={constraintsRef} style={{ height: '100vh' }}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChangeHandler}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            onMoveEnd={onMoveEnd}
            onMove={onMove}
            nodeTypes={nodeTypes}
            className="bg-[#050505]"
            colorMode="dark"
            minZoom={0.1}
            maxZoom={2}
            snapToGrid={graphSettings?.snapToGrid}
            snapGrid={[20, 20]} // Fixed spacing for now, or add to settings if needed
            proOptions={{ hideAttribution: true }}
            connectionLineType={graphSettings?.connectionLineType as any}
            defaultEdgeOptions={{
                type: graphSettings?.edgeType,
                animated: true,
                style: { stroke: '#555' },
            }}
        >
            {graphSettings?.showGrid && (
                <Background 
                    color="#333" 
                    gap={graphSettings?.gridType === 'dots' ? 20 : 40} 
                    size={1} 
                    variant={graphSettings?.gridType === 'lines' ? BackgroundVariant.Lines : graphSettings?.gridType === 'cross' ? BackgroundVariant.Cross : BackgroundVariant.Dots} 
                />
            )}
            <Controls className="bg-[#0f1113] border border-white/10 text-white" />
            {graphSettings?.showMinimap && <MiniMap className="right-4 top-4" style={{ backgroundColor: '#0f1113', height: 100, width: 150 }} maskColor="#050505" nodeColor="#555" />}
        </ReactFlow>

        {/* Floating Toolbar */}
        <Panel position="bottom-center" className="mb-8 z-40">
            <motion.div 
                className="pointer-events-auto flex items-center gap-2 p-1.5 bg-panel/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl cursor-grab active:cursor-grabbing"
                drag
                dragMomentum={false}
                dragConstraints={constraintsRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                    opacity: toolbarLoaded ? 1 : 0, 
                    y: toolbarLoaded ? (toolbarPos.y || 0) : 20,
                    x: toolbarLoaded ? (toolbarPos.x || 0) : 0
                }}
            >
                 <div className="pl-3 pr-1 text-gray-500">
                     <GripHorizontal size={14} />
                 </div>
                 <div className="w-px h-4 bg-white/10" />
                 
                 <button 
                   onClick={() => addNode('chapter')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-xs font-medium text-white"
                 >
                     <FileText size={14} className="text-accent" />
                     <span>Chapter</span>
                 </button>
                  <button 
                   onClick={() => addNode('character')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-xs font-medium text-white"
                 >
                     <User size={14} className="text-pink-500" />
                     <span>Character</span>
                 </button>
                  <button 
                   onClick={() => addNode('location')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-xs font-medium text-white"
                 >
                     <MapPin size={14} className="text-emerald-500" />
                     <span>Location</span>
                 </button>
 
                 <div className="w-px h-4 bg-white/10" />
                 
                 <button onClick={() => store.temporal.getState().undo()} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Undo (Ctrl+Z)">
                     <Undo size={14} />
                 </button>
                 <button onClick={() => store.temporal.getState().redo()} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors" title="Redo (Ctrl+Y)">
                     <Redo size={14} />
                 </button>
            </motion.div>
        </Panel>
        
        {/* Metrics Display */}
        <div className="absolute bottom-4 right-4 z-40 text-[10px] font-mono text-gray-600 flex items-center gap-4 bg-[#0f1113]/80 backdrop-blur border border-white/5 px-3 py-1.5 rounded-full pointer-events-none select-none">
             <span>{metrics.fps} FPS</span>
             <span className="text-gray-700">|</span>
             <span>X: {metrics.x}</span>
             <span>Y: {metrics.y}</span>
             <span>Z: {metrics.zoom}x</span>
             <span className="text-gray-700">|</span>
            {saving ? <span className="text-yellow-500">Saving...</span> : <span>Saved</span>}
        </div>

        {/* Node Details Panel */}

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

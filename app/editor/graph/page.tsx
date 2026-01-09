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
  useOnSelectionChange,
  ConnectionLineType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSearchParams } from 'next/navigation';
import { Loader2, User, MapPin, FileText, GripHorizontal, Undo, Redo } from 'lucide-react';
import { Button } from '@/app/_components/ui/Button';
import { motion } from 'framer-motion';


import StoryNode from './_components/StoryNode';
import { useGraphStore, type GraphPage } from './_store/useGraphStore';
import { useGraphSync } from './_hooks/useGraphSync';
import NodeDetailsPanel from './_components/NodeDetailsPanel';

const nodeTypes = {
  story: StoryNode,
};

function GraphContent() {
  const searchParams = useSearchParams();
  const initialProjectSlug = searchParams.get('project');
  const { screenToFlowPosition } = useReactFlow();

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

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useGraphSync(graphSettings, setEdges, setStoreEdges);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isLoaded = useRef(false);
  const [projectSlug, setProjectSlug] = useState<string | null>(null);

  const constraintsRef = useRef(null);
  const { setViewport } = useReactFlow();

  const store = useGraphStore as unknown as { 
      temporal: { getState: () => { undo: () => void, redo: () => void } },
      getState: () => { deleteNode: (id: string) => void }
  };

  useEffect(() => {
    if (!initialProjectSlug) {
        setLoading(false);
        return;
    }
    
    if (projectSlug && projectSlug !== initialProjectSlug) {
        setPages([]);
        setActivePage('');
        setNodes([]);
        setEdges([]);
        setLoading(true);
        isLoaded.current = false;
    }

    setProjectSlug(initialProjectSlug);
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
                 
                 const page = parsed.pages.find((p: GraphPage) => p.id === safeActiveId);
                 if (page && page.viewport) {
                     setViewport(page.viewport);
                 }

                 isLoaded.current = true;
                 setLoading(false);
                 return;
            }
        } catch (e) {
            console.error("Failed to parse local graph data", e);
        }
    }

    fetch(`/api/projects/graph?project_slug=${initialProjectSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.pages && data.pages.length > 0) {
             setPages(data.pages);
             const safeActiveId = data.pages.find((p: GraphPage) => p.id === data.activePageId) ? data.activePageId : data.pages[0].id;
             setActivePage(safeActiveId);
             
             const page = data.pages.find((p: GraphPage) => p.id === safeActiveId);
             if (page && page.viewport) {
                 setViewport(page.viewport);
             }

             isLoaded.current = true;
        } else {
             const defaultPageId = crypto.randomUUID();
             const newPage: GraphPage = { id: defaultPageId, name: 'Story Map', nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
             setPages([newPage]);
             setActivePage(defaultPageId);
             isLoaded.current = true;
        }
      })
      .catch(err => console.error("Failed to load graph", err))
      .finally(() => setLoading(false));
  }, [initialProjectSlug, setPages, setActivePage, setViewport, projectSlug, setNodes, setEdges]);

  useEffect(() => {
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
      
  }, [activePageId, pages, setNodes, setEdges]);
  
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


  useEffect(() => {
    if (!projectSlug) return;
    
    const snapshot = getSnapshot();
    if (snapshot.pages.length > 0) {
        const storageKey = `graph-store-${projectSlug}`;
        localStorage.setItem(storageKey, JSON.stringify(snapshot));
    }

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




  const onNodeDragStop = useCallback((e: React.MouseEvent, node: Node) => {
      const p = pages.find(p => p.id === activePageId);
      if (p) {
          const newNodes = p.nodes.map(n => n.id === node.id ? { ...n, position: node.position } : n);
          setStoreNodes(newNodes);
      }
  }, [pages, activePageId, setStoreNodes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
             const target = e.target as HTMLElement;
             if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

             const selected = nodes.filter(n => n.selected);
             if (selected.length > 0) {
                 e.preventDefault();
                 selected.forEach(node => {
                     store.getState().deleteNode(node.id);
                 });
             }
        }

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

    const newNodes = nodes.concat(newNode);
    setNodes(newNodes);

    setStoreNodes(newNodes);
  };

  const onMoveEnd = useCallback((event: unknown, viewport: { x: number; y: number; zoom: number }) => {
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

  const onMove = useCallback((evt: unknown, viewport: { x: number; y: number; zoom: number }) => {
     setMetrics(prev => ({
         ...prev,
         x: Math.round(viewport.x),
         y: Math.round(viewport.y),
         zoom: Number(viewport.zoom.toFixed(2))
     }));
  }, []);

  if (loading && !isLoaded.current) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background z-50">
            <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      );
  }

  if (!initialProjectSlug) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground">
              <p>No project selected.</p>
          </div>
      );
  }

  return (
    <div className="w-full h-full text-foreground" ref={constraintsRef}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            onMoveEnd={onMoveEnd}
            onMove={onMove}
            nodeTypes={nodeTypes}
            className="bg-background"
            colorMode="dark"
            minZoom={0.1}
            maxZoom={2}
            snapToGrid={graphSettings?.snapToGrid}
            snapGrid={graphSettings?.snapGrid}
            proOptions={{ hideAttribution: true }}
            connectionLineType={
                graphSettings?.connectionLineType === 'straight' ? ConnectionLineType.Straight :
                graphSettings?.connectionLineType === 'step' ? ConnectionLineType.Step :
                graphSettings?.connectionLineType === 'smoothstep' ? ConnectionLineType.SmoothStep :
                ConnectionLineType.Bezier
            }
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
                    variant={
                        graphSettings?.gridType === 'lines' ? BackgroundVariant.Lines :
                        graphSettings?.gridType === 'cross' ? BackgroundVariant.Cross :
                        BackgroundVariant.Dots
                    }
                />
            )}
            <Controls className="bg-[#0f1113] border border-border text-white" />
            {graphSettings?.showMinimap && (
                <MiniMap
                    position="top-right"
                    className="m-4 rounded-xl border border-glass-border overflow-hidden shadow-2xl backdrop-blur-md"
                    style={{ height: 100, width: 150, backgroundColor: 'var(--glass-bg)' }}
                    maskColor="rgba(0,0,0,0.3)"
                    nodeColor="#555"
                />
            )}
            <Panel position="bottom-center" className="mb-8 z-40">
                <motion.div
                    className="pointer-events-auto flex items-center gap-2 p-1.5 bg-panel/80 backdrop-blur-xl border border-border rounded-full shadow-2xl cursor-grab active:cursor-grabbing"
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

                     <Button
                       onClick={() => addNode('chapter')}
                       variant="ghost"
                       size="sm"
                       className="rounded-full hover:bg-white/10 text-xs gap-2"
                     >
                         <FileText size={14} className="text-accent" />
                         <span>Chapter</span>
                     </Button>
                      <Button
                       onClick={() => addNode('character')}
                       variant="ghost"
                       size="sm"
                       className="rounded-full hover:bg-white/10 text-xs gap-2"
                     >
                         <User size={14} className="text-pink-500" />
                         <span>Character</span>
                     </Button>
                      <Button
                       onClick={() => addNode('location')}
                       variant="ghost"
                       size="sm"
                       className="rounded-full hover:bg-white/10 text-xs gap-2"
                     >
                         <MapPin size={14} className="text-emerald-500" />
                         <span>Location</span>
                     </Button>

                     <div className="w-px h-4 bg-white/10" />

                     <Button variant="ghost" size="icon" onClick={() => useGraphStore.temporal.getState().undo()} className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Undo (Ctrl+Z)">
                         <Undo size={14} />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => useGraphStore.temporal.getState().redo()} className="rounded-full h-8 w-8 hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Redo (Ctrl+Y)">
                         <Redo size={14} />
                     </Button>
                </motion.div>
            </Panel>

            <Panel position="bottom-right" className="m-4">
                <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-4 bg-panel/80 backdrop-blur border border-glass-border px-3 py-1.5 rounded-full pointer-events-none select-none">
                     <span>{metrics.fps} FPS</span>
                     <span className="text-gray-700">|</span>
                     <span>X: {metrics.x}</span>
                     <span>Y: {metrics.y}</span>
                     <span>Z: {metrics.zoom}x</span>
                     <span className="text-gray-700">|</span>
                    {saving ? <span className="text-yellow-500">Saving...</span> : <span>Saved</span>}
                </div>
            </Panel>
        </ReactFlow>

        <NodeDetailsPanel />
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

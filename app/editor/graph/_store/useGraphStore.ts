import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

export interface GraphPage {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
}

interface GraphState {
  pages: GraphPage[];
  activePageId: string;
  selectedNodeId: string | null;
  
  // Actions
  setPages: (pages: GraphPage[]) => void;
  setActivePage: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  addPage: (name: string) => void;
  updatePageName: (id: string, name: string) => void;
  deletePage: (id: string) => void; // This deletes a graph page

  // Node Actions
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (id: string) => void; // New action to delete a node from the store

  // Active Page Helpers
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateViewport: (viewport: { x: number; y: number; zoom: number }) => void;
  
  // Persistence Helper
  getSnapshot: () => { pages: GraphPage[], activePageId: string };
}

import { temporal } from 'zundo';

export const useGraphStore = create<GraphState>()(
  temporal(
      (set, get) => ({
        pages: [],
        activePageId: '',
        selectedNodeId: null,

        setPages: (pages) => set({ pages }),
        setActivePage: (id) => set({ activePageId: id, selectedNodeId: null }),
        setSelectedNode: (id) => set({ selectedNodeId: id }),
        
        addPage: (name) => set((state) => {
          const newPage: GraphPage = {
              id: crypto.randomUUID(),
              name,
              nodes: [],
              edges: [],
              viewport: { x: 0, y: 0, zoom: 1 }
          };
          return { 
              pages: [...state.pages, newPage],
              activePageId: newPage.id
          };
        }),
        
        updatePageName: (id, name) => set((state) => ({
            pages: state.pages.map(p => p.id === id ? { ...p, name } : p)
        })),
        
        deletePage: (id) => set((state) => {
            const newPages = state.pages.filter(p => p.id !== id);
            const newActive = newPages.length > 0 ? newPages[0].id : '';
            return { pages: newPages, activePageId: newActive };
        }),

        updateNodeData: (id, data) => set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                nodes: p.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
            } : p)
        })),

        deleteNode: (id) => set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? {
                ...p,
                nodes: p.nodes.filter(n => n.id !== id),
                edges: p.edges.filter(e => e.source !== id && e.target !== id)
            } : p)
        })),

        setNodes: (nodes) => set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? { ...p, nodes } : p)
        })),

        setEdges: (edges) => set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? { ...p, edges } : p)
        })),

        updateViewport: (viewport) => set((state) => ({
            pages: state.pages.map(p => p.id === state.activePageId ? { ...p, viewport } : p)
        })),
        
        getSnapshot: () => {
            const state = get();
            return { pages: state.pages, activePageId: state.activePageId };
        }
      }),
    {
      partialize: (state) => ({ pages: state.pages }), // Only track pages (nodes/edges) history
      limit: 100
    }
  )
);

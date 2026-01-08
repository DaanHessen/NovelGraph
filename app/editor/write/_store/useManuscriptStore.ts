import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeType = 'chapter' | 'part';

export interface ManuscriptNode {
  id: string;
  type: NodeType;
  title: string;
  content?: string; // HTML or JSON content for chapters
  parentId: string | null;
  index: number;
  collapsed?: boolean;
  wordCount?: number;
}

interface ManuscriptState {
  nodes: ManuscriptNode[];
  activeNodeId: string | null;
  
  // Actions
  addChapter: (parentId: string | null) => void;
  addPart: () => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, title: string) => void;
  updateNodeContent: (id: string, content: string, wordCount: number) => void;
  togglePartCollapsed: (id: string) => void;
  setActiveNode: (id: string) => void;
  moveNode: (activeId: string, overId: string) => void; // Simplified move for now, might need more complex logic for drag-and-drop
  reorderNodes: (newNodes: ManuscriptNode[]) => void;
}

export const useManuscriptStore = create<ManuscriptState>()(
  persist(
    (set, get) => ({
      nodes: [
        {
          id: 'chapter-1',
          type: 'chapter',
          title: 'Chapter 1',
          content: '<p>The beginning...</p>',
          parentId: null,
          index: 0,
          wordCount: 3
        }
      ],
      activeNodeId: 'chapter-1',

      addChapter: (parentId) => set((state) => {
        const id = `chapter-${Date.now()}`;
        const newChapter: ManuscriptNode = {
          id,
          type: 'chapter',
          title: 'New Chapter',
          content: '',
          parentId,
          index: state.nodes.filter(n => n.parentId === parentId).length,
          wordCount: 0
        };
        return { 
            nodes: [...state.nodes, newChapter],
            activeNodeId: id
        };
      }),

      addPart: () => set((state) => {
        const id = `part-${Date.now()}`;
        const newPart: ManuscriptNode = {
            id,
            type: 'part',
            title: 'New Part',
            parentId: null,
            index: state.nodes.filter(n => n.parentId === null).length,
            collapsed: false
        };
        return { nodes: [...state.nodes, newPart] };
      }),

      deleteNode: (id) => set((state) => {
          // Recursive delete? Or just move children to root?
          // For now, let's just delete the node and move children to root (or delete them too?)
          // Usually dragging out is safer. Let's delete children for now to be safe, but warn user in UI.
          const nodesToDelete = new Set<string>();
          const findChildren = (parentId: string) => {
              state.nodes.forEach(n => {
                  if (n.parentId === parentId) {
                      nodesToDelete.add(n.id);
                      findChildren(n.id);
                  }
              });
          };
          nodesToDelete.add(id);
          findChildren(id);

          const newNodes = state.nodes.filter(n => !nodesToDelete.has(n.id));
          
          let newActiveId = state.activeNodeId;
          if (nodesToDelete.has(state.activeNodeId || '')) {
              newActiveId = newNodes.find(n => n.type === 'chapter')?.id || null;
          }

          return { nodes: newNodes, activeNodeId: newActiveId };
      }),

      updateNodeTitle: (id, title) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, title } : n)
      })),

      updateNodeContent: (id, content, wordCount) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, content, wordCount } : n)
      })),

      togglePartCollapsed: (id) => set((state) => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
      })),

      setActiveNode: (id) => set({ activeNodeId: id }),

      moveNode: (activeId, overId) => {
          // This is complex and depends on dnd-kit implementation. 
          // Often it's easier to just handle the reorder logic in the component and pass the new array.
          // We'll use reorderNodes for bulk updates.
          console.warn("moveNode not implemented in store, use reorderNodes");
      },

      reorderNodes: (newNodes) => set({ nodes: newNodes })

    }),
    {
      name: 'manuscript-storage',
    }
  )
);

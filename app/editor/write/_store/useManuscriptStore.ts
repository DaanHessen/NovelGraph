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
  description?: string;
}

interface ManuscriptState {
  nodes: ManuscriptNode[];
  activeNodeId: string | null;
  
  // Actions
  addChapter: (parentId: string | null) => void;
  addPart: () => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, title: string) => void;
  updateNodeDescription: (id: string, description: string) => void;
  updateNodeContent: (id: string, content: string, wordCount: number) => void;
  togglePartCollapsed: (id: string) => void;
  setActiveNode: (id: string) => void;
  moveNode: (activeId: string, targetId: string, placement: 'inside' | 'before' | 'after') => void;
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

      updateNodeDescription: (id, description) => set((state) => ({
        nodes: state.nodes.map(n => n.id === id ? { ...n, description } : n)
      })),

      togglePartCollapsed: (id) => set((state) => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
      })),

      setActiveNode: (id) => set({ activeNodeId: id }),

      moveNode: (activeId: string, targetId: string, placement: 'inside' | 'before' | 'after') => set((state) => {
          // 'placement' can be 'inside', 'before', 'after'
          // Logic:
          // 1. Find active node.
          // 2. Find target node.
          // 3. Update active node's parentId and index based on placement.
          // 4. Update indices of siblings.

          const activeNode = state.nodes.find(n => n.id === activeId);
          const targetNode = state.nodes.find(n => n.id === targetId);
          
          if (!activeNode || !targetNode || activeId === targetId) return state;

          let newParentId = activeNode.parentId;
          let newIndex = activeNode.index;

          if (placement === 'inside') {
              newParentId = targetId;
              // Add to end of children
              newIndex = state.nodes.filter(n => n.parentId === targetId).length;
          } else {
             // Placing before or after target
             newParentId = targetNode.parentId;
             // Calculate new index
              // We need to re-index all siblings of targetNode
              // This is complex to do transactionally in one go without full list reorder.
              // Easier: Just return the state and let reorderNodes handle bulk sort?
              // BUT, 'inside' changes parentId which reorderNodes (flat list) might not capture if we don't display it right.
              
              // Let's rely on `reorderNodes` to set the whole new state including parentIds if passed.
              // So we will change signature of reorderNodes to accept full node list update.
              return state;
          }
          
           // Return updated node
           const updatedNodes = state.nodes.map(n => n.id === activeId ? { ...n, parentId: newParentId, index: newIndex } : n);
           // We should also normalize indices for the old siblings and new siblings, but for simple 'move inside' append, it's okay.
           return { nodes: updatedNodes };
      }),

      reorderNodes: (newNodes) => set({ nodes: newNodes })

    }),
    {
      name: 'manuscript-storage',
    }
  )
);

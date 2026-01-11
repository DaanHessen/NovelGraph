import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NodeType = 'chapter' | 'part';

export interface ManuscriptNode {
  id: string;
  type: NodeType;
  title: string;
  content?: string;
  parentId: string | null;
  index: number;
  collapsed?: boolean;
  wordCount?: number;
  description?: string;
}

export interface MatterSection {
    id: string;
    enabled: boolean;
    title: string;
    content: string; // HTML or text
    type: 'copyright' | 'dedication' | 'epigraph' | 'toc' | 'foreword' | 'preface' | 'acknowledgments' | 'about_author' | 'also_by' | 'custom';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any; // For structured data like clauses, books list, or image URLs
}

interface ManuscriptState {
  nodes: ManuscriptNode[];
  activeNodeId: string | null;
  activeMatterId: string | null;
  frontMatter: MatterSection[];
  backMatter: MatterSection[];
  
  // existing methods...
  addChapter: (parentId: string | null) => void;
  addPart: () => void;
  deleteNode: (id: string) => void;
  updateNodeTitle: (id: string, title: string) => void;
  updateNodeDescription: (id: string, description: string) => void;
  updateNodeContent: (id: string, content: string, wordCount: number) => void;
  togglePartCollapsed: (id: string) => void;
  setActiveNode: (id: string) => void;
  setActiveMatter: (id: string | null) => void;
  moveNode: (activeId: string, targetId: string, placement: 'inside' | 'before' | 'after') => void;
  reorderNodes: (newNodes: ManuscriptNode[]) => void;
  
  toggleMatterSection: (sectionId: string, isFront: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateMatterContent: (sectionId: string, isFront: boolean, content: string, data?: any) => void;
  
  totalTimeSpent: number; // in seconds
  addTimeSpent: (seconds: number) => void;
}

export const useManuscriptStore = create<ManuscriptState>()(
  persist(
    (set) => ({
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
      activeMatterId: null,
      frontMatter: [
          { id: 'copyright', title: 'Copyright', enabled: true, type: 'copyright', content: '' },
          { id: 'dedication', title: 'Dedication', enabled: false, type: 'dedication', content: '' },
          { id: 'epigraph', title: 'Epigraph', enabled: false, type: 'epigraph', content: '' },
          { id: 'toc', title: 'Table of Contents', enabled: true, type: 'toc', content: '' },
          { id: 'foreword', title: 'Foreword', enabled: false, type: 'foreword', content: '' },
          { id: 'preface', title: 'Preface', enabled: false, type: 'preface', content: '' },
          { id: 'acknowledgments', title: 'Acknowledgments', enabled: false, type: 'acknowledgments', content: '' },
      ],
      backMatter: [
          { id: 'about_author', title: 'About the Author', enabled: false, type: 'about_author', content: '' },
          { id: 'also_by', title: 'Also by {author}', enabled: false, type: 'also_by', content: '' },
      ],

      addChapter: (parentId) => set((state) => {
        const id = `chapter-${Date.now()}`;
        const newChapter: ManuscriptNode = {
          id,
          type: 'chapter',
          title: '',
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
            title: '',
            parentId: null,
            index: state.nodes.filter(n => n.parentId === null).length,
            collapsed: false
        };
        return { nodes: [...state.nodes, newPart] };
      }),

      deleteNode: (id) => set((state) => {
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

      setNodeCollapsed: (id: string, collapsed: boolean) => set((state) => ({
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, collapsed } : n)),
      })),

      togglePartCollapsed: (id) => set((state) => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, collapsed: !n.collapsed } : n)
      })),

      setActiveNode: (id) => set({ activeNodeId: id, activeMatterId: null }), // Modified to clear activeMatterId

      setActiveMatter: (id) => set({ activeMatterId: id, activeNodeId: null }), // New method

      moveNode: (activeId: string, targetId: string, placement: 'inside' | 'before' | 'after') => set((state) => {

          const activeNode = state.nodes.find(n => n.id === activeId);
          const targetNode = state.nodes.find(n => n.id === targetId);
          
          if (!activeNode || !targetNode || activeId === targetId) return state;

          let newParentId = activeNode.parentId;
          let newIndex = activeNode.index;

          if (placement === 'inside') {
              newParentId = targetId;
              newIndex = state.nodes.filter(n => n.parentId === targetId).length;
          } else {
             newParentId = targetNode.parentId;

              return state;
          }
          
           const updatedNodes = state.nodes.map(n => n.id === activeId ? { ...n, parentId: newParentId, index: newIndex } : n);
           return { nodes: updatedNodes };
      }),

      reorderNodes: (newNodes) => set({ nodes: newNodes }),

      toggleMatterSection: (sectionId, isFront) => set((state) => {
          const list = isFront ? 'frontMatter' : 'backMatter';
          return {
              [list]: state[list].map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s)
          };
      }),

      updateMatterContent: (sectionId, isFront, content, data) => set((state) => {
          const list = isFront ? 'frontMatter' : 'backMatter';
          return {
              [list]: state[list].map(s => s.id === sectionId ? { ...s, content, data: data ?? s.data } : s)
          };
      }),

      totalTimeSpent: 0,
      addTimeSpent: (seconds) => set((state) => ({ totalTimeSpent: (state.totalTimeSpent || 0) + seconds }))

    }),
    {
      name: 'manuscript-storage',
    }
  )
);

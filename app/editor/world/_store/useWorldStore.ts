import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type WorldItemType = 'character' | 'location' | 'item' | 'lore' | 'other';

export interface WorldItem {
    id: string;
    name: string;
    type: WorldItemType;
    description: string;
    attributes: Record<string, string>;
    image?: string;
}

export interface WorldCategory {
    id: string;
    name: string;
    type: WorldItemType;
    items: WorldItem[];
}

interface WorldState {
    categories: WorldCategory[];
    activeCategoryId: string | null;
    selectedItemId: string | null;
    isLoading: boolean;
    
    setCategories: (categories: WorldCategory[]) => void;
    setActiveCategory: (id: string | null) => void;
    setSelectedItem: (id: string | null) => void;
    setLoading: (loading: boolean) => void;

    addItem: (categoryId: string, item: Omit<WorldItem, 'id'>) => void;
    updateItem: (categoryId: string, itemId: string, updates: Partial<WorldItem>) => void;
    deleteItem: (categoryId: string, itemId: string) => void;
    
    addCategory: (name: string, type: WorldItemType) => void;
    deleteCategory: (id: string) => void;

    getSnapshot: () => { categories: WorldCategory[] };
}

export const useWorldStore = create<WorldState>((set, get) => ({
    categories: [],
    activeCategoryId: null,
    selectedItemId: null,
    isLoading: false,

    setCategories: (categories) => set({ categories }),
    setActiveCategory: (id) => set({ activeCategoryId: id }),
    setSelectedItem: (id) => set({ selectedItemId: id }),
    setLoading: (loading) => set({ isLoading: loading }),

    addItem: (categoryId, item) => set((state) => ({
        categories: state.categories.map(cat => 
            cat.id === categoryId 
                ? { ...cat, items: [...cat.items, { ...item, id: uuidv4() }] }
                : cat
        )
    })),

    updateItem: (categoryId, itemId, updates) => set((state) => ({
        categories: state.categories.map(cat => 
            cat.id === categoryId
                ? { 
                    ...cat, 
                    items: cat.items.map(item => 
                        item.id === itemId ? { ...item, ...updates } : item
                    ) 
                  }
                : cat
        )
    })),

    deleteItem: (categoryId, itemId) => set((state) => {
        const newCategories = state.categories.map(cat => 
            cat.id === categoryId
                ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
                : cat
        );
        // Deselect if deleted
        const selectedItemId = state.selectedItemId === itemId ? null : state.selectedItemId;
        return { categories: newCategories, selectedItemId };
    }),

    addCategory: (name, type) => set((state) => ({
        categories: [...state.categories, { id: uuidv4(), name, type, items: [] }]
    })),

    deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id),
        activeCategoryId: state.activeCategoryId === id ? null : state.activeCategoryId
    })),

    getSnapshot: () => ({
        categories: get().categories
    })
}));

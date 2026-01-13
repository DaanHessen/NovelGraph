import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExportConfig } from '../_utils/exportUtils';

interface ExportState extends ExportConfig {
    setConfig: (config: Partial<ExportConfig>) => void;
    // Actions
    updateTitle: (title: string) => void;
    updateAuthor: (author: string) => void;
    updateCover: (dataUrl: string | undefined) => void;
    toggleTOC: () => void;
    setForeword: (content: string | undefined) => void;
    setAfterword: (content: string | undefined) => void;
}

export const useExportStore = create<ExportState>()(
    persist(
        (set) => ({
            title: 'Untitled Story',
            author: '',
            copyright: `Copyright © ${new Date().getFullYear()} All rights reserved.`,
            includeTOC: true,
            language: 'en',
            coverImage: undefined,
            foreword: undefined,
            afterword: undefined,

            setConfig: (config) => set((state) => ({ ...state, ...config })),
            
            updateTitle: (title) => set({ title }),
            updateAuthor: (author) => set({ author }),
            updateCover: (coverImage) => set({ coverImage }),
            toggleTOC: () => set((state) => ({ includeTOC: !state.includeTOC })),
            setForeword: (foreword) => set({ foreword }),
            setAfterword: (afterword) => set({ afterword }),
        }),
        {
            name: 'export-store',
        }
    )
);

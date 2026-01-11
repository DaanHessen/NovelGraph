import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WriteSettingsState {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  maxWidth: number;
  fontFamily: string;
  focusMode: boolean;
  typewriterMode: boolean;
  showStats: boolean;
  groqApiKey: string;

  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setParagraphSpacing: (spacing: number) => void;
  setMaxWidth: (width: number) => void;
  setFontFamily: (font: string) => void;
  setFocusMode: (enabled: boolean) => void;
  setTypewriterMode: (enabled: boolean) => void;
  setShowStats: (enabled: boolean) => void;
  setGroqApiKey: (key: string) => void;
}

export const useWriteSettingsStore = create<WriteSettingsState>()(
  persist(
    (set) => ({
      fontSize: 18,
      lineHeight: 1.8,
      paragraphSpacing: 1.2,
      maxWidth: 65,
      fontFamily: 'sans',
      focusMode: false,
      typewriterMode: false,
      showStats: true,
      groqApiKey: '',

      setFontSize: (fontSize) => set({ fontSize }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setParagraphSpacing: (paragraphSpacing) => set({ paragraphSpacing }),
      setMaxWidth: (maxWidth) => set({ maxWidth }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFocusMode: (focusMode) => set({ focusMode }),
      setTypewriterMode: (typewriterMode) => set({ typewriterMode }),
      setShowStats: (showStats) => set({ showStats }),
      setGroqApiKey: (groqApiKey) => set({ groqApiKey }),
    }),
    {
      name: 'write-settings',
    }
  )
);

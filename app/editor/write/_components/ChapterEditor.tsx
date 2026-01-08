import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect } from 'react';
import { useManuscriptStore } from '../_store/useManuscriptStore';

export default function ChapterEditor() {
    const { activeNodeId, nodes, updateNodeContent } = useManuscriptStore();
    const activeNode = nodes.find(n => n.id === activeNodeId);
    
    // Add local state to track if we're saving to avoid re-render loops or cursor jumps
    // Tiptap handles its own state well, but we need to push to store.

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Typography,
            CharacterCount,
            Placeholder.configure({
                placeholder: 'Start writing your masterpiece...',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[50vh]',
                spellcheck: 'true', // Native spellcheck for red wobbly lines
            },
        },
        onUpdate: ({ editor }) => {
            if (activeNodeId) {
                // We update the store on every keystroke? Maybe debounce in real app, but for now direct is fine for responsiveness.
                // Actually, store updates trigger re-renders. 
                // Since this component uses `activeNode` from store, it might re-render.
                // But `activeNode` changes will be referential.
                // We should be careful not to reset editor content if the update came from us.
                updateNodeContent(activeNodeId, editor.getHTML(), editor.storage.characterCount.words());
            }
        },
    });

    // When the active node changes, we must update the editor content.
    useEffect(() => {
        if (editor && activeNode) {
            // Only set content if it's different to avoid cursor jumps?
            // Tiptap's setContent keeps history if not emitted?
            // Actually, we check if the content in editor matches node content.
            // But node content might be stale vs editor if we just typed.
            // If we switched chapters, we definitely want to setContent.
            
            // To distinguish "Switched Chapter" from "Typed and Store Updated", we rely on activeNodeId change?
            // But if we define `useEffect` on `activeNodeId`, we are good.
            // If we define it on `activeNode`, it triggers on every keystroke save.
            
            // So we separate the effect:
            // 1. One generic effect to handle content setting WHEN active ID changes.
        }
    }, [activeNodeId, editor]); // activeNode excluded to avoid re-loop

    // We also need to set content initially or when activeNodeId changes
    useEffect(() => {
        if (editor && activeNode) {
            const currentContent = editor.getHTML();
            if (currentContent !== activeNode.content) {
                // If the IDs match (we are looking at the node), and content differs.
                // Wait, if we just typed, `activeNode.content` is updated by us.
                // So `currentContent` === `activeNode.content` roughly.
                // BUT if we switch chapters, `activeNode` is the NEW chapter.
                // So `currentContent` (old chapter) != `activeNode.content` (new chapter).
                
                // We basically want to set content ONLY when we switch to a new ID.
                editor.commands.setContent(activeNode.content || '');
            }
        }
    }, [activeNodeId, editor]); // Only when ID changes (or editor inits)

    if (!activeNode || activeNode.type === 'part') {
        return (
            <div className="flex items-center justify-center h-[50vh] text-gray-500">
                Select a chapter to start writing.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-4xl font-serif text-white mb-2">{activeNode.title}</h1>
                <p className="text-gray-400 font-serif italic text-sm">
                    {editor?.storage.characterCount.words()} words
                </p>
            </div>
            
            <EditorContent editor={editor} />
        </div>
    );
}

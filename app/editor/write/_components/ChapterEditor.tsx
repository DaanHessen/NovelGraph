import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState } from 'react';
import { useManuscriptStore } from '../_store/useManuscriptStore';
import { FolderOpen } from 'lucide-react';
import { franc } from 'franc-min';

export default function ChapterEditor() {
    const { activeNodeId, nodes, updateNodeContent, updateNodeTitle, updateNodeDescription } = useManuscriptStore();
    const activeNode = nodes.find(n => n.id === activeNodeId);
    
    const [language, setLanguage] = useState('en');

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
                spellcheck: 'true',
                lang: language,
            },
        },
        onUpdate: ({ editor }) => {
            if (activeNodeId) {
                updateNodeContent(activeNodeId, editor.getHTML(), editor.storage.characterCount.words());
            }
        },
    }, [activeNodeId, language]); 

    useEffect(() => {
        if (editor && activeNode && activeNode.type === 'chapter') {
            const currentContent = editor.getHTML();
            if (currentContent !== activeNode.content) {
                editor.commands.setContent(activeNode.content || '');
            }
        }
    }, [activeNodeId, editor, activeNode]);

    useEffect(() => {
        if (!editor) return;
        
        const detectLanguage = () => {
            const text = editor.getText();
            if (text.length < 10) return; // Too short to detect

            const detected = franc(text);
            // Map franc codes (3 letter) to HTML lang codes (2 letter)
            const map: Record<string, string> = {
                'nld': 'nl',
                'deu': 'de',
                'fra': 'fr',
                'spa': 'es',
                'eng': 'en'
            };
            
            const lang2 = map[detected] || 'en';
            if (lang2 !== language) {
                setLanguage(lang2);
            }
        };

        const timeout = setTimeout(detectLanguage, 1000);
        return () => clearTimeout(timeout);
    }, [editor, language]); 


    if (!activeNode) {
        return (
            <div className="flex items-center justify-center h-[50vh] text-gray-500">
                Select a chapter or part to view.
            </div>
        );
    }

    if (activeNode.type === 'part') {
        return (
             <div className="max-w-2xl mx-auto py-20 animate-in fade-in duration-300">
                <div className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-6">
                    <div className="flex items-center gap-4 text-purple-400 mb-4">
                        <FolderOpen size={32} />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Folder Details</h2>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Title</label>
                        <input 
                            value={activeNode.title}
                            onChange={(e) => updateNodeTitle(activeNode.id, e.target.value)}
                            className="w-full bg-transparent text-3xl font-serif text-white outline-none border-b border-white/10 focus:border-purple-500 transition-colors pb-2 placeholder-gray-600"
                            placeholder="Folder Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-gray-500">Description / Subtext</label>
                        <textarea 
                            value={activeNode.description || ''}
                            onChange={(e) => {
                                const text = e.target.value;
                                const words = text.trim().split(/\s+/).filter(Boolean).length;
                                if (words <= 500) {
                                    updateNodeDescription(activeNode.id, text);
                                }
                            }}
                            className="w-full bg-transparent text-lg text-gray-300 outline-none border-b border-white/10 focus:border-purple-500 transition-colors pb-2 resize-none h-32 placeholder-gray-600"
                            placeholder="Add a brief description or subtext for this part..."
                        />
                    </div>
                    
                    <div className="pt-4 flex items-center gap-2 text-xs text-gray-500">
                        <span>Folder ID: {activeNode.id}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="mb-8 flex items-end justify-between animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div>
                    <h1 className="text-4xl font-serif text-white mb-2">{activeNode.title}</h1>
                    <div className="flex items-center gap-3 text-gray-400 font-serif italic text-sm">
                        <span>{editor?.storage.characterCount.words()} words</span>
                    </div>
                </div>
            </div>
            
            <EditorContent editor={editor} />
        </div>
    );
}

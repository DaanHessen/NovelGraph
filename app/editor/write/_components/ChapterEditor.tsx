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
import SpeechInput from './SpeechInput';

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

    const handleSpeech = (text: string) => {
        if (!editor) return;
        // Insert text at cursor with a space before if needed
        editor.commands.insertContent(` ${text.trim()}`);
    };

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
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 space-y-6">
                    <div className="flex items-center gap-4 text-primary mb-4">
                        <FolderOpen size={32} />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Folder Details</h2>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">Title</label>
                        <input 
                            value={activeNode.title}
                            onChange={(e) => updateNodeTitle(activeNode.id, e.target.value)}
                            className="w-full bg-transparent text-3xl font-serif text-foreground outline-none border-b border-border focus:border-primary transition-colors pb-2 placeholder-muted-foreground"
                            placeholder="Folder Name"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">Description / Subtext</label>
                        <textarea 
                            value={activeNode.description || ''}
                            onChange={(e) => {
                                const text = e.target.value;
                                const words = text.trim().split(/\s+/).filter(Boolean).length;
                                if (words <= 500) {
                                    updateNodeDescription(activeNode.id, text);
                                }
                            }}
                            className="w-full bg-transparent text-lg text-muted-foreground outline-none border-b border-border focus:border-primary transition-colors pb-2 resize-none h-32 placeholder-muted-foreground/50"
                            placeholder="Add a brief description or subtext for this part..."
                        />
                    </div>
                    
                    <div className="pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Folder ID: {activeNode.id}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="mb-8 group relative">
                <input 
                    value={activeNode.title}
                    onChange={(e) => updateNodeTitle(activeNode.id, e.target.value)}
                    className="w-full bg-transparent text-4xl font-serif text-foreground outline-none border-b border-transparent focus:border-border hover:border-border/30 transition-all pb-2 mb-2 placeholder-muted-foreground/50"
                    placeholder="Chapter Title"
                />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-muted-foreground font-serif italic text-sm">
                        <span>{editor?.storage.characterCount.words()} words</span>
                        <span className="text-muted-foreground/30">•</span>
                        <span>{editor?.storage.characterCount.characters()} characters</span>
                    </div>
                    <SpeechInput onTranscript={handleSpeech} />
                </div>
            </div>
            
            <EditorContent editor={editor} />
        </div>
    );
}

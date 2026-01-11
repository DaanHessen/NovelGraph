import { useManuscriptStore } from '../_store/useManuscriptStore';
import { Info } from 'lucide-react';
import { useAuthorProfile } from '../../_hooks/useAuthorProfile';
import { useWriteSettingsStore } from '../_store/useWriteSettingsStore';
import clsx from 'clsx';
import { CopyrightEditor } from './matter/CopyrightEditor';
import { EpigraphEditor } from './matter/EpigraphEditor';
import { AboutAuthorEditor } from './matter/AboutAuthorEditor';
import { AlsoByEditor } from './matter/AlsoByEditor';
// Use the same editor engine or a simplified version?
// For now, simple text areas or specialized UI as requested.



export default function MatterEditor() {
    const { activeMatterId, frontMatter, backMatter, updateMatterContent } = useManuscriptStore();
    const { username } = useAuthorProfile();
    const settings = useWriteSettingsStore();
    
    // Determine active section
    const activeFront = frontMatter.find(m => m.id === activeMatterId);
    const activeBack = backMatter.find(m => m.id === activeMatterId);
    const activeSection = activeFront || activeBack;
    const isFront = !!activeFront;

    const editorStyle = {
        fontSize: `${settings.fontSize}px`,
        lineHeight: settings.lineHeight,
        maxWidth: `${settings.maxWidth}ch`,
        fontFamily: settings.fontFamily === 'mono' ? 'monospace' : settings.fontFamily === 'serif' ? 'serif' : 'sans-serif',
    };

    if (!activeSection) return <div className="flex items-center justify-center h-full text-gray-500">Select a section</div>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (content: string, data?: any) => {
        updateMatterContent(activeSection.id, isFront, content, data);
    };

    return (
        <div 
            className={clsx(
                "mx-auto py-10 animate-in fade-in duration-500 transition-all ease-in-out",
                settings.focusMode && "opacity-80 hover:opacity-100"
            )}
            style={{ maxWidth: `${Math.max(settings.maxWidth, 60)}ch` }} // Container constraint
        >
            <div className="mb-8 border-b border-border pb-4">
                <h1 className="text-4xl font-serif text-foreground mb-2">{activeSection.title.replace('{author}', username || 'Author')}</h1>
                <p className="text-sm text-muted-foreground font-serif italic">
                    {isFront ? 'Front Matter' : 'Back Matter'}
                </p>
                
                {settings.showStats && (
                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                        <span>{activeSection.content?.trim().split(/\s+/).filter(Boolean).length || 0} words</span>
                        {/* Estimate reading time: ~200 wpm */}
                        <span>{~~((activeSection.content?.trim().split(/\s+/).filter(Boolean).length || 0) / 200)} min read</span>
                    </div>
                )}
            </div>

            {activeSection.type === 'copyright' && (
                <CopyrightEditor section={activeSection} onChange={handleChange} />
            )}

            {activeSection.type === 'epigraph' && (
                <EpigraphEditor section={activeSection} onChange={handleChange} />
            )}

            {activeSection.type === 'toc' && (
                 <div className="p-4 bg-accent/5 rounded-lg border border-border text-center text-muted-foreground">
                     <Info className="mx-auto mb-2" />
                     <p>Table of Contents is generated automatically during export.</p>
                 </div>
            )}
            
            {activeSection.type === 'about_author' && (
                <AboutAuthorEditor section={activeSection} onChange={handleChange} />
            )}

            {activeSection.type === 'also_by' && (
                 <AlsoByEditor section={activeSection} onChange={handleChange} />
            )}

            {/* Default Editor for others */}
            {['dedication', 'foreword', 'preface', 'acknowledgments', 'custom'].includes(activeSection.type) && (
                <textarea
                    value={activeSection.content}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={`Write your ${activeSection.title.toLowerCase()}...`}
                    className={clsx(
                        "w-full h-[60vh] bg-transparent resize-none outline-none placeholder:font-sans placeholder:text-gray-600 focus:placeholder:text-gray-500/50 block mx-auto",
                        settings.typewriterMode && "my-[40vh]"
                    )}
                    style={editorStyle}
                />
            )}
        </div>
    );
}




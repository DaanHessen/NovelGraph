"use client";

import { useExportStore } from '../_store/useExportStore';
import { SettingsInput } from '../../settings/_components/SettingsInput';
import { Book, Image as ImageIcon, FileText } from 'lucide-react';
import { useManuscriptStore } from '../../write/_store/useManuscriptStore';
import { exportToPdf, exportToEpub } from '../_utils/exportUtils';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ExportSidebarContent() {
    const store = useExportStore();
    const { nodes } = useManuscriptStore();
    const author = useExportStore(s => s.author);
    const updateTitle = useExportStore(s => s.updateTitle);
    const updateAuthor = useExportStore(s => s.updateAuthor);
    const params = useSearchParams();
    const projectSlug = params.get('project');

    // Auto-fill Author from profile if empty
    useEffect(() => {
        if (!author) {
            fetch('/api/settings/profile')
                .then(res => res.json())
                .then(data => {
                    if (data.first_name) {
                        updateAuthor(`${data.first_name} ${data.last_name || ''}`.trim());
                    }
                })
                .catch(() => {});
        }
    }, [author, updateAuthor]);

    // Auto-fill Title from Project if empty or default
    useEffect(() => {
        if (projectSlug && (store.title === 'Untitled Story' || !store.title)) {
            fetch(`/api/projects?slug=${projectSlug}`)
                .then(res => res.json())
                .then(data => {
                    if (data.name) {
                        updateTitle(data.name);
                    }
                })
                .catch(() => {});
        }
    }, [projectSlug, store.title, updateTitle]);

    const getChapters = () => {
        return nodes
            .filter(n => n.type === 'chapter' || n.type === 'part')
            .map(n => ({ title: n.title, content: n.content || '', id: n.id, type: n.type }));
    };

    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'pdf' | 'epub') => {
        setIsExporting(true);
        try {
            const chapters = getChapters();
            const { frontMatter, backMatter } = useManuscriptStore.getState();
            const currentConfig = useExportStore.getState();
            
            if (format === 'pdf') {
                await exportToPdf(chapters, currentConfig, frontMatter, backMatter);
            } else {
                await exportToEpub(chapters, currentConfig, frontMatter, backMatter);
            }
        } catch (error) {
            console.error(error);
            alert("Export failed");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300 pb-10">
             <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Export Options</span>
            </div>

            {/* Metadata Section */}
            <section className="space-y-4 px-1">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Book Title</label>
                        <SettingsInput 
                            value={store.title}
                            onChange={(e) => store.updateTitle(e.target.value)}
                            placeholder="My Great Novel"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">Author Name</label>
                        <SettingsInput 
                            value={store.author}
                            onChange={(e) => store.updateAuthor(e.target.value)}
                            placeholder="Author Name"
                        />
                    </div>
                </div>
            </section>

            <div className="h-px bg-white/5 w-full" />

            {/* Cover Image */}
            <section className="space-y-4 px-1">
                 <div className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <ImageIcon size={12} /> Cover
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors cursor-pointer group relative">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const result = ev.target?.result;
                                    if (typeof result === 'string') store.updateCover(result);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                    {store.coverImage ? (
                        <div className="relative aspect-2/3 w-full max-w-[80px] mx-auto shadow-lg rounded overflow-hidden">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={store.coverImage} alt="Cover" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-[10px] text-white font-medium">Change</span>
                             </div>
                        </div>
                    ) : (
                        <div className="py-4 space-y-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mx-auto text-white/50 group-hover:bg-white/20 group-hover:text-white transition-colors">
                                <ImageIcon size={16} />
                            </div>
                            <div className="text-[10px] text-muted-foreground">Click to upload</div>
                        </div>
                    )}
                </div>
            </section>

             <div className="h-px bg-white/5 w-full" />

             {/* Structure */}
             <section className="space-y-4 px-1">
                <div className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <Book size={12} /> Structure
                </div>
                
                <div className="text-xs text-muted-foreground">
                    Front and Back matter enabled in the <strong>Write</strong> tab will be automatically included.
                </div>
            </section>

            <div className="pt-4 space-y-2">
                <button 
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="w-full py-2 bg-white text-black text-xs font-bold rounded-md hover:bg-white/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? <span className="animate-spin">⏳</span> : <FileText size={14} />} 
                    {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
                 <button 
                    onClick={() => handleExport('epub')}
                    disabled={isExporting}
                    className="w-full py-2 bg-white/10 text-white text-xs font-bold rounded-md hover:bg-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExporting ? <span className="animate-spin">⏳</span> : <Book size={14} />}
                    {isExporting ? 'Exporting...' : 'Export EPUB'}
                </button>
            </div>
        </div>
    );
}

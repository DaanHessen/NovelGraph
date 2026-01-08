"use client";

import { useState, useEffect } from 'react';
import { useManuscriptStore } from '../write/_store/useManuscriptStore';
import { exportToPdf, exportToEpub, exportToMarkdown, ExportConfig } from './_utils/exportUtils';
import { Download, Book, FileText, ChevronRight, PenTool } from 'lucide-react';

export default function ExportPage() {
    const { nodes } = useManuscriptStore();
    
    // Default config
    const [config, setConfig] = useState<ExportConfig>({
        title: 'Untitled Story',
        author: 'Unknown Author',
        copyright: `Copyright © ${new Date().getFullYear()} All rights reserved.`,
        includeTOC: true,
        language: 'en'
    });
    
    // UI State
    const [activeTab, setActiveTab] = useState<'general' | 'content'>('general');
    const [foreword, setForeword] = useState('');
    const [afterword, setAfterword] = useState('');
    const [customCopyright, setCustomCopyright] = useState(false);

    // Load defaults from first chapter or store?
    useEffect(() => {
        // Try to guess title from manuscript or project settings later
        // For now, static defaults or user input.
        // Maybe load author profile?
        const loadProfile = async () => {
             try {
                const res = await fetch('/api/settings/profile');
                if (res.ok) {
                    const data = await res.json();
                    if(data.first_name) setConfig(c => ({ ...c, author: `${data.first_name} ${data.last_name || ''}`.trim()}));
                }
             } catch(e) {}
        };
        loadProfile();
    }, []);

    const getChapters = () => {
        // Flatten and sort chapters
        // We only export Chapters, not Folders (unless folders denote sections?)
        // Usually we export active chapters.
        // Let's grab all nodes of type 'chapter', sorted by index (conceptually).
        // A real robust export would walk the tree.
        // MVP: Filter 'chapters' and try to respect order.
        return nodes
            .filter(n => n.type === 'chapter')
            .map(n => ({ title: n.title, content: n.content || '', id: n.id }));
    };

    const handleExport = async (format: 'pdf' | 'epub' | 'md') => {
         const chapters = getChapters();
         const exportConfig = { 
             ...config, 
             foreword: foreword || undefined, 
             afterword: afterword || undefined 
         };

         if (format === 'pdf') await exportToPdf(chapters, exportConfig);
         if (format === 'epub') await exportToEpub(chapters, exportConfig);
         if (format === 'md') exportToMarkdown(chapters, exportConfig);
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-500">
             <header className="px-8 py-8 border-b border-white/5 bg-background/50 backdrop-blur-xl sticky top-0 z-30">
                <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
                    <div>
                        <h1 className="text-3xl font-serif text-white mb-2">Export Manuscript</h1>
                        <p className="text-gray-400 text-sm">Turn your writing into a polished book.</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Metadata Card */}
                        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                                <PenTool size={18} className="text-purple-400"/> Book Metadata
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-gray-500">Book Title</label>
                                    <input 
                                        value={config.title}
                                        onChange={(e) => setConfig({ ...config, title: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-gray-500">Author Name</label>
                                    <input 
                                        value={config.author}
                                        onChange={(e) => setConfig({ ...config, author: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1 pt-2">
                                <div className="flex items-center justify-between mb-1">
                                     <label className="text-xs uppercase font-bold text-gray-500">Copyright</label>
                                     <button 
                                        onClick={() => setCustomCopyright(!customCopyright)}
                                        className="text-[10px] text-purple-400 hover:text-purple-300"
                                     >
                                        {customCopyright ? 'Use Standard' : 'Use Custom'}
                                     </button>
                                </div>
                                <textarea 
                                    value={config.copyright}
                                    onChange={(e) => setConfig({ ...config, copyright: e.target.value })}
                                    disabled={!customCopyright}
                                    className={`w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors text-sm min-h-[80px] ${!customCopyright ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        </div>

                         {/* Front/Back Matter */}
                         <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">
                                <Book size={18} className="text-purple-400"/> Front & Back Matter
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-gray-500">Foreword (Before Story)</label>
                                    <textarea 
                                        value={foreword}
                                        onChange={(e) => setForeword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors min-h-[100px]"
                                        placeholder="Introduction, dedication, or prologue..."
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs uppercase font-bold text-gray-500">Afterword (End of Story)</label>
                                    <textarea 
                                        value={afterword}
                                        onChange={(e) => setAfterword(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500 transition-colors min-h-[100px]"
                                        placeholder="Acknowledgements, about the author, or teaser for next book..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="toc"
                                checked={config.includeTOC} // using config.includeTOC
                                onChange={(e) => setConfig({...config, includeTOC: e.target.checked })}
                                className="rounded bg-white/10 border-white/20 text-purple-500 focus:ring-purple-500"
                            />
                            <label htmlFor="toc" className="text-sm text-gray-300">Include Table of Contents</label>
                        </div>

                    </div>

                    {/* Right Column: Actions */}
                    <div className="space-y-4">
                        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/10 sticky top-24">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Download Formats</h3>
                            
                            <div className="space-y-3">
                                <button 
                                    onClick={() => handleExport('pdf')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                                            <FileText size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-white">PDF Document</div>
                                            <div className="text-xs text-gray-500">Print-ready format</div>
                                        </div>
                                    </div>
                                    <ExternalIcon />
                                </button>

                                <button 
                                    onClick={() => handleExport('epub')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                            <Book size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-white">EPUB eBook</div>
                                            <div className="text-xs text-gray-500">For Kindle, Apple Books</div>
                                        </div>
                                    </div>
                                    <ExternalIcon />
                                </button>

                                <button 
                                    onClick={() => handleExport('md')}
                                    className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                            <Download size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-bold text-white">Markdown</div>
                                            <div className="text-xs text-gray-500">Raw text format</div>
                                        </div>
                                    </div>
                                    <ExternalIcon />
                                </button>
                            </div>
                             
                             <div className="mt-6 pt-6 border-t border-white/5 text-center">
                                 <p className="text-xs text-gray-500">
                                     Exporting {getChapters().length} chapters.
                                 </p>
                             </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function ExternalIcon() {
    return <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />;
}

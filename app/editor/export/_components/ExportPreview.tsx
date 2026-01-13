"use client";

import { useManuscriptStore } from '../../write/_store/useManuscriptStore';
import { ExportConfig } from '../_utils/exportUtils';
import { useMemo } from 'react';

interface ExportPreviewProps {
    config: ExportConfig;
}

export default function ExportPreview({ config }: ExportPreviewProps) {
    const { nodes, frontMatter, backMatter } = useManuscriptStore();
    
    const previewContent = useMemo(() => {
        const content: Array<{title: string, content: string, type: string}> = [];
        
        // Add Front Matter
        frontMatter.forEach(section => {
             if(section.enabled) {
                 content.push({ title: section.title, content: section.content, type: 'frontmatter' });
             }
        });

        // Add Chapters/Parts
        const chapters = nodes
            .filter(n => n.type === 'chapter' || n.type === 'part')
            .map(n => ({ title: n.title, content: n.content || '', type: n.type }));
        
        const mainContent = [...content, ...chapters];

        // Add Back Matter
        backMatter.forEach(section => {
             if(section.enabled) {
                 mainContent.push({ title: section.title, content: section.content, type: 'backmatter' });
             }
        });
        
        return mainContent;
    }, [nodes, frontMatter, backMatter]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-hidden relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-muted-foreground text-xs uppercase tracking-wider font-medium">
                Print Preview
            </div>

            <div className="w-[calc(100%-4rem)] h-full max-w-4xl bg-[#e5e5e5] shadow-2xl rounded-sm overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent p-12 md:p-16 lg:p-20 text-black">
                
                {/* Book Cover / Title Page */}
                <div className="min-h-[800px] flex flex-col items-center justify-center mb-24 border-b border-gray-300 pb-12">
                     {config.coverImage ? (
                        <div className="w-full max-w-sm aspect-2/3 shadow-lg mb-8">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={config.coverImage} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                     ) : null}
                     
                     <div className="text-center mt-8 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                            {config.title || "Untitled Story"}
                        </h1>
                        <p className="text-xl md:text-2xl italic text-gray-600 font-serif">
                            {config.author || "Unknown Author"}
                        </p>
                     </div>
                </div>

                {/* Table of Contents Preview */}
                {config.includeTOC && (
                    <div className="mb-24 page-break-after-always">
                        <h2 className="text-2xl font-bold mb-8 font-serif">Table of Contents</h2>
                        <div className="space-y-4 font-serif">
                            {nodes.filter(n => n.type === 'chapter' || n.type === 'part').map(node => (
                                <div key={node.id} className={`flex justify-between items-baseline ${node.type === 'part' ? 'font-bold mt-6 text-lg' : 'pl-4 text-gray-700'}`}>
                                    <span>{node.title}</span>
                                    <span className="border-b border-dotted border-gray-400 flex-1 mx-2"></span>
                                    <span>{node.type === 'part' ? '' : '1'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="space-y-16 max-w-prose mx-auto">
                    {previewContent.map((item, idx) => (
                        <div key={idx} className="mb-16">
                            {item.type === 'part' ? (
                                <div className="h-[400px] flex items-center justify-center text-center">
                                    <h2 className="text-3xl font-bold font-serif">{item.title}</h2>
                                </div>
                            ) : (
                                <article className="prose prose-lg prose-headings:font-serif prose-p:font-serif prose-p:leading-relaxed text-gray-800">
                                    {item.title && <h2 className="text-3xl font-bold mb-8 font-serif">{item.title}</h2>}
                                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                                </article>
                            )}
                            <div className="h-12 flex items-center justify-center my-12 opacity-30 text-2xl font-serif">***</div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

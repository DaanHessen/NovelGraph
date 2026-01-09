import { useManuscriptStore, MatterSection } from '../_store/useManuscriptStore';
import { Check, Info, AlignCenter } from 'lucide-react';
import clsx from 'clsx';
// Use the same editor engine or a simplified version?
// For now, simple text areas or specialized UI as requested.

const CLAUSES = [
    {
        id: 'rights',
        title: 'All rights reserved',
        text: 'All rights reserved. No part of this publication may be reproduced, stored or transmitted in any form or by any means, electronic, mechanical, photocopying, recording, scanning, or otherwise without written permission from the publisher. It is illegal to copy this book, post it to a website, or distribute it by any other means without permission.'
    },
    {
        id: 'fiction',
        title: 'Fiction',
        text: 'This novel is entirely a work of fiction. The names, characters and incidents portrayed in it are the work of the author\'s imagination. Any resemblance to actual persons, living or dead, events or localities is entirely coincidental.'
    },
    {
        id: 'moral',
        title: 'Moral rights',
        text: '{author name} asserts the moral right to be identified as the author of this work.'
    },
    {
        id: 'external',
        title: 'External content',
        text: '{author name} has no responsibility for the persistence or accuracy of URLs for external or third-party Internet Websites referred to in this publication and does not guarantee that any content on such Websites is, or will remain, accurate or appropriate.'
    },
    {
        id: 'designations',
        title: 'Designations',
        text: 'Designations used by companies to distinguish their products are often claimed as trademarks. All brand names and product names used in this book and on its cover are trade names, service marks, trademarks and registered trademarks of their respective owners. The publishers and the book are not associated with any product or vendor mentioned in this book. None of the companies referenced within the book have endorsed the book.'
    }
];

export default function MatterEditor() {
    const { activeMatterId, frontMatter, backMatter, updateMatterContent } = useManuscriptStore();
    
    // Determine active section
    const activeFront = frontMatter.find(m => m.id === activeMatterId);
    const activeBack = backMatter.find(m => m.id === activeMatterId);
    const activeSection = activeFront || activeBack;
    const isFront = !!activeFront;

    if (!activeSection) return <div className="flex items-center justify-center h-full text-gray-500">Select a section</div>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (content: string, data?: any) => {
        updateMatterContent(activeSection.id, isFront, content, data);
    };

    return (
        <div className="max-w-3xl mx-auto py-10 animate-in fade-in duration-500">
            <div className="mb-8 border-b border-white/10 pb-4">
                <h1 className="text-4xl font-serif text-white mb-2">{activeSection.title}</h1>
                <p className="text-sm text-gray-400 font-serif italic">
                    {isFront ? 'Front Matter' : 'Back Matter'}
                </p>
            </div>

            {activeSection.type === 'copyright' && (
                <CopyrightEditor section={activeSection} onChange={handleChange} />
            )}

            {activeSection.type === 'epigraph' && (
                <EpigraphEditor section={activeSection} onChange={handleChange} />
            )}

            {activeSection.type === 'toc' && (
                 <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center text-gray-400">
                     <Info className="mx-auto mb-2" />
                     <p>Table of Contents is generated automatically during export.</p>
                 </div>
            )}
            
            {activeSection.type === 'about_author' && (
                <textarea
                    value={activeSection.content}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Write about the author..."
                    className="w-full h-[60vh] bg-transparent resize-none outline-none text-lg leading-relaxed font-serif placeholder:font-sans placeholder:text-gray-600 focus:placeholder:text-gray-500/50"
                />
            )}

            {/* Default Editor for others */}
            {['dedication', 'foreword', 'preface', 'acknowledgments', 'also_by', 'custom'].includes(activeSection.type) && (
                <textarea
                    value={activeSection.content}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={`Write your ${activeSection.title.toLowerCase()}...`}
                    className="w-full h-[60vh] bg-transparent resize-none outline-none text-lg leading-relaxed font-serif placeholder:font-sans placeholder:text-gray-600 focus:placeholder:text-gray-500/50"
                />
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CopyrightEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    // Data stores array of enabled clause IDs?
    const enabledClauses: string[] = section.data?.enabledClauses || [];
    const customText = section.content || "";

    const toggleClause = (id: string) => {
        const newEnabled = enabledClauses.includes(id) 
            ? enabledClauses.filter(c => c !== id)
            : [...enabledClauses, id];
        
        onChange(customText, { ...section.data, enabledClauses: newEnabled });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500">Clauses</h3>
                <div className="grid gap-3">
                    {CLAUSES.map(clause => {
                        const isEnabled = enabledClauses.includes(clause.id);
                        return (
                            <div 
                                key={clause.id}
                                onClick={() => toggleClause(clause.id)}
                                className={clsx(
                                    "p-4 rounded-lg border cursor-pointer transition-all hover:bg-white/5",
                                    isEnabled ? "border-accent bg-accent/5" : "border-white/10"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        "w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                                        isEnabled ? "bg-accent border-accent text-black" : "border-gray-600"
                                    )}>
                                        {isEnabled && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <div>
                                        <h4 className={clsx("text-sm font-bold mb-1", isEnabled ? "text-white" : "text-gray-400")}>{clause.title}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{clause.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                 <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500">Additional Text</h3>
                 <textarea 
                    value={customText}
                    onChange={(e) => onChange(e.target.value, section.data)}
                    placeholder="Add any custom copyright notices or details..."
                    className="w-full h-40 bg-zinc-900/50 border border-white/10 rounded-lg p-4 text-sm text-gray-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all placeholder:text-gray-600"
                 />
            </div>
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EpigraphEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const author = section.data?.author || "";
    const quote = section.content || "";

    const update = (newQuote: string, newAuthor: string) => {
        onChange(newQuote, { ...section.data, author: newAuthor });
    };

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <AlignCenter className="text-gray-600 mb-4" />
            
            <textarea
                value={quote}
                onChange={(e) => update(e.target.value, author)}
                placeholder="Write your epigraph here..."
                className="w-full max-w-lg bg-transparent border-none outline-none text-2xl font-serif italic text-center placeholder:text-gray-700 resize-none overflow-hidden"
                style={{ minHeight: '100px' }}
            />
            
            <div className="flex items-center gap-2 text-gray-500 font-serif">
                <span>—</span>
                <input 
                    type="text"
                    value={author}
                    onChange={(e) => update(quote, e.target.value)}
                    placeholder="Author or Reference"
                    className="bg-transparent border-none outline-none text-base placeholder:text-gray-700 w-64"
                />
            </div>
        </div>
    );
}

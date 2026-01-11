import { useManuscriptStore, MatterSection } from '../_store/useManuscriptStore';
import { Check, Info, AlignCenter, User, Plus, Trash2 } from 'lucide-react';
import { useAuthorProfile } from '../../_hooks/useAuthorProfile';
import { useWriteSettingsStore } from '../_store/useWriteSettingsStore';
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
                <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Clauses</h3>
                <div className="grid gap-3">
                    {CLAUSES.map(clause => {
                        const isEnabled = enabledClauses.includes(clause.id);
                        return (
                            <div 
                                key={clause.id}
                                onClick={() => toggleClause(clause.id)}
                                className={clsx(
                                    "p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/10",
                                    isEnabled ? "border-primary bg-primary/10" : "border-border"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        "w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                                        isEnabled ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                    )}>
                                        {isEnabled && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <div>
                                        <h4 className={clsx("text-sm font-bold mb-1", isEnabled ? "text-foreground" : "text-muted-foreground")}>{clause.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{clause.text}</p>
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
                    className="w-full h-40 bg-zinc-900/50 border border-border rounded-lg p-4 text-sm text-gray-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all placeholder:text-gray-600"
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
            
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AboutAuthorEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const defaultImage = section.data?.image || null;
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(section.content, { ...section.data, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
         <div className="flex gap-8">
             <div className="shrink-0 space-y-3">
                 <div className="w-48 h-64 bg-muted/10 border border-border rounded-lg flex items-center justify-center relative overflow-hidden group">
                     {defaultImage ? (
                         <img src={defaultImage} alt="Author" className="w-full h-full object-cover" />
                     ) : (
                         <div className="text-center text-muted-foreground">
                             <User size={32} className="mx-auto mb-2 opacity-50" />
                             <span className="text-xs">No Photo</span>
                         </div>
                     )}
                     
                     <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                         <span className="text-xs font-bold text-white border border-border px-3 py-1 rounded-full hover:bg-white hover:text-black transition-colors">
                             {defaultImage ? 'Change Photo' : 'Add Photo'}
                         </span>
                         <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                     </label>
                 </div>
                 <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">Author Portrait</p>
             </div>

             <div className="flex-1">
                <textarea
                    value={section.content}
                    onChange={(e) => onChange(e.target.value, section.data)}
                    placeholder="Write about the author..."
                    className="w-full h-[60vh] bg-transparent resize-none outline-none text-lg leading-relaxed font-serif placeholder:font-sans placeholder:text-muted-foreground focus:placeholder:text-muted-foreground/50 text-foreground"
                />
             </div>
         </div>
    );
}

interface BookItem {
    id: string;
    title: string;
    link?: string;
    year?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AlsoByEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const books: BookItem[] = section.data?.books || [];
    
    // Convert current structure to simple text for preview if needed, but we mostly store in data
    
    const addBook = () => {
        const newBook: BookItem = { id: crypto.randomUUID(), title: '' };
        updateBooks([...books, newBook]);
    };

    const updateBooks = (newBooks: BookItem[]) => {
        // Also update content string for simple exports
        const textContent = newBooks.map(b => b.title + (b.year ? ` (${b.year})` : '')).join('\n');
        onChange(textContent, { ...section.data, books: newBooks });
    };

    const updateBook = (id: string, field: keyof BookItem, value: string) => {
        const newBooks = books.map(b => b.id === id ? { ...b, [field]: value } : b);
        updateBooks(newBooks);
    };

    const removeBook = (id: string) => {
        const newBooks = books.filter(b => b.id !== id);
        updateBooks(newBooks);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-3">
                {books.map(book => (
                    <div key={book.id} className="flex gap-3 group items-start">
                        <div className="flex-1 space-y-2 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-border/80 transition-colors">
                            <input 
                                value={book.title}
                                onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                                placeholder="Book Title"
                                className="w-full bg-transparent border-none outline-none font-serif text-xl italic placeholder:text-muted-foreground text-foreground"
                            />
                            <div className="flex gap-4">
                                <input 
                                    value={book.link || ''}
                                    onChange={(e) => updateBook(book.id, 'link', e.target.value)}
                                    placeholder="Amazon/Store Link (optional)"
                                    className="flex-1 bg-transparent border-none outline-none text-xs text-primary placeholder:text-muted-foreground font-mono"
                                />
                                <input 
                                    value={book.year || ''}
                                    onChange={(e) => updateBook(book.id, 'year', e.target.value)}
                                    placeholder="Year"
                                    className="w-16 bg-transparent border-none outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/50 text-right"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => removeBook(book.id)}
                            className="mt-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={addBook}
                className="w-full py-4 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent/5 hover:border-accent/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
                <Plus size={16} />
                <span>Add Book</span>
            </button>
        </div>
    );
}


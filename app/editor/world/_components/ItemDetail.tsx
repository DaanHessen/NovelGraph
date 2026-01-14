'use client';

import { useWorldStore } from '../_store/useWorldStore';
import { X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

export default function ItemDetail({ categoryId, itemId }: { categoryId: string, itemId: string }) {
    const { categories, updateItem, setSelectedItem } = useWorldStore();
    
    const category = categories.find(c => c.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);

    // Initialize state directly from item (since key={itemId} forces remount)
    const [name, setName] = useState(item?.name || '');
    const [description, setDescription] = useState(item?.description || '');
    const [attributes, setAttributes] = useState<Record<string, string>>(item?.attributes || {});

    if (!item) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[400px] bg-neutral-900 border-l border-white/10 shadow-2xl p-6 flex flex-col z-50">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Item Details</h3>
                <button 
                    onClick={() => setSelectedItem(null)}
                    className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                
                {/* Image Placeholder */}
                <div className="w-full aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-white/10 cursor-pointer transition-colors group">
                    <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-xs">Add Cover Image</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Name</label>
                    <input 
                        className="w-full bg-transparent text-xl font-bold border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0 p-0"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            updateItem(categoryId, itemId, { name: e.target.value });
                        }}
                        placeholder="Item Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea 
                        className="w-full h-32 bg-white/5 rounded-lg border border-white/10 p-3 text-sm resize-none focus:outline-none focus:border-accent/50 transition-colors"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            updateItem(categoryId, itemId, { description: e.target.value });
                        }}
                        placeholder="Write a description..."
                    />
                </div>

                
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                         <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attributes</label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                         {Object.entries(attributes).map(([key, value]) => (
                             <div key={key} className="space-y-1">
                                 <label className="text-[10px] text-muted-foreground uppercase">{key}</label>
                                 <input 
                                    value={value}
                                    onChange={(e) => {
                                        const newAttrs = { ...attributes, [key]: e.target.value };
                                        setAttributes(newAttrs);
                                        updateItem(categoryId, itemId, { attributes: newAttrs });
                                    }}
                                    className="w-full bg-white/5 rounded px-2 py-1.5 text-xs outline-none focus:border-accent border border-transparent" 
                                 />
                             </div>
                         ))}
                         {/* Placeholder for adding new attributes */}
                         {(Object.keys(attributes).length === 0) && (
                             <div className="col-span-2 text-xs text-muted-foreground italic">
                                 No attributes added yet.
                             </div>
                         )}
                    </div>
                </div>

            </div>
        </div>
    );
}

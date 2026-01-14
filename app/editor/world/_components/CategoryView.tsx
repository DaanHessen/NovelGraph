'use client';

import { useWorldStore } from '../_store/useWorldStore';
import { Plus, User, MapPin, Box, Hash, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoryView({ categoryId }: { categoryId: string }) {
    const { categories, addItem, deleteItem, setSelectedItem, selectedItemId } = useWorldStore();
    
    const category = categories.find(c => c.id === categoryId);

    if (!category) return <div>Category not found</div>;

    const handleCreateItem = () => {
        addItem(categoryId, {
            name: 'New Item',
            type: category.type,
            description: '',
            attributes: {},
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{category.items.length} items</p>
                </div>
                <button 
                    onClick={handleCreateItem}
                    className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent/20 transition-colors text-xs font-medium"
                >
                    <Plus size={14} />
                    <span>Create New</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map(item => (
                    <motion.div
                        key={item.id}
                        layoutId={item.id}
                        onClick={() => setSelectedItem(item.id)}
                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                            selectedItemId === item.id 
                            ? 'bg-accent/5 border-accent/50 shadow-[0_0_15px_rgba(var(--accent-rgb),0.1)]' 
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-2">
                             <div className="p-2 rounded-lg bg-black/20 text-muted-foreground group-hover:text-foreground transition-colors">
                                 {item.type === 'character' ? <User size={18} /> : 
                                  item.type === 'location' ? <MapPin size={18} /> : 
                                  item.type === 'item' ? <Box size={18} /> : 
                                  <Hash size={18} />}
                             </div>
                             
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(confirm('Delete item?')) deleteItem(categoryId, item.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-red-400 transition-all"
                             >
                                 <Trash2 size={14} />
                             </button>
                        </div>
                        
                        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {item.description || 'No description yet...'}
                        </p>
                    </motion.div>
                ))}

                {category.items.length === 0 && (
                    <div 
                        onClick={handleCreateItem}
                        className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-white/10 text-muted-foreground hover:text-accent hover:border-accent/30 hover:bg-accent/5 cursor-pointer transition-all"
                    >
                        <Plus size={24} className="mb-2" />
                        <span className="text-xs font-medium">Add {category.name.slice(0, -1)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

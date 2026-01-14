import { useState } from 'react';
import { useWorldStore } from '../_store/useWorldStore';
import SidebarItem from '../../_components/SidebarItem';
import { User, MapPin, Box, Hash, Plus } from 'lucide-react';

export default function WorldSidebarContent() {
    const { categories, activeCategoryId, setActiveCategory, addCategory } = useWorldStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            addCategory(newCategoryName, 'other');
            setNewCategoryName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
             
             {/* Categories Section */}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-2 pb-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">World Elements</span>
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-foreground transition-colors"
                        title="New Category"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreateCategory} className="px-2 mb-2">
                        <input
                            autoFocus
                            className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent"
                            placeholder="Category Name..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onBlur={() => setIsCreating(false)}
                        />
                    </form>
                )}
                
                <div className="space-y-0.5">
                     <SidebarItem 
                        icon={User}
                        label="Characters"
                        isActive={activeCategoryId === 'characters'}
                        onClick={() => setActiveCategory('characters')}
                     />
                     <SidebarItem 
                        icon={MapPin}
                        label="Locations"
                        isActive={activeCategoryId === 'locations'}
                        onClick={() => setActiveCategory('locations')}
                     />
                     
                     {categories.map(cat => (
                         <div key={cat.id} className="relative group">
                            <SidebarItem
                                icon={cat.type === 'item' ? Box : Hash}
                                label={cat.name}
                                isActive={activeCategoryId === cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                            />
                         </div>
                     ))}
                </div>
            </div>

             {/* Dynamic Categories List (if we pull from DB later) */}
        </div>
    );
}

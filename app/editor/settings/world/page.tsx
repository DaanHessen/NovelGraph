'use client';

import { useWorldStore } from '../../world/_store/useWorldStore';
import { Trash2 } from 'lucide-react';

export default function WorldSettingsPage() {
    const { categories, deleteCategory } = useWorldStore();

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold mb-8">World Settings</h1>
            
            <div className="space-y-8">
                
                {/* Category Management */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b border-white/10 pb-2">Manage Categories</h2>
                    <p className="text-sm text-muted-foreground">Manage your custom categories for the world building tab.</p>
                    
                    <div className="space-y-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium">{cat.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">{cat.type}</span>
                                    <span className="text-xs text-muted-foreground">{cat.items.length} items</span>
                                </div>
                                {cat.name !== 'Characters' && cat.name !== 'Locations' && (
                                    <button 
                                        onClick={() => {
                                            if(confirm(`Delete category "${cat.name}" and all its items?`)) {
                                                deleteCategory(cat.id);
                                            }
                                        }}
                                        className="text-muted-foreground hover:text-red-400 p-2 hover:bg-white/5 rounded transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Templates (Future) */}
                <div className="opacity-50 pointer-events-none">
                    <h2 className="text-lg font-semibold border-b border-white/10 pb-2">Templates</h2>
                    <p className="text-sm text-muted-foreground mt-2">Custom templates feature coming soon...</p>
                </div>

            </div>
        </div>
    );
}

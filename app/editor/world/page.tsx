'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { useWorldStore } from './_store/useWorldStore';
import { motion } from 'framer-motion';
import CategoryView from './_components/CategoryView';
import ItemDetail from './_components/ItemDetail';

function WorldContent() {
    const searchParams = useSearchParams();
    const projectSlug = searchParams.get('project');
    const { 
        setCategories, setLoading, isLoading, 
        categories, activeCategoryId, selectedItemId,
        getSnapshot
    } = useWorldStore();

    useEffect(() => {
        if (!projectSlug) return;

        setLoading(true);
        fetch(`/api/projects/world?project_slug=${projectSlug}`)
            .then(res => res.json())
            .then(data => {
                if (data.categories) {
                    setCategories(data.categories);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

    }, [projectSlug, setCategories, setLoading]);

    // Auto-save logic
    useEffect(() => {
        if (!projectSlug) return;

        const timeout = setTimeout(() => {
            const snapshot = getSnapshot();
            fetch('/api/projects/world', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...snapshot, project_slug: projectSlug }),
            }).catch(console.error);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [categories, projectSlug, getSnapshot]);


    return (
        <div className="h-full w-full bg-background flex flex-col p-8 overflow-y-auto">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-pink-400">
                        World Building
                    </h1>
                    <p className="text-muted-foreground mt-2">Create and organize your story&apos;s universe.</p>
                </div>
                {/* Global Actions could go here */}
            </header>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <motion.div 
                        className="flex-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                       {activeCategoryId ? (
                            <CategoryView categoryId={activeCategoryId} />
                       ) : (
                           <div className="col-span-full text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 text-accent">
                                    <Sparkles size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-foreground">Select a category</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">
                                    Choose a category from the sidebar to view or create world elements like characters, locations, and items.
                                </p>
                           </div>
                       )}
                    </motion.div>

                    {selectedItemId && activeCategoryId && (
                        <ItemDetail key={selectedItemId} categoryId={activeCategoryId} itemId={selectedItemId} />
                    )}
                </>
            )}
        </div>
    );
}

export default function WorldPage() {
    return (
        <Suspense fallback={<div className="h-full w-full bg-background flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <WorldContent />
        </Suspense>
    );
}

import { useManuscriptStore, ManuscriptNode, MatterSection } from '../_store/useManuscriptStore';
import { FileText, Folder, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown, BookOpen, User, AlignLeft, Scale } from 'lucide-react';
import { useState } from 'react';
import { DndContext, DragOverlay, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

// ... (DraggableItem component can stay mostly the same but maybe extracted or kept inline if short)
// I will keep it inline for now to avoid multiple file edits if not needed.

function DraggableItem({ node, depth = 0, onToggle, isActive, onDelete, onSelect }: { 
    node: ManuscriptNode, 
    depth?: number, 
    onToggle?: () => void, 
    isActive?: boolean, 
    onDelete?: () => void,
    onSelect?: () => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: node.id, 
        data: { node } 
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 12}px`,
        opacity: isDragging ? 0.3 : 1,
    };

    const isPart = node.type === 'part';
    const Icon = isPart ? (node.collapsed ? Folder : FolderOpen) : FileText;
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            onClick={onSelect}
            className={clsx(
                "group relative flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer border select-none mb-0.5 animate-in slide-in-from-right duration-200",
                isActive 
                    ? "bg-accent/10 border-accent/20 text-accent" 
                    : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white",
                isDragging && "bg-white/5"
            )}
        >
            {isPart && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onToggle) onToggle();
                    }}
                    className="p-0.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
                >
                    {node.collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
            )}
            
            <Icon size={14} className={clsx("shrink-0", !isPart && "ml-[18px]")} />
            
            <span className="text-xs font-medium truncate flex-1 leading-none pt-0.5">
                {node.title}
            </span>

            {node.type === 'chapter' && node.wordCount !== undefined && (
                 <span className="text-[9px] text-gray-600 font-mono hidden group-hover:block">
                     {node.wordCount}w
                 </span>
            )}

            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {onDelete && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm('Delete?')) onDelete();
                        }}
                        className="p-1 hover:bg-red-500/20 rounded text-gray-600 hover:text-red-400 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        </div>
    );
}

function MatterItem({ section, onToggle, onSelect, isActive }: { section: MatterSection, onToggle: () => void, onSelect: () => void, isActive?: boolean }) {
    const Icon = section.type === 'copyright' ? Scale : section.type === 'about_author' ? User : AlignLeft;
    
    return (
        <div 
            onClick={onSelect}
            className={clsx(
                "flex items-center justify-between px-3 py-2 text-gray-400 border border-transparent rounded-lg hover:bg-white/5 cursor-pointer group transition-colors",
                isActive && "bg-white/5 text-white"
            )}
        >
            <div className={clsx("flex items-center gap-3", isActive ? "text-white" : "")}>
                <Icon size={14} className={clsx("transition-colors", isActive ? "text-white" : "group-hover:text-white")} />
                <span className={clsx("text-xs font-medium transition-colors", isActive ? "text-white" : "group-hover:text-white")}>{section.title}</span>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className={clsx(
                    "w-8 h-4 rounded-full relative transition-colors duration-200 border border-transparent hover:brightness-110",
                    section.enabled ? "bg-accent" : "bg-white/10"
                )}
            >
                <div className={clsx(
                    "absolute top-0.5 bottom-0.5 w-3 rounded-full bg-white transition-all duration-200 shadow-sm",
                    section.enabled ? "left-[18px]" : "left-0.5"
                )} />
            </button>
        </div>
    );
}

export default function WriteSidebarContent() {
    const { 
        nodes, addChapter, addPart, togglePartCollapsed, activeNodeId, deleteNode, reorderNodes, setActiveNode,
        frontMatter, backMatter, toggleMatterSection, setActiveMatter, activeMatterId
    } = useManuscriptStore();
    
    const [viewMode, setViewMode] = useState<'manuscript' | 'front' | 'back'>('manuscript');
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getVisibleNodes = () => {
        const visible: ManuscriptNode[] = [];
        const rootNodes = nodes.filter(n => !n.parentId).sort((a, b) => a.index - b.index);

        rootNodes.forEach(root => {
            visible.push(root);
            if (root.type === 'part' && !root.collapsed) {
                const children = nodes.filter(n => n.parentId === root.id).sort((a, b) => a.index - b.index);
                visible.push(...children);
            }
        });
        return visible;
    };

    const visibleNodes = getVisibleNodes();
    const items = visibleNodes.map(n => n.id);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        
        // Prevent same-node drop
        if (activeId === overId) return;

        const activeNode = nodes.find(n => n.id === activeId);
        if (!activeNode) return;

        const newNodes = [...nodes];
        
        // Find current indices in the visible flat list
        const oldIndex = visibleNodes.findIndex(n => n.id === activeId);
        const newIndex = visibleNodes.findIndex(n => n.id === overId);
        
        // If simply reordering within same parent, this works fine.
        // If moving to different parent, we need to be careful.
        
        // Use dnd-kit's arrayMove to visualize the NEW flat order
        const newVisible = arrayMove(visibleNodes, oldIndex, newIndex);
        
        // Determine placement based on neighbors in the new flat order
        const movedNodeIndex = newVisible.findIndex(n => n.id === activeId);
        const nodeAbove = newVisible[movedNodeIndex - 1];
        
        let newParentId: string | null = null;
        
        if (nodeAbove) {
             if (nodeAbove.type === 'part' && !nodeAbove.collapsed) {
                 // Open folder above -> nest inside
                 newParentId = nodeAbove.id;
             } else {
                 // Otherwise sibling-like behavior: share parent
                 newParentId = nodeAbove.parentId;
             }
        } else {
             // Top of list -> root
             newParentId = null;
        }

        const updatedMovedNode = { ...activeNode, parentId: newParentId };
        
        // Update list: replace node with updated parent
        const nodeswithUpdatedMoved = newNodes.map(n => n.id === activeId ? updatedMovedNode : n);
        
        // Re-calculate indices for siblings of the TARGET parent
        // Filter siblings in the NEW state (excluding active node first to re-insert)
        const siblings = nodeswithUpdatedMoved.filter(n => n.parentId === newParentId && n.id !== activeId);
        
        // Find insert position
        let insertIndex = 0;
        if (nodeAbove) {
            if (nodeAbove.id === newParentId) {
                // First child
                insertIndex = 0;
            } else {
                // After nodeAbove (which must be a sibling)
                const siblingIndex = siblings.findIndex(s => s.id === nodeAbove.id);
                insertIndex = siblingIndex !== -1 ? siblingIndex + 1 : 0;
            }
        }
        
        siblings.splice(insertIndex, 0, updatedMovedNode);
        siblings.forEach((n, idx) => n.index = idx);
        
        const finalNodes = [...nodeswithUpdatedMoved.filter(n => n.parentId !== newParentId), ...siblings];

        // Also update old siblings if parent changed
        if (activeNode.parentId !== newParentId) {
             const oldSiblings = finalNodes.filter(n => n.parentId === activeNode.parentId).sort((a,b) => a.index - b.index);
             oldSiblings.forEach((n, idx) => n.index = idx);
        }

        reorderNodes(finalNodes);
    };
    
    if (viewMode === 'front') {
        return (
            <div className="h-full flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                    <span className="text-sm font-bold text-gray-300">Front Matter</span>
                    <button onClick={() => setViewMode('manuscript')} className="text-xs uppercase font-bold text-accent hover:text-accent/80">Done</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {frontMatter.map(section => (
                        <MatterItem 
                            key={section.id} 
                            section={section} 
                            isActive={activeMatterId === section.id}
                            onSelect={() => setActiveMatter(section.id)}
                            onToggle={() => toggleMatterSection(section.id, true)} 
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (viewMode === 'back') {
        return (
            <div className="h-full flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-center justify-between p-3 border-b border-white/5">
                    <span className="text-sm font-bold text-gray-300">Back Matter</span>
                    <button onClick={() => setViewMode('manuscript')} className="text-xs uppercase font-bold text-accent hover:text-accent/80">Done</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                     {backMatter.map(section => (
                        <MatterItem 
                            key={section.id} 
                            section={section} 
                            isActive={activeMatterId === section.id}
                            onSelect={() => setActiveMatter(section.id)}
                            onToggle={() => toggleMatterSection(section.id, false)} 
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-200 h-full flex flex-col">
             <div className="flex items-center justify-between px-2 pb-2 shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Manuscript</span>
                <div className="flex gap-1">
                    <button onClick={() => addPart()} title="New Folder" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"><Folder size={14} /></button>
                    <button onClick={() => addChapter(null)} title="New Chapter" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
                </div>
            </div>
            
            <button 
                onClick={() => setViewMode('front')}
                className="mx-2 p-2 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all text-xs font-medium flex items-center gap-2"
            >
                <BookOpen size={12} />
                <span>Front Matter</span>
            </button>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={pointerWithin} // Use pointerWithin to prevent aggressive snapping
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0.5 pb-10">
                            {visibleNodes.map((node) => (
                                <DraggableItem 
                                    key={node.id} 
                                    node={node} 
                                    depth={node.parentId ? 1 : 0}
                                    isActive={activeNodeId === node.id}
                                    onToggle={() => togglePartCollapsed(node.id)}
                                    onDelete={() => deleteNode(node.id)}
                                    onSelect={() => setActiveNode(node.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                    <DragOverlay>
                        {activeDragId ? (
                            <div className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-xl opacity-90 cursor-grabbing flex items-center gap-2">
                                <FileText size={14} className="text-gray-400" />
                                <span className="text-xs font-medium text-white">Moving...</span>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
            
            <button 
                onClick={() => setViewMode('back')}
                className="mt-2 mx-2 mb-4 p-2 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all text-xs font-medium flex items-center gap-2"
            >
                <User size={12} />
                <span>Back Matter</span>
            </button>
        </div>
    );
}

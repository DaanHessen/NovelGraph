import { useManuscriptStore, ManuscriptNode } from '../_store/useManuscriptStore';
import { FileText, Folder, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

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

    // Local state for renaming in sidebar (optional, can also rename in main view)
    // Keeping it simple: sidebar is for navigation/structure. Renaming happens in details.
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            onClick={onSelect}
            className={clsx(
                "group relative flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer border select-none mb-0.5",
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

export default function WriteSidebarContent() {
    const { nodes, addChapter, addPart, togglePartCollapsed, activeNodeId, deleteNode, reorderNodes, setActiveNode } = useManuscriptStore();
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

    // Flatten logic remains similar but we need to ensure correct order
    const getVisibleNodes = () => {
        const visible: ManuscriptNode[] = [];
        // Sort roots
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
        if (activeId === overId) return;

        const activeNode = nodes.find(n => n.id === activeId);
        const overNode = nodes.find(n => n.id === overId);
        if (!activeNode || !overNode) return;

        // Clone nodes to mutate
        const newNodes = [...nodes];
        
        // Strategy:
        // If we drop ON a folder (and not just reordering near it), we might want to nest.
        // But Sortable list makes "over" usually the item we swap with.
        
        // Standard sortable reorder first
        const oldIndex = visibleNodes.findIndex(n => n.id === activeId);
        const newIndex = visibleNodes.findIndex(n => n.id === overId);
        
        // Calculate the new order in the visible list
        const newVisible = arrayMove(visibleNodes, oldIndex, newIndex);
        
        // Now verify logic based on where it landed
        const movedNodeIndex = newVisible.findIndex(n => n.id === activeId);
        const nodeAbove = newVisible[movedNodeIndex - 1];
        
        let newParentId: string | null = null;
        
        // Logic: Inherit parent from the node above, OR if node above is an open folder, go inside.
        if (nodeAbove) {
             if (nodeAbove.type === 'part' && !nodeAbove.collapsed) {
                 // Above is open folder -> go inside as first child (effectively)
                 newParentId = nodeAbove.id;
             } else {
                 // Otherwise active node shares parent with the one above
                 newParentId = nodeAbove.parentId;
             }
        } else {
            // No node above -> top of list?
            // If inside a folder, the folder itself might not be "above" in the visible list if we just moved to index 0 of the folder's children?
            // Actually getVisibleNodes includes the folder then children.
            // So if nodeAbove is undefined, we are at the very top of root.
             newParentId = null;
        }

        // Special Case: Dragging into a closed folder?
        // dnd-kit sortable doesn't easily support "hover to drop inside" vs "hover to reorder".
        // We stick to the visual list order.
        
        // Update the moved node
        const updatedMovedNode = { ...activeNode, parentId: newParentId };
        
        const nodeswithUpdatedMoved = newNodes.map(n => n.id === activeId ? updatedMovedNode : n);
        
        // Find siblings
        const siblings = nodeswithUpdatedMoved.filter(n => n.parentId === newParentId && n.id !== activeId);
        
        // Insert at correct position among siblings
        // We know `nodeAbove` (if it exists) should be immediately before us in siblings array?
        // Not necessarily, `nodeAbove` in visible list might be the parent itself.
        
        let insertIndex = 0;
        if (nodeAbove) {
            if (nodeAbove.id === newParentId) {
                // We are first child
                insertIndex = 0;
            } else {
                // We are after `nodeAbove` (which should be a sibling)
                const siblingIndex = siblings.findIndex(s => s.id === nodeAbove.id);
                if (siblingIndex !== -1) insertIndex = siblingIndex + 1;
                else insertIndex = 0; // Fallback
            }
        }
        
        siblings.splice(insertIndex, 0, updatedMovedNode);
        
        // Update indices
        siblings.forEach((n, idx) => n.index = idx);
        
        // Reconstruct full list
        const finalNodes = [...nodeswithUpdatedMoved.filter(n => n.parentId !== newParentId), ...siblings];

        // Also update old siblings to close gaps
        if (activeNode.parentId !== newParentId) {
             const oldSiblings = finalNodes.filter(n => n.parentId === activeNode.parentId).sort((a,b) => a.index - b.index);
             oldSiblings.forEach((n, idx) => n.index = idx);
        }

        reorderNodes(finalNodes);
    };
    
    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-300 h-full flex flex-col">
             <div className="flex items-center justify-between px-2 pb-2 shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Manuscript</span>
                <div className="flex gap-1">
                    <button onClick={() => addPart()} title="New Folder" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"><Folder size={14} /></button>
                    <button onClick={() => addChapter(null)} title="New Chapter" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"><Plus size={14} /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
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
        </div>
    );
}

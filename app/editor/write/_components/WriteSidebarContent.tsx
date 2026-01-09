import { useManuscriptStore, ManuscriptNode, MatterSection } from '../_store/useManuscriptStore';
import { useAuthorProfile } from '../../_hooks/useAuthorProfile';
import { FileText, Folder, FolderOpen, Plus, Trash2, ChevronRight, ChevronDown, BookOpen, User, AlignLeft, Scale } from 'lucide-react';
import { useState } from 'react';
import { DndContext, DragOverlay, pointerWithin, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import clsx from 'clsx';


// ... (DraggableItem component can stay mostly the same but maybe extracted or kept inline if short)
// I will keep it inline for now to avoid multiple file edits if not needed.

// Drop state for static indicators
type DropPosition = 'top' | 'bottom' | 'inside';
type DropState = { nodeId: string; position: DropPosition } | null;

function DraggableItem({ node, depth = 0, onToggle, isActive, onDelete, onSelect, dropState }: { 
    node: ManuscriptNode, 
    depth?: number, 
    onToggle?: () => void, 
    isActive?: boolean, 
    onDelete?: () => void,
    onSelect?: () => void,
    dropState?: DropState
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transition,
        isDragging
    } = useSortable({ 
        id: node.id, 
        data: { node },
        animateLayoutChanges: () => false // Disable auto-layout animations
    });

    // CRITICAL FIX: We IGNORE the 'transform' for the position of the list item.
    // This ensures the list stays STATIC and doesn't "jump away".
    // We only use 'transform' for the *opacity* or other visual effects if needed, 
    // but here we just keep it static. The DragOverlay handles the "moving" part.
    const style = {
        transition,
        marginLeft: `${depth * 12}px`,
        opacity: isDragging ? 0.3 : 1,
        // No transform applied here!
    };

    const isPart = node.type === 'part';
    const Icon = isPart ? (node.collapsed ? Folder : FolderOpen) : FileText;

    // Visual indicators
    const isTarget = dropState?.nodeId === node.id;
    const isTop = isTarget && dropState?.position === 'top';
    const isBottom = isTarget && dropState?.position === 'bottom';
    const isInside = isTarget && dropState?.position === 'inside';
    
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
                isInside && "bg-accent/20 border-accent", // Highlight folder when hovering inside
                isDragging && "opacity-30" // Simple dimming
            )}
        >
            {/* Top Drop Indicator Line */ }
            {isTop && (
                <div className="absolute -top-px left-0 right-0 h-[2px] bg-accent shadow-[0_0_8px_var(--accent)] z-50 pointer-events-none" />
            )}

            {/* Bottom Drop Indicator Line */ }
            {isBottom && (
                <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-accent shadow-[0_0_8px_var(--accent)] z-50 pointer-events-none" />
            )}
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
    const { username } = useAuthorProfile();
    const Icon = section.type === 'copyright' ? Scale : section.type === 'about_author' ? User : AlignLeft;
    const displayTitle = section.title.replace('{author}', username || 'Author');
    
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
                <span className={clsx("text-xs font-medium transition-colors", isActive ? "text-white" : "group-hover:text-white")}>{displayTitle}</span>
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
    const [dropState, setDropState] = useState<DropState>(null);

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

    // Flatten logic remains similar but we need to ensure consistent order
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
        setDropState(null);
    };

    const handleDragMove = (event: DragMoveEvent) => {
        const { active, over } = event;
        
        if (!over) {
            setDropState(null);
            return;
        }

        const overId = over.id as string;
        const overNode = nodes.find(n => n.id === overId);
        
        if (!overNode) return;
        if (active.id === overId) {
             setDropState(null);
             return;
        }

        const activeRect = active.rect.current.translated;
        const overRect = over.rect;

        if (!activeRect || !overRect) return;

        const cursorY = activeRect.top + (activeRect.height / 2);
        const targetY = overRect.top + (overRect.height / 2);
        const targetHeight = overRect.height;
        
        const dist = cursorY - targetY;
        const isFolder = overNode.type === 'part';
        const THRESHOLD = targetHeight * 0.25; 
        
        if (isFolder && dist > -THRESHOLD && dist < THRESHOLD) {
            setDropState({ nodeId: overId, position: 'inside' });
        } else if (dist < 0) {
            setDropState({ nodeId: overId, position: 'top' });
        } else {
            setDropState({ nodeId: overId, position: 'bottom' });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active } = event;
        setActiveDragId(null);
        
        if (!dropState) return;
        
        const { nodeId: targetId, position } = dropState;
        const activeId = active.id as string;

        setDropState(null);

        if (activeId === targetId) return;
        
        const activeNode = nodes.find(n => n.id === activeId);
        const targetNode = nodes.find(n => n.id === targetId);
        
        if (!activeNode || !targetNode) return;

        let newParentId: string | null = activeNode.parentId;
        const nodesWithoutActive = nodes.filter(n => n.id !== activeId);
        
        if (position === 'inside') {
            newParentId = targetId;
            const siblings = nodesWithoutActive.filter(n => n.parentId === newParentId).sort((a,b) => a.index - b.index);
            siblings.push({ ...activeNode, parentId: newParentId });
            siblings.forEach((n, idx) => n.index = idx);
            
            const nonSiblings = nodesWithoutActive.filter(n => n.parentId !== newParentId);
            reorderNodes([...nonSiblings, ...siblings]);
            
        } else {
            newParentId = targetNode.parentId;
            const siblings = nodesWithoutActive.filter(n => n.parentId === newParentId).sort((a,b) => a.index - b.index);
            const targetIndex = siblings.findIndex(n => n.id === targetId);
            
            let insertAt = -1;
            if (position === 'top') {
                insertAt = targetIndex; 
            } else {
                insertAt = targetIndex + 1;
            }
            
            if (insertAt === -1) insertAt = siblings.length;
            
            const updatedActive = { ...activeNode, parentId: newParentId };
            siblings.splice(insertAt, 0, updatedActive);
            siblings.forEach((n, idx) => n.index = idx);
            
            const nonSiblings = nodesWithoutActive.filter(n => n.parentId !== newParentId);
            
            if (activeNode.parentId !== newParentId) {
                const oldParentSiblings = nonSiblings.filter(n => n.parentId === activeNode.parentId).sort((a,b) => a.index - b.index);
                oldParentSiblings.forEach((n, idx) => n.index = idx);
                
                const pureOthers = nonSiblings.filter(n => n.parentId !== activeNode.parentId);
                reorderNodes([...pureOthers, ...oldParentSiblings, ...siblings]);
            } else {
                reorderNodes([...nonSiblings, ...siblings]);
            }
        }
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
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={items} strategy={verticalListSortingStrategy}>
                        <div className="space-y-0.5 pb-10">
                            {visibleNodes.map((node) => {
                                // Calculate visualization depth during drag
                                const depth = node.parentId ? 1 : 0;
                                if (node.id === activeDragId) {
                                  // Can customize visual depth here if we want to reflect drag offset
                                }
                                
                                return (
                                    <DraggableItem 
                                        key={node.id} 
                                        node={node} 
                                        depth={depth}
                                        isActive={activeNodeId === node.id}
                                        onToggle={() => togglePartCollapsed(node.id)}
                                        onDelete={() => deleteNode(node.id)}
                                        onSelect={() => setActiveNode(node.id)}
                                        dropState={dropState}
                                    />
                                );
                            })}
                        </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                        {activeDragId ? (
                            <div className="p-2 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-xl opacity-90 cursor-grabbing flex items-center gap-2">
                                <FileText size={14} className="text-gray-400" />
                                <span className="text-xs font-medium text-white">
                                    {nodes.find(n => n.id === activeDragId)?.title}
                                </span>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>

                <div className="pt-2 pb-8">
                     <div className="my-2 h-px bg-white/5" />
                     <button 
                        onClick={() => setViewMode('back')}
                        className="w-full p-2 rounded-lg border border-dashed border-white/10 text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all text-xs font-medium flex items-center gap-2"
                    >
                        <User size={12} />
                        <span>Back Matter</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

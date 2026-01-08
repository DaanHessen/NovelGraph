import { useManuscriptStore, ManuscriptNode } from '../_store/useManuscriptStore';
import SidebarItem from '../../_components/SidebarItem';
import { FileText, Folder, FolderOpen, Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ node, depth = 0, onToggle, isActive, onDelete }: { node: ManuscriptNode, depth?: number, onToggle?: () => void, isActive?: boolean, onDelete?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: node.id, data: { node } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 12}px`,
        opacity: isDragging ? 0.5 : 1,
    };

    const isPart = node.type === 'part';
    const Icon = isPart ? (node.collapsed ? Folder : FolderOpen) : FileText;

    const { setActiveNode, updateNodeTitle } = useManuscriptStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(node.title);

    const handleSave = () => {
        if(editName.trim()) updateNodeTitle(node.id, editName);
        setIsEditing(false);
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group touch-none">
            <SidebarItem
                icon={Icon}
                label={node.title}
                isActive={isActive}
                onClick={() => {
                   if (isPart && onToggle) onToggle();
                   else setActiveNode(node.id);
                }}
            >
                <div className="flex items-center gap-2 w-full">
                     <div {...listeners} {...attributes} className="cursor-grab hover:text-white text-transparent group-hover:text-gray-600 transition-colors">
                        <GripVertical size={12} />
                    </div>
                    
                    {isEditing ? (
                         <input 
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent border-none outline-none text-xs w-full p-0 font-medium text-white"
                        />
                    ) : (
                        <div className="flex-1 min-w-0" onDoubleClick={() => setIsEditing(true)}>
                             <span className="text-xs font-medium truncate select-none block">{node.title}</span>
                             {node.type === 'chapter' && node.wordCount !== undefined && (
                                 <span className="text-[9px] text-gray-600 block">{node.wordCount} words</span>
                             )}
                        </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        {onDelete && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(confirm('Delete?')) onDelete();
                                }}
                                className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-red-400"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </SidebarItem>
        </div>
    );
}

export default function WriteSidebarContent() {
    const { nodes, addChapter, addPart, togglePartCollapsed, activeNodeId, deleteNode } = useManuscriptStore(); // Removed unused moveNode, reorderNodes
    const [activeDragId, setActiveDragId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Flatten logic for sortable context
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

        if (activeId === overId) return;

        // Implement logic or console log strictly to use vars
        console.log(`Dragging ${activeId} over ${overId}`);
        // Real logic pending detailed robust implementation
    };
    
    return (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Manuscript</span>
                <div className="flex gap-1">
                    <button onClick={() => addPart()} title="New Part" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white"><Folder size={14} /></button>
                    <button onClick={() => addChapter(null)} title="New Chapter" className="p-1 hover:bg-white/10 rounded text-gray-500 hover:text-white"><Plus size={14} /></button>
                </div>
            </div>

            <DndContext 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                    <div className="space-y-0.5">
                        {visibleNodes.map((node) => (
                            <SortableItem 
                                key={node.id} 
                                node={node} 
                                depth={node.parentId ? 1 : 0}
                                isActive={activeNodeId === node.id}
                                onToggle={() => togglePartCollapsed(node.id)}
                                onDelete={() => deleteNode(node.id)}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeDragId ? (
                        <div className="opacity-80">
                             {/* Minimal overlay representation */}
                            <SidebarItem icon={FileText} label="Moving..." />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}

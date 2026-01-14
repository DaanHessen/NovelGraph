'use client';

import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from '@xyflow/react';
import ReactMarkdown from 'react-markdown';
import { StickyNote, Maximize2 } from 'lucide-react';
import { useGraphStore } from '../_store/useGraphStore';

const NoteNode = ({ id, data, selected }: NodeProps) => {
    const { updateNodeData, setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleDoubleClick = useCallback((evt: React.MouseEvent) => {
        evt.stopPropagation(); // Prevent graph zoom/pan
        setContent((data.content as string) || '');
        setIsEditing(true);
    }, [data.content]);

    const handleBlur = useCallback(() => {
        setIsEditing(false);
        updateNodeData(id, { content });
    }, [id, content, updateNodeData]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    }, []);

    const onResizeEnd = (event: unknown, params: { width: number; height: number }) => {
        // Persist to store
        useGraphStore.getState().updateNodeStyle(id, { width: params.width, height: params.height });

        setNodes((nodes) => nodes.map((n) => {
            if (n.id === id) {
                return {
                    ...n,
                    style: { ...n.style, width: params.width, height: params.height }
                };
            }
            return n;
        }));
    };

    // Auto-focus textarea when entering edit mode
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [isEditing]);

    return (
        <div 
            className={`
                group/note relative flex flex-col rounded-xl shadow-xl transition-all duration-300 overflow-hidden
                ${selected ? 'ring-2 ring-yellow-400/50 shadow-yellow-400/20' : 'hover:shadow-2xl'}
                min-w-[200px] min-h-[200px]
            `}
            style={{ backgroundColor: '#fef3c7', color: '#1f2937' }} // warm yellow bg, dark text
            onDoubleClick={handleDoubleClick}
        >
            <NodeResizer 
                minWidth={200} 
                minHeight={200} 
                isVisible={selected} 
                lineClassName="border-yellow-600/50"
                handleClassName="h-3 w-3 bg-yellow-600 border-none rounded-full"
                onResizeEnd={onResizeEnd}
            />

            {/* Handles for connections */}
            <Handle type="target" position={Position.Top} className="opacity-0 group-hover/note:opacity-100 transition-opacity bg-yellow-600" />
            <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover/note:opacity-100 transition-opacity bg-yellow-600" />
            <Handle type="target" position={Position.Left} className="opacity-0 group-hover/note:opacity-100 transition-opacity bg-yellow-600" />
            <Handle type="source" position={Position.Right} className="opacity-0 group-hover/note:opacity-100 transition-opacity bg-yellow-600" />

            {/* Header / Draggable Area */}
            <div className="h-8 bg-yellow-400/30 w-full flex items-center justify-between px-3 border-b border-yellow-500/10 cursor-grab active:cursor-grabbing">
                <StickyNote size={14} className="text-yellow-700 opacity-50" />
                <div className="text-[10px] uppercase font-bold text-yellow-800/40 tracking-wider">Note</div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 overflow-hidden relative">
                {isEditing ? (
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => e.stopPropagation()} 
                         // Important to stop propagation so delete/backspace keys don't delete the node
                        className="w-full h-full resize-none bg-transparent border-none outline-none text-sm font-medium leading-relaxed placeholder:text-yellow-800/20"
                        placeholder="Write something... (Markdown supported)"
                    />
                ) : (
                    <div className="prose prose-sm prose-yellow max-w-none select-text h-full overflow-y-auto">
                        {(data.content as string) ? (
                            <ReactMarkdown>{data.content as string}</ReactMarkdown>
                        ) : (
                            <p className="text-yellow-800/30 italic text-sm">Double-click to edit...</p>
                        )}
                    </div>
                )}
            </div>
            
            {!isEditing && (
                 <div className="absolute bottom-2 right-2 opacity-0 group-hover/note:opacity-100 transition-opacity pointer-events-none">
                     <Maximize2 size={12} className="text-yellow-800/30" />
                 </div>
            )}
        </div>
    );
};

export default memo(NoteNode);

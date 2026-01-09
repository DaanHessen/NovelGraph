'use client';

import { X, Type, FileText, User, MapPin, AlignLeft } from 'lucide-react';
import { useState } from 'react';
import { useGraphStore } from '../_store/useGraphStore';
import { Node } from '@xyflow/react';

export default function NodeDetailsPanel() {
    const { pages, activePageId, selectedNodeId, updateNodeData, setSelectedNode } = useGraphStore();
    
    const activePage = pages.find(p => p.id === activePageId);
    const node: Node | undefined = activePage?.nodes.find(n => n.id === selectedNodeId);

    const [label, setLabel] = useState(node?.data.label as string || '');
    const [description, setDescription] = useState(node?.data.description as string || '');
    const [type, setType] = useState(node?.data.type as string || 'chapter');


    const handleSave = (key: string, value: unknown) => {
        if (!node) return;
        updateNodeData(node.id, { ...node.data, [key]: value });
    };

    if (!selectedNodeId || !node) return null;

    return (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pointer-events-none mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Details</span>
                <button 
                    onClick={() => setSelectedNode(null)}
                    className="pointer-events-auto p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    title="Back to List"
                >
                    <X size={14} />
                </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                
                <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-600 uppercase flex items-center gap-2">
                        <Type size={12} /> Node Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {['chapter', 'character', 'location', 'family'].map((t) => (
                            <button
                                key={t}
                                onClick={() => {
                                    setType(t);
                                    handleSave('type', t);
                                }}
                                className={`
                                    flex items-center gap-2 p-2 rounded-lg border transition-all text-[10px] font-medium uppercase
                                    ${type === t 
                                        ? 'bg-accent/20 border-accent text-accent' 
                                        : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}
                                `}
                            >
                                <span className="p-1 rounded bg-black/20">
                                    {t === 'chapter' && <FileText size={10} />}
                                    {t === 'character' && <User size={10} />}
                                    {t === 'family' && <User size={10} />}
                                    {t === 'location' && <MapPin size={10} />}
                                </span>
                                <span className="truncate">{t}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                     <label className="text-[10px] font-semibold text-gray-600 uppercase flex items-center gap-2">
                        <Type size={12} /> Label
                    </label>
                    <input 
                        type="text"
                        value={label}
                        onChange={(e) => {
                            setLabel(e.target.value);
                            handleSave('label', e.target.value);
                        }}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                        placeholder="Node Name..."
                    />
                </div>

                <div className="space-y-2">
                     <label className="text-[10px] font-semibold text-gray-600 uppercase flex items-center gap-2">
                        <AlignLeft size={12} /> Description
                    </label>
                    <textarea 
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            handleSave('description', e.target.value);
                        }}
                        rows={10}
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
                        placeholder="Add details..."
                    />
                </div>

                <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-[9px] text-gray-700 font-mono">
                        <span>ID: {node.id.slice(0,8)}</span>
                        <span>{Math.round(node.position.x)}, {Math.round(node.position.y)}</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

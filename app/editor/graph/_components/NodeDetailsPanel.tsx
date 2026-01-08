'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, FileText, User, MapPin, AlignLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGraphStore } from '../_store/useGraphStore';

export default function NodeDetailsPanel() {
    const { pages, activePageId, selectedNodeId, updateNodeData, setSelectedNode } = useGraphStore();
    
    const activePage = pages.find(p => p.id === activePageId);
    const selectedNode = activePage?.nodes.find(n => n.id === selectedNodeId);

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('chapter');

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label as string || '');
            setDescription(selectedNode.data.description as string || '');
            setType(selectedNode.data.type as string || 'chapter');
        }
    }, [selectedNodeId, selectedNode]);

    const handleSave = (key: string, value: any) => {
        if (!selectedNodeId) return;
        updateNodeData(selectedNodeId, { [key]: value });
    };

    if (!selectedNode) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 320, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-4 right-4 w-80 bg-[#0f1113]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[50]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Details</span>
                    <button 
                        onClick={() => setSelectedNode(null)}
                        className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-6">
                    
                    {/* Visual Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Type size={12} /> Node Type
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['chapter', 'character', 'location', 'family'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => {
                                        setType(t);
                                        handleSave('type', t);
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all text-[10px] font-medium uppercase
                                        ${type === t 
                                            ? 'bg-accent/20 border-accent text-accent shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]' 
                                            : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'}
                                    `}
                                >
                                    {t === 'chapter' && <FileText size={14} />}
                                    {t === 'character' && <User size={14} />}
                                    {t === 'family' && <User size={14} />}
                                    {t === 'location' && <MapPin size={14} />}
                                    <span className="truncate w-full text-center text-[9px]">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <Type size={12} /> Label
                        </label>
                        <input 
                            type="text"
                            value={label}
                            onChange={(e) => {
                                setLabel(e.target.value);
                                handleSave('label', e.target.value);
                            }}
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors"
                            placeholder="Node Name..."
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                         <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                            <AlignLeft size={12} /> Description
                        </label>
                        <textarea 
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                handleSave('description', e.target.value);
                            }}
                            rows={6}
                            className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-accent transition-colors resize-none"
                            placeholder="Add details..."
                        />
                    </div>

                    {/* Meta Info */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] text-gray-600 font-mono">
                            <span>ID: {selectedNode.id.slice(0,8)}...</span>
                            <span>{Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)}</span>
                        </div>
                    </div>

                </div>
            </motion.div>
        </AnimatePresence>
    );
}

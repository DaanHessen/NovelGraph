'use client';

import { memo } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { useGraphStore } from '../_store/useGraphStore';

const GroupNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData, setNodes } = useReactFlow();
  const [label, setLabel] = useState((data.label as string) || 'New Group');

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      setLabel(evt.target.value);
      updateNodeData(id, { label: evt.target.value });
  };

  const onResizeEnd = (event: unknown, params: { width: number; height: number }) => {
      // Direct store update for persistence
      useGraphStore.getState().updateNodeStyle(id, { width: params.width, height: params.height });
      
      // Local flow update for immediate feedback (though setNodes might be redundant if store syncs, keep for safety)
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

  return (
    <div className={`
        group relative rounded-2xl border transition-all duration-300
        ${selected ? 'border-accent/50 bg-accent/5 ring-1 ring-accent/20' : 'border-white/5 bg-[#0a0a0a]/80 hover:border-white/10'}
        backdrop-blur-xl w-full h-full shadow-2xl
    `}>
      <NodeResizer 
        minWidth={200} 
        minHeight={200} 
        isVisible={selected}
        lineClassName="border-accent/50"
        handleClassName="h-2.5 w-2.5 bg-accent border-0 rounded-full shadow-[0_0_10px_rgba(var(--accent-rgb),0.5)]"
        onResizeEnd={onResizeEnd}
      />
      
      <div className="absolute -top-8 left-0 px-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-accent/50" />
          <input
            value={label}
            onChange={handleChange}
            className="bg-transparent text-xs font-bold text-neutral-400 focus:text-white focus:outline-none tracking-[0.2em] transition-colors uppercase placeholder:text-neutral-700"
            placeholder="GROUP NAME"
          />
      </div>
    
    </div>
  );
};

export default memo(GroupNode);

'use client';

import { memo } from 'react';
import { NodeProps, NodeResizer, useReactFlow } from '@xyflow/react';
import { useState } from 'react';

const GroupNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow();
  const [label, setLabel] = useState((data.label as string) || 'New Group');

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      setLabel(evt.target.value);
      updateNodeData(id, { label: evt.target.value });
  };

  return (
    <div className={`
        group relative rounded-lg border-2 border-dashed transition-colors
        ${selected ? 'border-accent bg-accent/5' : 'border-neutral-700 bg-white/5 hover:border-neutral-600'}
        min-w-[100px] min-h-[100px] w-full h-full
    `}>
      <NodeResizer 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected}
        lineClassName="border-accent"
        handleClassName="h-3 w-3 bg-white border-2 border-accent rounded"
      />
      
      <div className="absolute -top-7 left-0">
          <input
            value={label}
            onChange={handleChange}
            className="bg-transparent text-xs font-bold text-neutral-400 focus:text-white focus:outline-none uppercase tracking-wider"
            placeholder="GROUP NAME"
          />
      </div>
    </div>
  );
};

export default memo(GroupNode);

'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo } from 'react';
import { FileText, User, MapPin } from 'lucide-react';
import clsx from 'clsx';

function cn(...inputs: (string | undefined | null | false)[]) {
  return clsx(inputs);
}

const StoryNode = ({ data, selected }: NodeProps) => {
  // Determine icon based on type (default to FileText)
  const type = data.type || 'chapter';
  
  let Icon = FileText;
  let accentColor = 'bg-accent';
  let accentShadow = 'shadow-[0_0_15px_var(--accent)]';
  
  if (type === 'character') {
      Icon = User;
      accentColor = 'bg-pink-500';
      accentShadow = 'shadow-[0_0_15px_rgba(236,72,153,0.5)]';
  } else if (type === 'location') {
      Icon = MapPin;
      accentColor = 'bg-emerald-500';
      accentShadow = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  }

  return (
    <div 
        className={cn(
            "relative min-w-[200px] rounded-2xl bg-[#0f1113]/80 backdrop-blur-xl border transition-all duration-300 group overflow-hidden",
            selected ? "border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]" : "border-white/10 hover:border-white/20 hover:bg-[#0f1113]/90"
        )}
    >
      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-[#0f1113] transition-colors group-hover:!bg-white" />
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gray-400 !border-2 !border-[#0f1113] transition-colors group-hover:!bg-white" />

      {/* Header with Type Indicator */}
      <div className="flex items-center gap-3 p-3 border-b border-white/5 bg-white/5">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg", accentColor, accentShadow)}>
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{type as string}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm font-bold text-white mb-1">{data.label as string}</div>
        <div className="text-xs text-gray-400 line-clamp-2">
            {data.description as string || "No description provided."}
        </div>
      </div>
    </div>
  );
};

export default memo(StoryNode);

'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { memo, useRef, useState } from 'react';
import { FileText, User, MapPin } from 'lucide-react';
// import { cn } from '@/lib/utils'; // Error here, revert to inline
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SmartNode = ({ data, selected }: NodeProps) => {
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
  } else if (type === 'family') {
      Icon = User;
      accentColor = 'bg-blue-500';
      accentShadow = 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
  }

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Relative to node
  const [isHovering, setIsHovering] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!nodeRef.current) return;
      const rect = nodeRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
  };

  return (
    <div 
        ref={nodeRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className={cn(
            "relative min-w-[200px] rounded-2xl bg-[#0f1113]/95 border transition-all duration-300 group overflow-hidden will-change-transform",
            selected ? "border-accent shadow-[0_0_30px_rgba(var(--accent-rgb),0.2)]" : "border-border hover:border-border/50 hover:bg-[#0f1113]"
        )}
    >
      {/* 
        This single Source Handle covers the entire node.
        We make it transparent.
        The `CustomConnectionLine` will draw the line starting from the border visually.
      */}
      <Handle 
        type="source" 
        position={Position.Top} 
        className="w-full h-full absolute inset-0 rounded-2xl z-50 opacity-0 cursor-crosshair"
      />
      
      {/* Target Handle also covers everything to receive connections easily */}
      <Handle 
         type="target" 
         position={Position.Top} 
         className="w-full h-full absolute inset-0 rounded-2xl z-0 opacity-0" 
      />

      {/* Hover Circle Visual */}
       <div 
         className="absolute w-4 h-4 bg-accent/50 rounded-full blur-[2px] pointer-events-none transition-opacity duration-150 z-40"
         style={{
             left: mousePos.x,
             top: mousePos.y,
             transform: 'translate(-50%, -50%)',
             opacity: isHovering ? 1 : 0
         }}
       />
       <div 
         className="absolute w-2 h-2 bg-white rounded-full pointer-events-none transition-opacity duration-150 z-40 mix-blend-overlay"
         style={{
             left: mousePos.x,
             top: mousePos.y,
             transform: 'translate(-50%, -50%)',
             opacity: isHovering ? 1 : 0
         }}
       />

      <div className="flex items-center gap-3 p-3 border-b border-border bg-white/5 relative z-10 pointer-events-none">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg", accentColor, accentShadow)}>
            <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{type as string}</div>
        </div>
      </div>

      <div className="p-4 relative z-10 pointer-events-none">
        <div className="text-sm font-bold text-white mb-1">{data.label as string}</div>
        <div className="text-xs text-gray-400 line-clamp-2">
            {data.description as string || "No description provided."}
        </div>
      </div>
    </div>
  );
};

export default memo(SmartNode);

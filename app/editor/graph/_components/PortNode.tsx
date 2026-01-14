import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { memo } from 'react';
import { FileText, User, MapPin, Link as LinkIcon, Users, Lightbulb, Calendar, StickyNote } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface PortNodeData extends Record<string, unknown> {
    label?: string;
    description?: string;
    type?: string;
    linkedChapterId?: string;
}

const PortNode = ({ data, selected }: NodeProps<Node<PortNodeData>>) => {
  const isChapter = data.type === 'chapter';
  const isCharacter = data.type === 'character';
  const isFamily = data.type === 'family';
  const isTheme = data.type === 'theme';
  const isEvent = data.type === 'event';
  const isNote = data.type === 'note';

  return (
    <div className={cn(
      "group/node relative min-w-[180px] bg-card/90 backdrop-blur-md border rounded-xl shadow-lg transition-all duration-300",
      selected ? "border-accent ring-2 ring-accent/20 shadow-accent/10" : "border-border hover:border-accent/50 hover:shadow-xl"
    )}>
      {/* Handles - Visible on Hover */}
      {/* Handles - Dual Source/Target at every position for flexible connections */}
      {/* TOP */}
      <Handle type="target" position={Position.Top} id="top-t" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />
      <Handle type="source" position={Position.Top} id="top-s" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />

      {/* RIGHT */}
      <Handle type="source" position={Position.Right} id="right-s" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />
      <Handle type="target" position={Position.Right} id="right-t" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />

      {/* BOTTOM */}
      <Handle type="source" position={Position.Bottom} id="bottom-s" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />
      <Handle type="target" position={Position.Bottom} id="bottom-t" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />

      {/* LEFT */}
      <Handle type="target" position={Position.Left} id="left-t" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />
      <Handle type="source" position={Position.Left} id="left-s" className="w-3 h-3 bg-muted-foreground/50 border-2 border-background hover:bg-accent hover:border-accent transition-colors opacity-0! group-hover/node:opacity-100!" />

      {/* Linked Chapter Indicator */}
      {!!data.linkedChapterId && (
          <div className="absolute -top-2 -right-2 bg-accent text-white p-1 rounded-full shadow-lg z-20" title="Linked to Chapter">
              <LinkIcon size={10} />
          </div>
      )}

      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className={cn(
            "p-2 rounded-lg",
            isChapter ? "bg-blue-500/10 text-blue-400" :
            isCharacter ? "bg-pink-500/10 text-pink-400" :
            isFamily ? "bg-purple-500/10 text-purple-400" :
            isTheme ? "bg-amber-500/10 text-amber-400" :
            isEvent ? "bg-orange-500/10 text-orange-400" :
            isNote ? "bg-yellow-200/10 text-yellow-200" :
            "bg-emerald-500/10 text-emerald-400"
          )}>
            {isChapter ? <FileText size={16} /> :
             isCharacter ? <User size={16} /> :
             isFamily ? <Users size={16} /> :
             isTheme ? <Lightbulb size={16} /> :
             isEvent ? <Calendar size={16} /> :
             isNote ? <StickyNote size={16} /> :
             <MapPin size={16} />}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-2">
            {data.label || 'Untitled Node'}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {data.description || 'No description provided'}
          </p>
        </div>
      </div>

    </div>
  );
};

export default memo(PortNode);


import React, { useRef, useEffect } from 'react';

interface ContextMenuProps {
  id: string;
  top: number;
  left: number;
  right?: number;
  bottom?: number;
  onGroup?: () => void;
  onClose: () => void;
}

export default function ContextMenu({ top, left, right, bottom, onGroup, onClose, id }: ContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [onClose]);

  return (
    <div
      ref={ref}
      style={{ top, left, right, bottom }}
      className="absolute z-50 bg-neutral-900 border border-neutral-800 shadow-xl rounded-lg p-1 min-w-[160px] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-100"
    >
      {onGroup && (
          <button
            onClick={onGroup}
            className="text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded transition-colors flex items-center gap-2"
          >
            Group Selection
          </button>
      )}
      <div className="h-px bg-neutral-800 my-0.5" />
      <button className="text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          Duplicate (Coming Soon)
      </button>
       <button className="text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          Delete (Use Backspace)
      </button>
    </div>
  );
}

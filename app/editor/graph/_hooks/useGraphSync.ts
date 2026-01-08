import { useEffect } from 'react';
import { Edge, Node } from '@xyflow/react';
import { GraphSettings } from '../_store/useGraphStore';

/**
 * Hook to synchronize graph settings (like edge type) with existing graph elements.
 * Forces updates when settings change.
 */
export function useGraphSync(
    graphSettings: GraphSettings | null,
    setEdges: (update: (edges: Edge[]) => Edge[]) => void,
    setStoreEdges: (edges: Edge[]) => void
) {
    useEffect(() => {
        if (!graphSettings?.edgeType) return;
        
        setEdges((currentEdges) => {
            if (currentEdges.length === 0) return currentEdges;
            
            const needsUpdate = currentEdges.some(e => e.type !== graphSettings.edgeType);
            if (!needsUpdate) return currentEdges;
   
            // Map to new object references
            const newEdges = currentEdges.map(e => ({ 
                ...e, 
                type: graphSettings.edgeType,
                animated: true
            }));
            
            // Update store IMMEDIATELY to persist
            setTimeout(() => {
                setStoreEdges(newEdges);
            }, 0);
            
            return newEdges;
        });
     }, [graphSettings?.edgeType, setEdges, setStoreEdges]);
}

'use client';

import { useEffect } from 'react';
import { Edge } from '@xyflow/react';
import { GraphSettings } from '../_store/useGraphStore';

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
   
            const newEdges = currentEdges.map(e => ({ 
                ...e, 
                type: graphSettings.edgeType,
                animated: true
            }));
            
            setTimeout(() => {
                setStoreEdges(newEdges);
            }, 0);
            
            return newEdges;
        });
     }, [graphSettings?.edgeType, setEdges, setStoreEdges]);
}

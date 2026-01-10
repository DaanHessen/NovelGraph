import {
  BaseEdge,
  EdgeProps,
  getBezierPath,
  useInternalNode,
} from '@xyflow/react';
import { getEdgeParams } from './utils';

export default function SimpleFloatingEdge({
  source,
  target,
  markerEnd,
  style,
}: EdgeProps) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode,
    targetNode
  );

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    targetX: tx,
    targetY: ty,
  });
  
  // Note: We could support other path types (straight, step) here if needed based on settings
  // But for now, Bezier feels most premium.

  return (
    <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
  );
}

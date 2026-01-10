import { ConnectionLineComponentProps, getBezierPath, Position } from '@xyflow/react';
import { getEdgeParams } from './utils';

export default function CustomConnectionLine({
  fromNode,
  toX,
  toY,
  connectionLineStyle,
}: ConnectionLineComponentProps) {
  if (!fromNode) {
    return null;
  }

  const targetNode = {
    id: 'connection-target',
    measured: { width: 1, height: 1 },
    position: { x: toX, y: toY },
    data: {},
  };

  const { sx, sy } = getEdgeParams(fromNode, targetNode);

  const [edgePath] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: fromNode.position.x < toX ? Position.Right : Position.Left,
    targetX: toX,
    targetY: toY,
    targetPosition: fromNode.position.x < toX ? Position.Left : Position.Right,
  });

  return (
    <g>
      <path
        fill="none"
        strokeWidth={1.5}
        stroke="rgba(255, 255, 255, 0.4)"
        d={edgePath}
        style={connectionLineStyle}
      />
      <circle cx={toX} cy={toY} fill="#fff" r={3} stroke="#222" strokeWidth={1.5} />
    </g>
  );
}

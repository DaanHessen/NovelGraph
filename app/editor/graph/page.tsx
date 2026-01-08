'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import StoryNode from './_components/StoryNode';

const nodeTypes = {
  story: StoryNode,
};

const initialNodes = [
  { 
    id: '1', 
    type: 'story', 
    position: { x: 100, y: 100 }, 
    data: { label: 'Chapter 1: The Call', type: 'chapter', description: 'The protagonist receives a mysterious message.' } 
  },
  { 
    id: '2', 
    type: 'story', 
    position: { x: 400, y: 100 }, 
    data: { label: 'Chapter 2: Departure', type: 'chapter', description: 'Leaving home for the first time.' } 
  },
    { 
    id: '3', 
    type: 'story', 
    position: { x: 250, y: 300 }, 
    data: { label: 'The Antagonist', type: 'character', description: 'A shadowy figure watching from afar.' } 
  },
];

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#a78bfa' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#52525b', strokeDasharray: 5 } },
];

export default function GraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a78bfa' } }, eds)),
    [setEdges],
  );

  return (
    <div className="h-[calc(100vh-4rem)] w-full rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a] shadow-2xl relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-black"
        colorMode="dark"
      >
        <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1} 
            color="#333" 
            className="opacity-50"
        />
        <Controls className="bg-[#0f1113] border border-white/10 fill-white text-white rounded-lg overflow-hidden [&>button]:!border-white/5 [&>button:hover]:!bg-white/10" />
        <MiniMap 
            className="!bg-[#0f1113] !border !border-white/10 rounded-xl overflow-hidden shadow-2xl"
            nodeColor={() => '#333'}
            maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
      
      {/* Floating Toolbar Placeholder */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#0f1113]/80 backdrop-blur-xl border border-white/10 rounded-full flex gap-4 shadow-xl">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pt-1">Story Map</span>
      </div>
    </div>
  );
}

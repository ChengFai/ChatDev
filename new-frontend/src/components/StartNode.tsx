import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StartNodeData {
  opacity?: number;
}

const StartNode = memo(({ data }: NodeProps<StartNodeData>) => {
  return (
    <div className="start-node" style={{ opacity: data?.opacity ?? 1 }}>
      <div className="start-node-bubble" title="Start Node"></div>
      {/* Provide source handle at right */}
      <Handle id="source" type="source" position={Position.Right} className="start-node-handle" />
    </div>
  );
});

StartNode.displayName = 'StartNode';

export default StartNode;

import { memo, useState, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getNodeStyles } from '../utils/colorUtils';
import { spriteFetcher } from '../utils/spriteFetcher';

interface WorkflowNodeData {
  type?: string;
  id?: string;
  description?: string;
  isActive?: boolean;
  sprite?: string;
}

const WorkflowNode = memo(({ id, data }: NodeProps<WorkflowNodeData>) => {
  const [walkingFrame, setWalkingFrame] = useState(2);

  const nodeType = data?.type || 'unknown';
  const nodeId = data?.id || id;
  const nodeDescription = data?.description || '';
  const isActive = data?.isActive || false;
  const sprite = data?.sprite || '';

  const dynamicStyles = useMemo(() => getNodeStyles(nodeType), [nodeType]);

  // Compute the current sprite path based on active state and walking frame
  const currentSprite = useMemo(() => {
    if (!sprite) return '';

    if (isActive) {
      // When active, use walking frames (2 and 3)
      return spriteFetcher.fetchSprite(nodeId, 'D', walkingFrame);
    } else {
      // When not active, use the original frame (1)
      return sprite;
    }
  }, [sprite, isActive, nodeId, walkingFrame]);

  // Start/stop walking animation based on active state
  useEffect(() => {
    if (!isActive) {
      setWalkingFrame(2);
      return;
    }

    const interval = setInterval(() => {
      setWalkingFrame((prev) => (prev === 2 ? 3 : 2));
    }, 500); // Alternate every 500ms

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="workflow-node-container">
      {sprite && (
        <div className="workflow-node-sprite">
          <img src={currentSprite} alt={`${nodeId} sprite`} className="node-sprite-image" />
        </div>
      )}
      <div
        className={`workflow-node ${isActive ? 'workflow-node-active' : ''}`}
        data-type={nodeType}
        style={dynamicStyles as React.CSSProperties}
      >
        <div className="workflow-node-header">
          <span className="workflow-node-type">{nodeType}</span>
          <span className="workflow-node-id">{nodeId}</span>
        </div>
        {nodeDescription && <div className="workflow-node-description">{nodeDescription}</div>}

        <Handle id="source" type="source" position={Position.Right} className="workflow-node-handle" />
        <Handle id="target" type="target" position={Position.Left} className="workflow-node-handle" />
      </div>
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';

export default WorkflowNode;

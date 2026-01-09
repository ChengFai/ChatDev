import { memo } from 'react';
import { EdgeProps, getBezierPath, BaseEdge, EdgeLabelRenderer } from 'reactflow';

interface WorkflowEdgeData {
  label?: string;
  trigger?: boolean;
}

const WorkflowEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  }: EdgeProps<WorkflowEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const edgeStyle = {
      stroke: '#f2f2f2',
      strokeWidth: 1.2,
      ...style,
      ...(data?.trigger === false && {
        stroke: '#868686',
        strokeDasharray: '5, 5',
      }),
    };

    return (
      <>
        <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={edgeStyle} />
        {data?.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
                className: 'edge-label',
              }}
              className="nodrag nopan"
            >
              <div className="edge-label-text">{data.label}</div>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

WorkflowEdge.displayName = 'WorkflowEdge';

export default WorkflowEdge;

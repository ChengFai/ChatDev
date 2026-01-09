import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  NodeMouseHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import yaml from 'js-yaml';
import { fetchWorkflowYAML, updateYaml } from '../utils/apiFunctions';
import { spriteFetcher } from '../utils/spriteFetcher';
import WorkflowNode from '../components/WorkflowNode';
import StartNode from '../components/StartNode';
import WorkflowEdge from '../components/WorkflowEdge';
import FormGenerator from '../components/FormGenerator';

interface WorkflowViewProps {
  workflowName: string;
  onRefreshWorkflows: () => void;
}

export default function WorkflowView({ workflowName, onRefreshWorkflows }: WorkflowViewProps) {
  const [activeTab, setActiveTab] = useState<'yaml' | 'graph'>('graph');
  const [yamlContent, setYamlContent] = useState('');
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Node configuration modal
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [configModalData, setConfigModalData] = useState<any>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);

  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      workflowNode: WorkflowNode,
      startNode: StartNode,
    }),
    []
  );

  // Define custom edge types
  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      workflowEdge: WorkflowEdge,
    }),
    []
  );

  // Load workflow data
  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchWorkflowYAML(workflowName);
        if (result.success && result.yaml) {
          setYamlContent(result.yaml);
          const parsed = yaml.load(result.yaml) as any;
          setWorkflowData(parsed);
          convertToReactFlow(parsed);
        } else {
          setError(result.message || 'Failed to load workflow');
        }
      } catch (err) {
        console.error('Error loading workflow:', err);
        setError('Failed to load workflow');
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [workflowName]);

  // Convert YAML workflow data to ReactFlow format
  const convertToReactFlow = (data: any) => {
    if (!data?.graph) return;

    const graph = data.graph;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Add start node
    newNodes.push({
      id: 'start',
      type: 'startNode',
      position: { x: 50, y: 200 },
      data: {},
    });

    // Add workflow nodes
    if (graph.nodes && Array.isArray(graph.nodes)) {
      graph.nodes.forEach((node: any, index: number) => {
        const sprite = spriteFetcher.fetchSprite(node.id, 'D', 1);
        newNodes.push({
          id: node.id,
          type: 'workflowNode',
          position: { x: 300 + (index % 3) * 250, y: 100 + Math.floor(index / 3) * 200 },
          data: {
            type: node.type || 'unknown',
            id: node.id,
            description: node.description || '',
            sprite,
          },
        });
      });
    }

    // Add edges
    if (graph.edges && Array.isArray(graph.edges)) {
      graph.edges.forEach((edge: any) => {
        newEdges.push({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          type: 'workflowEdge',
          data: {
            label: edge.label,
            trigger: edge.trigger !== false,
          },
        });
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node double-click to open configuration
  const onNodeDoubleClick: NodeMouseHandler = useCallback((event, node) => {
    if (node.type === 'startNode') return; // Don't configure start node

    setSelectedNodeId(node.id);
    setConfigModalData({
      title: `Configure Node: ${node.id}`,
      breadcrumbs: ['nodes', node.data.type || 'agent'],
      formData: node.data || {},
      showAdvanced: false,
      onSubmit: (data: any) => {
        // Update node data
        setNodes((nds) =>
          nds.map((n) =>
            n.id === node.id
              ? {
                  ...n,
                  data: { ...n.data, ...data },
                }
              : n
          )
        );
        setConfigModalOpen(false);
        // Sync to YAML
        syncGraphToYAML();
      },
      onCancel: () => {
        setConfigModalOpen(false);
      },
    });
    setConfigModalOpen(true);
  }, [setNodes]);

  // Handle right-click context menu
  const onNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
    });
  }, []);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Sync graph changes to YAML
  const syncGraphToYAML = useCallback(() => {
    if (!workflowData) return;

    const updatedData = { ...workflowData };
    if (!updatedData.graph) updatedData.graph = {};

    // Update nodes in YAML
    updatedData.graph.nodes = nodes
      .filter((node) => node.type !== 'startNode')
      .map((node) => ({
        id: node.id,
        type: node.data.type || 'agent',
        description: node.data.description || '',
        ...node.data,
      }));

    // Update edges in YAML
    updatedData.graph.edges = edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      label: edge.data?.label,
      trigger: edge.data?.trigger !== false,
    }));

    const newYaml = yaml.dump(updatedData, {
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });

    setYamlContent(newYaml);
    setWorkflowData(updatedData);
  }, [nodes, edges, workflowData]);

  // Sync when nodes or edges change
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const timeoutId = setTimeout(() => {
        syncGraphToYAML();
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [nodes, edges, syncGraphToYAML]);

  const handleSave = async () => {
    if (!workflowName || !yamlContent) return;

    try {
      const result = await updateYaml(workflowName, yamlContent);
      if (result.success) {
        alert('Workflow saved successfully!');
        onRefreshWorkflows();
      } else {
        alert(`Failed to save: ${result.message}`);
      }
    } catch (err) {
      console.error('Error saving workflow:', err);
      alert('Failed to save workflow');
    }
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setContextMenu(null);
  };

  if (loading) {
    return (
      <div className="workflow-view">
        <div className="workflow-loading">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow-view">
        <div className="workflow-error">Error: {error}</div>
      </div>
    );
  }

  if (!workflowName) {
    return (
      <div className="workflow-view">
        <div className="workflow-empty">Select a workflow from the list</div>
      </div>
    );
  }

  return (
    <div className="workflow-view">
      <div className="workflow-header">
        <h2 className="workflow-title">{workflowName}</h2>
        <div className="workflow-actions">
          <button className="workflow-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      <div className="workflow-tabs">
        <button
          className={`tab-button ${activeTab === 'yaml' ? 'active' : ''}`}
          onClick={() => setActiveTab('yaml')}
        >
          YAML Editor
        </button>
        <button
          className={`tab-button ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          Graph Editor
        </button>
      </div>

      <div className="workflow-content">
        {activeTab === 'yaml' ? (
          <div className="yaml-editor">
            <textarea
              className="yaml-textarea"
              value={yamlContent}
              onChange={(e) => setYamlContent(e.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="graph-editor">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDoubleClick={onNodeDoubleClick}
              onNodeContextMenu={onNodeContextMenu}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>

            {/* Context Menu */}
            {contextMenu && (
              <div
                className="context-menu"
                style={{
                  position: 'fixed',
                  top: contextMenu.y,
                  left: contextMenu.x,
                  zIndex: 1000,
                }}
              >
                <div className="context-menu-item" onClick={() => {
                  const node = nodes.find((n) => n.id === contextMenu.nodeId);
                  if (node) {
                    onNodeDoubleClick({} as any, node);
                  }
                  setContextMenu(null);
                }}>
                  Configure Node
                </div>
                <div className="context-menu-item" onClick={() => handleDeleteNode(contextMenu.nodeId)}>
                  Delete Node
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Generator Modal */}
      <FormGenerator
        isOpen={configModalOpen}
        config={configModalData}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
}

import { useEffect, useState } from 'react'
import { fetchWorkflowsWithDesc } from '@/utils/apiFunctions'

interface Workflow {
  name: string
  description: string
}

interface WorkflowListProps {
  selected?: string
  onSelect: (name: string) => void
}

export default function WorkflowList({ selected, onSelect }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    setLoading(true)
    const result = await fetchWorkflowsWithDesc()
    if (result.success && result.workflows) {
      setWorkflows(result.workflows)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="workflow-list-loading">Loading workflows...</div>
  }

  return (
    <div className="workflow-list">
      <div className="workflow-list-header">
        <h2>Workflows</h2>
      </div>
      <div className="workflow-list-items">
        {workflows.map((workflow) => (
          <div
            key={workflow.name}
            className={`workflow-item ${selected === workflow.name.replace('.yaml', '') ? 'active' : ''}`}
            onClick={() => onSelect(workflow.name)}
          >
            <div className="workflow-item-name">{workflow.name}</div>
            <div className="workflow-item-description">{workflow.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

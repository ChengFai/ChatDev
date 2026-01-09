import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import WorkflowList from './WorkflowList'
import WorkflowView from './WorkflowView'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function WorkflowWorkbench() {
  const { name } = useParams<{ name?: string }>()
  const navigate = useNavigate()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | undefined>(
    name?.replace('.yaml', '')
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const normalizedName = name?.replace('.yaml', '')
    setSelectedWorkflow(normalizedName)
  }, [name])

  const handleSelect = (workflowName: string) => {
    const normalizedName = workflowName.replace('.yaml', '')
    setSelectedWorkflow(normalizedName)
    navigate(`/workflows/${normalizedName}`)
  }

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="workflow-workbench">
      <div className={`workflow-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <WorkflowList
          selected={selectedWorkflow}
          onSelect={handleSelect}
        />
      </div>
      <Button
        className={`sidebar-toggle-btn ${isSidebarOpen ? 'sidebar-open' : ''}`}
        onClick={handleToggleSidebar}
        variant="ghost"
        size="icon"
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>
      <div className={`workflow-viewer ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {selectedWorkflow ? (
          <WorkflowView
            workflowName={selectedWorkflow}
            onRefreshWorkflows={() => {}}
          />
        ) : (
          <div className="placeholder">
            <div className="placeholder-title">Select a workflow</div>
            <div className="placeholder-subtitle">
              Choose a workflow from the list to view or edit.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

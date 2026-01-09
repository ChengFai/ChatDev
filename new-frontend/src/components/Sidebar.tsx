import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Settings } from 'lucide-react'
import SettingsModal from './SettingsModal'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const location = useLocation()
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const isWorkflowsActive = location.pathname.startsWith('/workflows')

  return (
    <>
      <div className="sidebar">
        <nav className="sidebar-nav">
          <Link to="/">Home</Link>
          <Link to="/tutorial">Tutorial</Link>
          <Link
            to="/workflows"
            className={cn({ active: isWorkflowsActive })}
          >
            Workflows
          </Link>
          <Link to="/launch" target="_blank" rel="noopener">Launch</Link>
        </nav>
        <div className="sidebar-actions">
          <button
            className="settings-nav-btn"
            onClick={() => setShowSettingsModal(true)}
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
      <SettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  )
}

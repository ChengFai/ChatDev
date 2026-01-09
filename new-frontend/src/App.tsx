import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import HomeView from './pages/HomeView'
import TutorialView from './pages/TutorialView'
import LaunchView from './pages/LaunchView'
import WorkflowWorkbench from './pages/WorkflowWorkbench'

function App() {
  const location = useLocation()
  const showSidebar = location.pathname !== '/launch'

  return (
    <div className="app-container">
      {showSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/tutorial" element={<TutorialView />} />
          <Route path="/launch" element={<LaunchView />} />
          <Route path="/workflows/:name?" element={<WorkflowWorkbench />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function HomeView() {
  const navigate = useNavigate()

  const cubeColors = ['#aaffcd', '#99eaf9', '#a0c4ff']
  const cubes = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${Math.random() * 10 + 4}px`,
    color: cubeColors[Math.floor(Math.random() * cubeColors.length)],
    duration: `${Math.random() * 30 + 40}s`,
    delay: `-${Math.random() * 60}s`,
    blur: `${Math.random() * 2 + 1}px`,
    opacity: Math.random() * 0.4 + 0.2,
    rotate: `${Math.random() * 360}deg`,
    scale: Math.random() * 1 + 0.7,
  }))

  return (
    <div className="home-view">
      <div className="cubes-background">
        {cubes.map((cube) => (
          <div
            key={cube.id}
            className="cube"
            style={{
              left: cube.left,
              top: cube.top,
              width: cube.size,
              height: cube.size,
              backgroundColor: cube.color,
              boxShadow: `0 0 12px 2px ${cube.color}, 0 0 24px 4px ${cube.color}99`,
              animationDuration: cube.duration,
              animationDelay: cube.delay,
              filter: `blur(${cube.blur})`,
              opacity: cube.opacity,
              '--rotate': cube.rotate,
              '--scale': cube.scale,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="content-wrapper">
        <h1 className="title">
          <span className="title-line">ChatDev 2.0</span>
          <span className="title-line title-highlight">DevAll</span>
        </h1>

        <p className="introduction">
          ChatDev 2.0 - DevAll is a zero-code multi-agent platform for developing
          everything, with a workspace built for designing, visualizing, and running
          agent workflows.
        </p>

        <div className="actions">
          <Button
            className="get-started-btn"
            onClick={() => navigate('/tutorial')}
            size="lg"
          >
            Get Started →
          </Button>
        </div>
      </div>
    </div>
  )
}

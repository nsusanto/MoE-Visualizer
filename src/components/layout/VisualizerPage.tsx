import { Link } from 'react-router-dom'
import { useMoeStore } from '../../store/moeStore'
import ExpertNetwork from '../visualizers/ExpertNetwork'
import AnimationPanel from '../visualizers/AnimationPanel'
import StatusLegend from '../common/StatusLegend'
import styles from './VisualizerPage.module.css'

function VisualizerPage() {
  // Get values and setters from the store
  const numExperts = useMoeStore(state => state.numExperts)
  const topK = useMoeStore(state => state.topK)
  const animationSpeed = useMoeStore(state => state.animationSpeed)
  const setNumExperts = useMoeStore(state => state.setNumExperts)
  const setTopK = useMoeStore(state => state.setTopK)
  const setAnimationSpeed = useMoeStore(state => state.setAnimationSpeed)
  const resetConfig = useMoeStore(state => state.resetConfig)

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>MoE Visualizer</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">Home</Link>
            <a href="#controls">Controls</a>
            <a href="#metrics">Metrics</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.welcomeSection}>
            <h1>MoE Visualization Playground</h1>
            <p>
              Welcome to the interactive Mixture of Experts visualizer!
            </p>
          </div>

          {/* Animation Panel */}
          <AnimationPanel />

          {/* Visualization Area */}
          <div className={styles.visualizationArea}>
            <ExpertNetwork />
          </div>

          {/* Status Legend */}
          <StatusLegend />

          {/* Control Panel */}
          <div className={styles.controlPanel}>
            <h3>Controls</h3>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <label>Number of Experts</label>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={numExperts}
                  onChange={e => setNumExperts(Number(e.target.value))}
                />
                <span className={styles.value}>{numExperts}</span>
              </div>
              <div className={styles.controlGroup}>
                <label>Top-K Selection</label>
                <input
                  type="range"
                  min="1"
                  max={numExperts}
                  value={topK}
                  onChange={e => setTopK(Number(e.target.value))}
                />
                <span className={styles.value}>{topK}</span>
              </div>
              <div className={styles.controlGroup}>
                <label>Animation Speed</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={animationSpeed}
                  onChange={e => setAnimationSpeed(Number(e.target.value))}
                />
                <span className={styles.value}>{animationSpeed}x</span>
              </div>
            </div>

            <div className={styles.configSummary}>
              <p>
                Current Configuration: Each token will be routed to{' '}
                <strong>{topK}</strong> out of <strong>{numExperts}</strong> experts
                at <strong>{animationSpeed}x</strong> speed.
              </p>
              <button className={styles.resetButton} onClick={resetConfig}>
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VisualizerPage


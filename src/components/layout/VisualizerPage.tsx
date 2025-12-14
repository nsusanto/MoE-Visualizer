import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './VisualizerPage.module.css'

function VisualizerPage() {
  const [numExperts, setNumExperts] = useState(8)
  const [topK, setTopK] = useState(2)
  const [animationSpeed, setAnimationSpeed] = useState(5)

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
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
              Welcome to the interactive Mixture of Experts visualizer! This is where
              you'll see the magic happen.
            </p>
          </div>

          {/* Visualization Area */}
          <div className={styles.visualizationArea}>
          </div>

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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VisualizerPage


import { Link } from 'react-router-dom'
import styles from './VisualizerPage.module.css'

function VisualizerPage() {
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
                <input type="range" min="2" max="16" defaultValue="8" disabled />
              </div>
              <div className={styles.controlGroup}>
                <label>Top-K Selection</label>
                <input type="range" min="1" max="4" defaultValue="2" disabled />
              </div>
              <div className={styles.controlGroup}>
                <label>Animation Speed</label>
                <input type="range" min="1" max="10" defaultValue="5" disabled />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VisualizerPage


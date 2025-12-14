import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMoeStore } from '../../store/moeStore'
import { useSimulationStore } from '../../store/simulationStore'
import ExpertNetwork from '../visualizers/ExpertNetwork'
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

  // Token input
  const [tokenInput, setTokenInput] = useState('')
  const addToken = useSimulationStore(state => state.addToken)
  const tokens = useSimulationStore(state => state.tokens)

  const MAX_TOKEN_LENGTH = 100
  const MAX_TOKENS = 50

  const handleAddToken = () => {
    const trimmed = tokenInput.trim()

    // Validation checks
    if (!trimmed) return
    if (trimmed.length > MAX_TOKEN_LENGTH) {
      alert(`Token content must be ${MAX_TOKEN_LENGTH} characters or less`)
      return
    }
    if (tokens.length >= MAX_TOKENS) {
      alert(`Maximum of ${MAX_TOKENS} tokens allowed`)
      return
    }

    // Sanitize: remove potentially dangerous characters
    const sanitized = trimmed.replace(/[<>]/g, '')

    addToken(sanitized)
    setTokenInput('') // Clear input after adding
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddToken()
    }
  }

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
              Welcome to the interactive Mixture of Experts visualizer! This is where
              you'll see the magic happen.
            </p>
          </div>

          {/* Token Input Section */}
          <div className={styles.tokenInputSection}>
            <h3>Add Token</h3>
            <p className={styles.inputDescription}>
              Enter content for your token (e.g., "Calculate 2+2", "Translate hello")
            </p>
            <div className={styles.tokenInputGroup}>
              <input
                type="text"
                className={styles.tokenInput}
                placeholder="Enter token content..."
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                onKeyPress={handleKeyPress}
                maxLength={MAX_TOKEN_LENGTH}
              />
              <button
                className={styles.addTokenButton}
                onClick={handleAddToken}
                disabled={tokens.length >= MAX_TOKENS}
              >
                Add Token {tokens.length > 0 && `(${tokens.length}/${MAX_TOKENS})`}
              </button>
            </div>
          </div>

          {/* Visualization Area */}
          <div className={styles.visualizationArea}>
            <ExpertNetwork />
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


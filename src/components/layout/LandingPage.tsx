import { useNavigate } from 'react-router-dom'
import styles from './LandingPage.module.css'

function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>MoE Visualizer</span>
          </div>
          <nav className={styles.nav}>
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#docs">Docs</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>Interactive Learning Tool</div>
          <h1 className={styles.title}>
            Visualize <span className={styles.gradient}>Mixture of Experts</span> Models
          </h1>
          <p className={styles.subtitle}>
            Understand how MoE architectures work with interactive, real-time
            visualizations. Watch tokens flow through expert networks and see load
            balancing in action.
          </p>
          <div className={styles.cta}>
            <button
              className={styles.primaryButton}
              onClick={() => navigate('/visualizer')}
            >
              Start Exploring
              <span className={styles.arrow}>→</span>
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Built with React, TypeScript, and D3.js</p>
          <div className={styles.footerLinks}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href="#docs">Documentation</a>
            <a href="#about">About</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage


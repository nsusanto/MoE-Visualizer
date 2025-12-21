import { Expert } from '../../types/moe.types'
import styles from './ExpertDetailPanel.module.css'

interface ExpertDetailPanelProps {
  expert: Expert | null
  isOpen: boolean
  onClose: () => void
}

function ExpertDetailPanel({ expert, isOpen, onClose }: ExpertDetailPanelProps) {
  if (!expert) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      {/* Side Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.expertIndicator} style={{ backgroundColor: expert.color }}>
              Expert {expert.id}
            </div>
            <h2 className={styles.title}>FFN Computation</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>

        {/* Content Area - Blank for now */}
        <div className={styles.content}>
          <div className={styles.placeholder}>
          </div>
        </div>
      </div>
    </>
  )
}

export default ExpertDetailPanel


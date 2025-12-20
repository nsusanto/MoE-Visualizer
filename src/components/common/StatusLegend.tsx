import styles from './StatusLegend.module.css'

function StatusLegend() {
  return (
    <div className={styles.container}>
      <h4>Token Status</h4>
      <div className={styles.legend}>
        <div className={styles.item}>
          <div className={styles.dot} style={{ backgroundColor: '#06b6d4' }} />
          <span>Idle</span>
        </div>
        <div className={styles.item}>
          <div className={styles.dot} style={{ backgroundColor: '#f59e0b' }} />
          <span>Routing</span>
        </div>
        <div className={styles.item}>
          <div className={styles.dot} style={{ backgroundColor: '#10b981' }} />
          <span>Processing</span>
        </div>
        <div className={styles.item}>
          <div className={styles.dot} style={{ backgroundColor: '#94a3b8' }} />
          <span>Complete</span>
        </div>
      </div>
    </div>
  )
}

export default StatusLegend



import { Expert } from '../../types/moe.types'
import { useSimulationStore } from '../../store/simulationStore'
import styles from './ExpertDetailPanel.module.css'

interface ExpertDetailPanelProps {
  expert: Expert | null
  isOpen: boolean
  onClose: () => void
}

function ExpertDetailPanel({ expert, isOpen, onClose }: ExpertDetailPanelProps) {
  if (!expert) return null

  // Get tokens currently being processed by this expert
  const tokens = useSimulationStore(state => state.tokens)
  const activeTokens = tokens.filter(
    t => t.status === 'processing' && t.targetExperts.includes(expert.id)
  )
  
  // Batch size for matrix dimensions
  const batchSize = activeTokens.length
  
  // Get the most advanced stage (so animation never goes backwards)
  const stageOrder: Record<string, number> = {
    'input': 1,
    'ffn1': 2,
    'relu': 3,
    'ffn2': 4,
    'output': 5
  }
  
  let currentStage: 'input' | 'ffn1' | 'relu' | 'ffn2' | 'output' | null = null
  if (activeTokens.length > 0) {
    // Find the most advanced stage among all tokens
    let maxStage = 0
    activeTokens.forEach(token => {
      if (token.ffnStage) {
        const stageNum = stageOrder[token.ffnStage] || 0
        if (stageNum > maxStage) {
          maxStage = stageNum
          currentStage = token.ffnStage
        }
      }
    })
  }

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
            {activeTokens.length > 0 && (
              <div className={styles.processingInfo}>
                Batch processing {activeTokens.length} token{activeTokens.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>

        {/* Content Area - FFN Diagram */}
        <div className={styles.content}>
          {activeTokens.length === 0 ? (
            <div className={styles.idleMessage}>
              No tokens currently processing
            </div>
          ) : (
            <div className={styles.diagramsContainer}>
              {/* Batch info */}
              <div className={styles.batchInfo}>
                <div className={styles.batchLabel}>Current Batch:</div>
                <div className={styles.tokenList}>
                  {activeTokens.map((token, idx) => (
                    <span key={token.id} className={styles.tokenBadge}>
                      {token.content}
                    </span>
                  ))}
                </div>
              </div>

              {/* Single diagram showing batched dimensions */}
              <div className={styles.ffnDiagram}>
                {/* Input Block - narrow (vector: batchSize×512) */}
                <div className={`${styles.block} ${styles.narrow} ${currentStage === 'input' ? styles.active : ''}`}>
                  <div className={styles.blockLabel}>Input</div>
                  <div className={styles.blockDim}>{batchSize} × 512</div>
                </div>

                {/* Arrow down */}
                <div className={styles.arrow}>↓</div>

                {/* FFN1 Block - wide (matrix result: batchSize×2048) */}
                <div className={`${styles.block} ${styles.wide} ${currentStage === 'ffn1' ? styles.active : ''}`}>
                  <div className={styles.blockLabel}>W₁ × h</div>
                  <div className={styles.blockDim}>{batchSize} × 2048</div>
                  <div className={styles.matrixInfo}>(W₁: 2048×512)</div>
                </div>

                {/* Arrow down */}
                <div className={styles.arrow}>↓</div>

                {/* ReLU Block - wide (element-wise: batchSize×2048) */}
                <div className={`${styles.block} ${styles.wide} ${styles.activation} ${currentStage === 'relu' ? styles.active : ''}`}>
                  <div className={styles.blockLabel}>ReLU</div>
                  <div className={styles.blockDim}>{batchSize} × 2048</div>
                </div>

                {/* Arrow down */}
                <div className={styles.arrow}>↓</div>

                {/* FFN2 Block - narrow (matrix result: batchSize×512) */}
                <div className={`${styles.block} ${styles.narrow} ${currentStage === 'ffn2' ? styles.active : ''}`}>
                  <div className={styles.blockLabel}>W₂ × h</div>
                  <div className={styles.blockDim}>{batchSize} × 512</div>
                  <div className={styles.matrixInfo}>(W₂: 512×2048)</div>
                </div>

                {/* Arrow down */}
                <div className={styles.arrow}>↓</div>

                {/* Output Block - narrow (vector: batchSize×512) */}
                <div className={`${styles.block} ${styles.narrow} ${currentStage === 'output' ? styles.active : ''}`}>
                  <div className={styles.blockLabel}>Output</div>
                  <div className={styles.blockDim}>{batchSize} × 512</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ExpertDetailPanel


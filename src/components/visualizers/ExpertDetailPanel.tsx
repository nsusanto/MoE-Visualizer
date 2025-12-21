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
                Processing {activeTokens.length} token{activeTokens.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close panel">
            ×
          </button>
        </div>

        {/* Content Area - FFN Diagram(s) */}
        <div className={styles.content}>
          {activeTokens.length === 0 ? (
            <div className={styles.idleMessage}>
              No tokens currently processing
            </div>
          ) : (
            <div className={styles.diagramsContainer}>
              {activeTokens.map((token) => (
                <div key={token.id} className={styles.tokenDiagram}>
                  <div className={styles.tokenHeader}>
                    <span className={styles.tokenName}>"{token.content}"</span>
                  </div>
                  
                  <div className={styles.ffnDiagram}>
                    {/* Input Block - narrow (vector: 512x1) */}
                    <div className={`${styles.block} ${styles.narrow} ${token.ffnStage === 'input' ? styles.active : ''}`}>
                      <div className={styles.blockLabel}>Input</div>
                      <div className={styles.blockDim}>512 × 1</div>
                    </div>

                    {/* Arrow down */}
                    <div className={styles.arrow}>↓</div>

                    {/* FFN1 Block - wide (matrix result: 2048x1) */}
                    <div className={`${styles.block} ${styles.wide} ${token.ffnStage === 'ffn1' ? styles.active : ''}`}>
                      <div className={styles.blockLabel}>W₁ × h</div>
                      <div className={styles.blockDim}>2048 × 1</div>
                      <div className={styles.matrixInfo}>(W₁: 2048×512)</div>
                    </div>

                    {/* Arrow down */}
                    <div className={styles.arrow}>↓</div>

                    {/* ReLU Block - wide (element-wise: 2048x1) */}
                    <div className={`${styles.block} ${styles.wide} ${styles.activation} ${token.ffnStage === 'relu' ? styles.active : ''}`}>
                      <div className={styles.blockLabel}>ReLU</div>
                      <div className={styles.blockDim}>2048 × 1</div>
                    </div>

                    {/* Arrow down */}
                    <div className={styles.arrow}>↓</div>

                    {/* FFN2 Block - narrow (matrix result: 512x1) */}
                    <div className={`${styles.block} ${styles.narrow} ${token.ffnStage === 'ffn2' ? styles.active : ''}`}>
                      <div className={styles.blockLabel}>W₂ × h</div>
                      <div className={styles.blockDim}>512 × 1</div>
                      <div className={styles.matrixInfo}>(W₂: 512×2048)</div>
                    </div>

                    {/* Arrow down */}
                    <div className={styles.arrow}>↓</div>

                    {/* Output Block - narrow (vector: 512x1) */}
                    <div className={`${styles.block} ${styles.narrow} ${token.ffnStage === 'output' ? styles.active : ''}`}>
                      <div className={styles.blockLabel}>Output</div>
                      <div className={styles.blockDim}>512 × 1</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ExpertDetailPanel


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
            X
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

              {/* Neural network diagram with dense connections */}
              <div className={styles.ffnDiagram}>
                <svg width="280" height="450" viewBox="0 0 280 450">
                  {/* Layer labels */}
                  <text x="140" y="15" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">
                    Input ({batchSize} × 512)
                  </text>
                  <text x="140" y="125" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">
                    W₁ × h ({batchSize} × 2048)
                  </text>
                  <text x="140" y="235" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">
                    ReLU ({batchSize} × 2048)
                  </text>
                  <text x="140" y="340" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">
                    W₂ × h ({batchSize} × 512)
                  </text>
                  <text x="140" y="445" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">
                    Output ({batchSize} × 512)
                  </text>

                  {/* Input layer neurons (8 neurons for 512 dims) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 80 + i * 17
                    return (
                      <g key={`input-${i}`}>
                        {/* Connections to FFN1 layer */}
                        {Array.from({ length: 16 }).map((_, j) => (
                          <line
                            key={`conn-in-ffn1-${i}-${j}`}
                            x1={x}
                            y1={35}
                            x2={40 + j * 13}
                            y2={145}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.3"
                            opacity="0.15"
                          />
                        ))}
                        <circle
                          cx={x}
                          cy={35}
                          r="5"
                          fill={currentStage === 'input' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'input' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* FFN1 layer neurons (16 neurons for 2048 dims - wider layer) */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 13
                    return (
                      <g key={`ffn1-${i}`}>
                        {/* Connections to ReLU layer */}
                        {Array.from({ length: 16 }).map((_, j) => (
                          <line
                            key={`conn-ffn1-relu-${i}-${j}`}
                            x1={x}
                            y1={145}
                            x2={40 + j * 13}
                            y2={250}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.3"
                            opacity="0.1"
                          />
                        ))}
                        <circle
                          cx={x}
                          cy={145}
                          r="5"
                          fill={currentStage === 'ffn1' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'ffn1' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* ReLU layer neurons (16 neurons for 2048 dims) */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 13
                    return (
                      <g key={`relu-${i}`}>
                        {/* Connections to FFN2 layer */}
                        {Array.from({ length: 8 }).map((_, j) => (
                          <line
                            key={`conn-relu-ffn2-${i}-${j}`}
                            x1={x}
                            y1={250}
                            x2={80 + j * 17}
                            y2={355}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.3"
                            opacity="0.15"
                          />
                        ))}
                        <circle
                          cx={x}
                          cy={250}
                          r="5"
                          fill={currentStage === 'relu' ? '#10b981' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'relu' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* FFN2 layer neurons (8 neurons for 512 dims - narrower) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 80 + i * 17
                    return (
                      <g key={`ffn2-${i}`}>
                        {/* Connections to Output layer */}
                        {Array.from({ length: 8 }).map((_, j) => (
                          <line
                            key={`conn-ffn2-out-${i}-${j}`}
                            x1={x}
                            y1={355}
                            x2={80 + j * 17}
                            y2={420}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.3"
                            opacity="0.1"
                          />
                        ))}
                        <circle
                          cx={x}
                          cy={355}
                          r="5"
                          fill={currentStage === 'ffn2' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'ffn2' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Output layer neurons (8 neurons for 512 dims) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 80 + i * 17
                    return (
                      <circle
                        key={`output-${i}`}
                        cx={x}
                        cy={420}
                        r="5"
                        fill={currentStage === 'output' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                        opacity={currentStage === 'output' ? 1 : 0.5}
                      />
                    )
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ExpertDetailPanel


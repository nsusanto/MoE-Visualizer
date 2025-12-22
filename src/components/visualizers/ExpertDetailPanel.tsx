import { Expert } from '../../types/moe.types'
import { useSimulationStore } from '../../store/simulationStore'
import styles from './ExpertDetailPanel.module.css'

interface ExpertDetailPanelProps {
  expert: Expert | null
  isOpen: boolean
  onClose: () => void
}

function ExpertDetailPanel({ expert, isOpen, onClose }: ExpertDetailPanelProps) {
  // Get tokens currently being processed by this expert
  const tokens = useSimulationStore(state => state.tokens)
  
  if (!expert) return null
  
  const activeTokens = tokens.filter(
    t => t.status === 'processing' && t.targetExperts.includes(expert.id)
  )
  
  const batchSize = activeTokens.length > 0 ? activeTokens.length : 1
  
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
          <div className={styles.diagramsContainer}>

              {/* Neural network diagram with dense connections */}
              <div className={styles.ffnDiagram}>
                <svg width="320" height="550" viewBox="0 0 320 550">
                  {/* Input to FFN1 connections */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const x = 127 + i * 22
                    return (
                      <g key={`input-conn-${i}`}>
                        {Array.from({ length: 16 }).map((_, j) => (
                          <line
                            key={`conn-in-ffn1-${i}-${j}`}
                            x1={x}
                            y1={50}
                            x2={40 + j * 16}
                            y2={185}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.8"
                            opacity="0.7"
                          />
                        ))}
                      </g>
                    )
                  })}

                  {/* FFN1 to ReLU connections (one-to-one) */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 16
                    return (
                      <line
                        key={`conn-ffn1-relu-${i}`}
                        x1={x}
                        y1={185}
                        x2={x}
                        y2={320}
                        stroke="var(--color-surface-light)"
                        strokeWidth="1.5"
                        opacity="0.6"
                      />
                    )
                  })}

                  {/* ReLU to FFN2 connections */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 16
                    return (
                      <g key={`relu-conn-${i}`}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <line
                            key={`conn-relu-ffn2-${i}-${j}`}
                            x1={x}
                            y1={320}
                            x2={83 + j * 22}
                            y2={455}
                            stroke="var(--color-surface-light)"
                            strokeWidth="0.8"
                            opacity="0.7"
                          />
                        ))}
                      </g>
                    )
                  })}

                  {/* FFN2 to Output connections (one-to-one) */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 83 + i * 22
                    return (
                      <line
                        key={`conn-ffn2-out-${i}`}
                        x1={x}
                        y1={455}
                        x2={x}
                        y2={515}
                        stroke="var(--color-surface-light)"
                        strokeWidth="1.5"
                        opacity="0.6"
                      />
                    )
                  })}

                  {/* Input layer neurons */}
                  {Array.from({ length: 4 }).map((_, i) => {
                    const x = 127 + i * 22
                    return (
                      <g key={`input-${i}`}>
                        {/* Background circle to block lines */}
                        <circle
                          cx={x}
                          cy={50}
                          r="8"
                          fill="var(--color-surface)"
                        />
                        {/* Neuron circle */}
                        <circle
                          cx={x}
                          cy={50}
                          r="7"
                          fill={currentStage === 'input' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'input' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Layer label for Input */}
                  <text x="160" y="35" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
                    Input ({batchSize} × 512)
                  </text>

                  {/* FFN1 layer neurons */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 16
                    return (
                      <g key={`ffn1-${i}`}>
                        {/* Background circle to block lines */}
                        <circle
                          cx={x}
                          cy={185}
                          r="8"
                          fill="var(--color-surface)"
                        />
                        {/* Neuron circle */}
                        <circle
                          cx={x}
                          cy={185}
                          r="7"
                          fill={currentStage === 'ffn1' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'ffn1' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Layer label for FFN1 */}
                  <text x="160" y="170" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
                    W₁ × h ({batchSize} × 2048)
                  </text>

                  {/* ReLU layer neurons */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const x = 40 + i * 16
                    return (
                      <g key={`relu-${i}`}>
                        {/* Background circle to block lines */}
                        <circle
                          cx={x}
                          cy={320}
                          r="8"
                          fill="var(--color-surface)"
                        />
                        {/* Neuron circle */}
                        <circle
                          cx={x}
                          cy={320}
                          r="7"
                          fill={currentStage === 'relu' ? '#10b981' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'relu' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Layer label for ReLU */}
                  <text x="160" y="305" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
                    ReLU ({batchSize} × 2048)
                  </text>

                  {/* FFN2 layer neurons */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 83 + i * 22
                    return (
                      <g key={`ffn2-${i}`}>
                        {/* Background circle to block lines */}
                        <circle
                          cx={x}
                          cy={455}
                          r="8"
                          fill="var(--color-surface)"
                        />
                        {/* Neuron circle */}
                        <circle
                          cx={x}
                          cy={455}
                          r="7"
                          fill={currentStage === 'ffn2' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'ffn2' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Layer label for FFN2 */}
                  <text x="160" y="440" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
                    W₂ × h ({batchSize} × 512)
                  </text>

                  {/* Output layer neurons */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const x = 83 + i * 22
                    return (
                      <g key={`output-${i}`}>
                        {/* Background circle to block lines */}
                        <circle
                          cx={x}
                          cy={515}
                          r="8"
                          fill="var(--color-surface)"
                        />
                        {/* Neuron circle */}
                        <circle
                          cx={x}
                          cy={515}
                          r="7"
                          fill={currentStage === 'output' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                          opacity={currentStage === 'output' ? 1 : 0.5}
                        />
                      </g>
                    )
                  })}

                  {/* Layer label for Output */}
                  <text x="160" y="540" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
                    Output ({batchSize} × 512)
                  </text>
                </svg>
                    {activeTokens.length > 0 && (
                  <div className={styles.batchInfo}>
                    <div className={styles.batchLabel}>Current Batch:</div>
                    <div className={styles.tokenList}>
                      {activeTokens.map((token) => (
                        <span key={token.id} className={styles.tokenBadge}>
                          {token.content}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Show idle message when no tokens */}
                {activeTokens.length === 0 && (
                  <div className={styles.idleMessage}>
                    No tokens currently processing
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default ExpertDetailPanel


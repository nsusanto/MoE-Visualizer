import { useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import ExpertDetailPanel from './ExpertDetailPanel'
import { Expert } from '../../types/moe.types'
import styles from './ExpertNetwork.module.css'

function ExpertNetwork() {
  const experts = useSimulationStore(state => state.experts)
  const tokens = useSimulationStore(state => state.tokens)
  const animationState = useSimulationStore(state => state.animationState)

  // Side panel state
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const handleExpertClick = (expert: Expert) => {
    setSelectedExpert(expert)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Keep selectedExpert for animation, clear after transition
    setTimeout(() => setSelectedExpert(null), 300)
  }

  // SVG viewBox dimensions
  const width = 900
  const height = 650

  return (
    <div className={styles.container}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
      >
        {/* Routing lines (draw first so they're behind tokens and experts) */}
        {tokens.map((token) => {
          // Use token's stored position (never changes!)
          const tokenPos = token.position

          return token.targetExperts.map((expertId, index) => {
            const expert = experts[expertId]
            if (!expert) return null

            const weight = token.routingWeights[index]
            const strokeWidth = 1 + weight * 2

            // Add curve based on index to separate overlapping lines
            const curveOffset = (index - (token.targetExperts.length - 1) / 2) * 15
            const midX = (tokenPos.x + expert.position.x) / 2 + curveOffset
            const midY = (tokenPos.y + expert.position.y) / 2 + curveOffset

            // Quadratic bezier curve path
            const path = `M ${tokenPos.x} ${tokenPos.y} Q ${midX} ${midY} ${expert.position.x} ${expert.position.y}`

            return (
              <path
                key={`${token.id}-${expertId}`}
                d={path}
                stroke={expert.color}
                strokeWidth={strokeWidth}
                opacity={0.6}
                fill="none"
                className={styles.routingLine}
              />
            )
          })
        })}

        {/* Draw each expert */}
        {experts.map(expert => {
          const isAnimating = animationState.isPlaying
          const isScoring =
            isAnimating &&
            (animationState.currentStep === 'scoring' ||
              animationState.currentStep === 'selecting' ||
              animationState.currentStep === 'routing')
          const isSelected =
            isScoring && animationState.allSelectedExperts.includes(expert.id)
          const score = isScoring ? animationState.expertScores[expert.id] : 0

          // Calculate current load for this expert
          const activeTokens = tokens.filter(
            t => t.status === 'processing' && t.targetExperts.includes(expert.id)
          )
          const currentLoad = activeTokens.length
          const hasLoad = currentLoad > 0 || expert.isActive

          // Glow intensity based on load
          const glowOpacity = Math.min(0.3 + currentLoad * 0.15, 1)
          const glowRadius = 8 + currentLoad * 2

          return (
            <g
              key={expert.id}
              className={`${styles.expertGroup} ${isSelected ? styles.selected : ''}`}
              onClick={() => handleExpertClick(expert)}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow effect for active experts */}
              {hasLoad && (
                <circle
                  cx={expert.position.x}
                  cy={expert.position.y}
                  r={24 + glowRadius}
                  fill={expert.color}
                  opacity={glowOpacity * 0.3}
                  className={styles.expertGlow}
                />
              )}

              {/* Background circle to block lines */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={26}
                fill="var(--color-surface)"
                opacity={1}
              />

              {/* Expert circle */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={24}
                fill={expert.color}
                className={styles.expertCircle}
                opacity={isSelected ? 1 : hasLoad ? 1 : 0.9}
              />

              {/* Expert circle outline */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={24}
                fill="none"
                stroke={expert.color}
                strokeWidth={isSelected ? 3 : 2}
                className={styles.expertOutline}
              />

            {/* Expert number/label */}
            <text
              x={expert.position.x}
              y={expert.position.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={styles.expertLabel}
              fill="white"
              fontSize={11}
              fontWeight="600"
            >
              {expert.id + 1}
            </text>

            {/* Load badge (show current processing count) */}
            {currentLoad > 0 && (
              <>
                <circle
                  cx={expert.position.x + 16}
                  cy={expert.position.y - 16}
                  r={8}
                  fill="#10b981"
                />
                <text
                  x={expert.position.x + 16}
                  y={expert.position.y - 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={10}
                  fontWeight="700"
                >
                  {currentLoad}
                </text>
              </>
            )}

              {/* Expert name below circle */}
              <text
                x={expert.position.x}
                y={expert.position.y + 36}
                textAnchor="middle"
                className={styles.expertName}
                fill="#f1f5f9"
                fontSize={9}
              >
                {expert.name}
              </text>

              {/* Specialization */}
              <text
                x={expert.position.x}
                y={expert.position.y + 48}
                textAnchor="middle"
                className={styles.expertSpec}
                fill="#94a3b8"
                fontSize={8}
              >
                {expert.specialization}
              </text>

              {/* Load info (when processing) */}
              {currentLoad > 0 && (
                <text
                  x={expert.position.x}
                  y={expert.position.y + 60}
                  textAnchor="middle"
                  className={styles.expertLoad}
                  fill="#10b981"
                  fontSize={7}
                  fontWeight="600"
                >
                  +{(currentLoad * 0.5).toFixed(1)}s delay
                </text>
              )}

            {/* Score display during animation */}
            {isScoring && (
              <text
                x={expert.position.x}
                y={expert.position.y + 60}
                textAnchor="middle"
                className={styles.expertScore}
                fill={isSelected ? '#10b981' : '#94a3b8'}
                fontSize={8}
                fontWeight="700"
                fontFamily="monospace"
              >
                {score.toFixed(3)}
              </text>
            )}
          </g>
          )
        })}

        {/* Draw tokens in their positions */}
        {tokens.map((token) => {
          // Use token's stored position (stable throughout lifetime)
          const tokenPos = token.position

          // Token color based on status
          const tokenColor =
            token.status === 'idle'
              ? '#06b6d4' // Cyan
              : token.status === 'routing'
                ? '#f59e0b' // Amber
                : token.status === 'processing'
                  ? '#10b981' // Green
                  : '#94a3b8' // Gray (complete)

          return (
            <g key={token.id} className={styles.tokenGroup}>
              {/* Background circle to block lines */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={14}
                fill="var(--color-surface)"
                opacity={1}
              />

              {/* Token circle */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={12}
                fill={tokenColor}
                className={styles.tokenCircle}
                opacity={0.9}
              />

              {/* Token outline */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={12}
                fill="none"
                stroke={tokenColor}
                strokeWidth={2}
                className={styles.tokenOutline}
              />

              {/* Token content (the word itself) */}
              <text
                x={tokenPos.x}
                y={tokenPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.tokenLabel}
                fill="white"
                fontSize={8}
                fontWeight="700"
              >
                {token.content.length > 6
                  ? token.content.substring(0, 6)
                  : token.content}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Expert Detail Panel */}
      <ExpertDetailPanel
        expert={selectedExpert}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  )
}

export default ExpertNetwork


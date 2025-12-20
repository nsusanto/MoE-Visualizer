import { useSimulationStore } from '../../store/simulationStore'
import { calculateTokenPositions } from '../../utils/tokenPositioning'
import styles from './ExpertNetwork.module.css'

function ExpertNetwork() {
  const experts = useSimulationStore(state => state.experts)
  const tokens = useSimulationStore(state => state.tokens)
  const animationState = useSimulationStore(state => state.animationState)

  // SVG viewBox dimensions
  const width = 900
  const height = 650
  const centerX = 450
  const centerY = 325

  // Calculate token positions using clustering algorithm
  const tokenPositions = calculateTokenPositions(tokens.length, centerX, centerY)

  return (
    <div className={styles.container}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
      >
        {/* Routing lines (draw first so they're behind tokens and experts) */}
        {tokens.map((token, tokenIndex) => {
          const tokenPos = tokenPositions[tokenIndex]
          if (!tokenPos) return null

          return token.targetExperts.map((expertId, index) => {
            const expert = experts[expertId]
            if (!expert) return null

            const weight = token.routingWeights[index]
            const strokeWidth = 1 + weight * 3 // 1-4px based on weight

            return (
              <line
                key={`${token.id}-${expertId}`}
                x1={tokenPos.x}
                y1={tokenPos.y}
                x2={expert.position.x}
                y2={expert.position.y}
                stroke={expert.color}
                strokeWidth={strokeWidth}
                opacity={0.6}
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
            isScoring && animationState.selectedExperts.includes(expert.id)
          const score = isScoring ? animationState.expertScores[expert.id] : 0

          // Calculate current load for this expert
          const activeTokens = tokens.filter(
            t => t.status === 'processing' && t.targetExperts.includes(expert.id)
          )
          const currentLoad = activeTokens.length
          const hasLoad = currentLoad > 0 || expert.isActive

          // Glow intensity based on load
          const glowOpacity = Math.min(0.3 + currentLoad * 0.15, 1)
          const glowRadius = 10 + currentLoad * 3

          return (
            <g
              key={expert.id}
              className={`${styles.expertGroup} ${isSelected ? styles.selected : ''} ${hasLoad ? styles.hasLoad : ''}`}
            >
              {/* Glow effect for active experts */}
              {hasLoad && (
                <circle
                  cx={expert.position.x}
                  cy={expert.position.y}
                  r={30 + glowRadius}
                  fill={expert.color}
                  opacity={glowOpacity * 0.3}
                  className={styles.expertGlow}
                />
              )}

              {/* Background circle to block lines */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={32}
                fill="var(--color-surface)"
                opacity={1}
              />

              {/* Expert circle */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={30}
                fill={expert.color}
                className={styles.expertCircle}
                opacity={isSelected ? 1 : hasLoad ? 1 : 0.9}
              />

              {/* Expert circle outline */}
              <circle
                cx={expert.position.x}
                cy={expert.position.y}
                r={30}
                fill="none"
                stroke={expert.color}
                strokeWidth={isSelected ? 4 : 2}
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
              fontSize={14}
              fontWeight="600"
            >
              {expert.id + 1}
            </text>

            {/* Load badge (show current processing count) - no animation */}
            {currentLoad > 0 && (
              <>
                <circle
                  cx={expert.position.x + 20}
                  cy={expert.position.y - 20}
                  r={10}
                  fill="#10b981"
                />
                <text
                  x={expert.position.x + 20}
                  y={expert.position.y - 20}
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
                y={expert.position.y + 45}
                textAnchor="middle"
                className={styles.expertName}
                fill="#f1f5f9"
                fontSize={11}
              >
                {expert.name}
              </text>

              {/* Specialization */}
              <text
                x={expert.position.x}
                y={expert.position.y + 60}
                textAnchor="middle"
                className={styles.expertSpec}
                fill="#94a3b8"
                fontSize={9}
              >
                {expert.specialization}
              </text>

              {/* Load info (when processing) */}
              {currentLoad > 0 && (
                <text
                  x={expert.position.x}
                  y={expert.position.y + 75}
                  textAnchor="middle"
                  className={styles.expertLoad}
                  fill="#10b981"
                  fontSize={8}
                  fontWeight="600"
                >
                  +{(currentLoad * 0.5).toFixed(1)}s delay
                </text>
              )}

            {/* Score display during animation */}
            {isScoring && (
              <text
                x={expert.position.x}
                y={expert.position.y + 75}
                textAnchor="middle"
                className={styles.expertScore}
                fill={isSelected ? '#10b981' : '#94a3b8'}
                fontSize={9}
                fontWeight="700"
                fontFamily="monospace"
              >
                {score.toFixed(3)}
              </text>
            )}
          </g>
          )
        })}

        {/* Draw tokens in clustered positions */}
        {tokens.map((token, index) => {
          const tokenPos = tokenPositions[index]
          if (!tokenPos) return null

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
                r={17}
                fill="var(--color-surface)"
                opacity={1}
              />

              {/* Token circle */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={15}
                fill={tokenColor}
                className={styles.tokenCircle}
                opacity={0.9}
              />

              {/* Token outline */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={15}
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
                fontSize={10}
                fontWeight="700"
              >
                {token.content.length > 8
                  ? token.content.substring(0, 8)
                  : token.content}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default ExpertNetwork


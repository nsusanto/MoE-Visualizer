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

          return (
            <g
              key={expert.id}
              className={`${styles.expertGroup} ${isSelected ? styles.selected : ''}`}
            >
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
                opacity={isSelected ? 1 : 0.9}
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
                fill="#06b6d4"
                className={styles.tokenCircle}
                opacity={0.9}
              />

              {/* Token outline */}
              <circle
                cx={tokenPos.x}
                cy={tokenPos.y}
                r={15}
                fill="none"
                stroke="#06b6d4"
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


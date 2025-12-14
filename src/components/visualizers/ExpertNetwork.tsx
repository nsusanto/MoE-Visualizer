import { useSimulationStore } from '../../store/simulationStore'
import styles from './ExpertNetwork.module.css'

function ExpertNetwork() {
  const experts = useSimulationStore(state => state.experts)

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
        {/* Center point (for reference) */}
        <circle cx={450} cy={325} r={3} fill="#94a3b8" opacity={0.5} />

        {/* Draw each expert */}
        {experts.map(expert => (
          <g key={expert.id} className={styles.expertGroup}>
            {/* Expert circle */}
            <circle
              cx={expert.position.x}
              cy={expert.position.y}
              r={30}
              fill={expert.color}
              className={styles.expertCircle}
              opacity={0.9}
            />

            {/* Expert circle outline */}
            <circle
              cx={expert.position.x}
              cy={expert.position.y}
              r={30}
              fill="none"
              stroke={expert.color}
              strokeWidth={2}
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
          </g>
        ))}
      </svg>
    </div>
  )
}

export default ExpertNetwork


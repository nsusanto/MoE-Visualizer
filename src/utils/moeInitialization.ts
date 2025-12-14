import type { Expert, Token, Position } from '../types/moe.types'
import { SPECIALIZATIONS, EXPERT_COLORS } from '../types/moe.types'

/**
 * Initialize experts in a circular layout
 */
export function initializeExperts(count: number): Expert[] {
  const experts: Expert[] = []
  const radius = 230 // Distance from center
  const centerX = 450 // Center of visualization area
  const centerY = 325

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2 // Start from top
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    experts.push({
      id: i,
      name: `Expert ${i + 1}`,
      specialization: SPECIALIZATIONS[i % SPECIALIZATIONS.length],
      color: EXPERT_COLORS[i % EXPERT_COLORS.length],
      position: { x, y },
      loadCount: 0,
      isActive: false,
    })
  }

  return experts
}

/**
 * Generate a new token at the starting position
 */
export function generateToken(id: string): Token {
  return {
    id,
    content: `Token ${id}`,
    position: { x: 450, y: 325 }, // Start at center
    targetExperts: [],
    routingWeights: [],
    status: 'idle',
    timestamp: Date.now(),
  }
}

/**
 * Calculate position along a path (for animation)
 * @param start Starting position
 * @param end Ending position
 * @param progress 0.0 to 1.0
 */
export function interpolatePosition(
  start: Position,
  end: Position,
  progress: number
): Position {
  return {
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
  }
}

/**
 * Generate sample token content (for demo purposes)
 */
const SAMPLE_CONTENTS = [
  'Calculate 2+2',
  'Translate text',
  'Analyze data',
  'Generate code',
  'Summarize article',
  'Solve equation',
  'Parse JSON',
  'Optimize query',
]

export function generateSampleTokenContent(): string {
  return SAMPLE_CONTENTS[Math.floor(Math.random() * SAMPLE_CONTENTS.length)]
}


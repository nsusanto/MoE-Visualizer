import type { Position } from '../types/moe.types'

/**
 * Calculate token positions using concentric circles to prevent overlap
 * Uses multiple circles with different radii based on token count
 */
export function calculateTokenPositions(
  tokenCount: number,
  centerX: number,
  centerY: number
): Position[] {
  const positions: Position[] = []

  // Define circle layers with capacity
  const layers = [
    { radius: 0, capacity: 1 }, // Center (1 token)
    { radius: 45, capacity: 6 }, // Inner circle (6 tokens)
    { radius: 75, capacity: 8 }, // Middle circle (8 tokens)
    { radius: 105, capacity: 12 }, // Outer circle (12 tokens)
  ]

  let remainingTokens = tokenCount
  let tokenIndex = 0

  for (const layer of layers) {
    if (remainingTokens <= 0) break

    const tokensInThisLayer = Math.min(remainingTokens, layer.capacity)

    if (layer.radius === 0) {
      // Center position for single token
      positions.push({ x: centerX, y: centerY })
    } else {
      // Arrange tokens in circle
      for (let i = 0; i < tokensInThisLayer; i++) {
        const angle = (i / tokensInThisLayer) * 2 * Math.PI - Math.PI / 2
        const x = centerX + layer.radius * Math.cos(angle)
        const y = centerY + layer.radius * Math.sin(angle)
        positions.push({ x, y })
      }
    }

    remainingTokens -= tokensInThisLayer
    tokenIndex += tokensInThisLayer
  }

  return positions
}

/**
 * Get the appropriate radius for a token based on total count and its index
 * (Alternative simpler approach)
 */
export function getTokenRadius(tokenCount: number): number {
  if (tokenCount <= 1) return 0
  if (tokenCount <= 6) return 45
  if (tokenCount <= 12) return 75
  return 105
}


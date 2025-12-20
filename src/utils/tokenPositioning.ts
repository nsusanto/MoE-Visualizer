import type { Position } from '../types/moe.types'

/**
 * Calculate token positions using organic force-directed layout
 * Tokens are placed naturally with slight randomness and proper spacing
 */
export function calculateTokenPositions(
  tokenCount: number,
  centerX: number,
  centerY: number
): Position[] {
  if (tokenCount === 0) return []

  const positions: Position[] = []
  const minDistance = 40 // Minimum distance between tokens
  const maxRadius = Math.min(180, 80 + tokenCount * 4) // Area grows with token count
  const iterations = 50 // Number of force simulation iterations

  // Initialize positions randomly around center
  for (let i = 0; i < tokenCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * maxRadius * 0.7 // Start clustered
    
    positions.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }

  // Apply force-directed algorithm to spread out overlapping tokens
  for (let iter = 0; iter < iterations; iter++) {
    const forces: Position[] = positions.map(() => ({ x: 0, y: 0 }))

    // Calculate repulsion forces between all token pairs
    for (let i = 0; i < tokenCount; i++) {
      for (let j = i + 1; j < tokenCount; j++) {
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < minDistance && distance > 0) {
          // Push tokens apart
          const force = (minDistance - distance) / distance
          const fx = (dx / distance) * force * 0.5
          const fy = (dy / distance) * force * 0.5

          forces[i].x -= fx
          forces[i].y -= fy
          forces[j].x += fx
          forces[j].y += fy
        }
      }

      // Gentle pull toward center to keep tokens bounded
      const dcx = positions[i].x - centerX
      const dcy = positions[i].y - centerY
      const distFromCenter = Math.sqrt(dcx * dcx + dcy * dcy)
      
      if (distFromCenter > maxRadius) {
        forces[i].x -= dcx * 0.03
        forces[i].y -= dcy * 0.03
      }
    }

    // Apply forces with damping
    for (let i = 0; i < tokenCount; i++) {
      positions[i].x += forces[i].x
      positions[i].y += forces[i].y
    }
  }

  // Add subtle jitter for organic feel
  for (let i = 0; i < tokenCount; i++) {
    positions[i].x += (Math.random() - 0.5) * 3
    positions[i].y += (Math.random() - 0.5) * 3
  }

  return positions
}


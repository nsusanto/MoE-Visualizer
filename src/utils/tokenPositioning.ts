import type { Position } from '../types/moe.types'

/**
 * Calculate token positions using a compact grid layout
 * Tokens are arranged in rows, centered around the center point
 */
export function calculateTokenPositions(
  tokenCount: number,
  centerX: number,
  centerY: number
): Position[] {
  if (tokenCount === 0) return []

  const positions: Position[] = []
  
  // Token spacing
  const tokenSpacing = 40 // Horizontal spacing between tokens
  const rowHeight = 45 // Vertical spacing between rows

  // Calculate optimal number of columns (try to make it roughly square)
  const columns = Math.ceil(Math.sqrt(tokenCount * 1.5)) // Slightly wider than tall
  const rows = Math.ceil(tokenCount / columns)

  let tokenIndex = 0

  for (let row = 0; row < rows; row++) {
    // Calculate how many tokens in this row
    const tokensInRow = Math.min(columns, tokenCount - tokenIndex)
    
    // Calculate starting X position to center this row
    const rowWidth = (tokensInRow - 1) * tokenSpacing
    const startX = centerX - rowWidth / 2

    for (let col = 0; col < tokensInRow; col++) {
      const x = startX + col * tokenSpacing
      // Center the entire grid vertically
      const totalHeight = (rows - 1) * rowHeight
      const y = centerY - totalHeight / 2 + row * rowHeight

      positions.push({ x, y })
      tokenIndex++

      if (tokenIndex >= tokenCount) break
    }

    if (tokenIndex >= tokenCount) break
  }

  return positions
}


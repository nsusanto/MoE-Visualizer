import type { Token, Expert } from '../types/moe.types'

/**
 * Compute gating scores for each expert (simulated)
 * In a real MoE, this would be a neural network output
 */
export function computeGatingScores(token: Token, experts: Expert[]): number[] {
  const scores: number[] = []
  
  // Simple simulation: generate random scores for each expert
  // In reality, this would be based on token content and expert specialization
  for (let i = 0; i < experts.length; i++) {
    // Generate a random score between 0 and 1
    // Add some variance based on token content length for variety
    const baseScore = Math.random()
    const contentFactor = (token.content.length % 10) / 10
    scores.push(baseScore * 0.7 + contentFactor * 0.3)
  }
  
  return scores
}

/**
 * Select top K experts based on scores
 * Returns array of expert IDs
 */
export function selectTopK(scores: number[], k: number): number[] {
  // Create array of [score, index] pairs
  const scorePairs = scores.map((score, index) => ({ score, index }))
  
  // Sort by score descending
  scorePairs.sort((a, b) => b.score - a.score)
  
  // Take top K
  const topK = scorePairs.slice(0, k)
  
  // Return just the indices (expert IDs)
  return topK.map(pair => pair.index)
}

/**
 * Normalize weights so they sum to 1.0
 */
export function normalizeWeights(scores: number[], selectedIndices: number[]): number[] {
  // Get scores for selected experts
  const selectedScores = selectedIndices.map(idx => scores[idx])
  
  // Calculate sum
  const sum = selectedScores.reduce((acc, score) => acc + score, 0)
  
  // Normalize (divide each by sum)
  if (sum === 0) {
    // Edge case: all zeros, distribute equally
    return selectedScores.map(() => 1 / selectedScores.length)
  }
  
  return selectedScores.map(score => score / sum)
}

/**
 * Route a token to experts
 * Updates the token with target experts and weights
 */
export function routeToken(token: Token, experts: Expert[], topK: number): Token {
  // Compute scores
  const scores = computeGatingScores(token, experts)
  
  // Select top K experts
  const targetExperts = selectTopK(scores, topK)
  
  // Normalize weights
  const routingWeights = normalizeWeights(scores, targetExperts)
  
  // Update token
  return {
    ...token,
    targetExperts,
    routingWeights,
    status: 'routing',
  }
}


// Position in 2D space for visualization
export interface Position {
  x: number
  y: number
}

// Represents an expert in the MoE system
export interface Expert {
  id: number
  name: string
  specialization: string // e.g., "Math", "Language", "Science"
  color: string // Hex color for visualization
  position: Position // Where to draw it
  loadCount: number // How many tokens this expert has processed
  isActive: boolean // Currently processing?
}

// Status of a token as it moves through the system
export type TokenStatus = 'idle' | 'routing' | 'processing' | 'complete'

// Represents a token (input) being processed
export interface Token {
  id: string
  content: string // What the token represents
  position: Position // Current position for animation
  targetExperts: number[] // IDs of experts this token routes to
  routingWeights: number[] // Weight for each target expert (sums to 1.0)
  status: TokenStatus
  timestamp: number // When it was created
}

// A routing decision made by the gating network
export interface RoutingDecision {
  tokenId: string
  expertId: number
  weight: number // 0.0 - 1.0
  timestamp: number
}

// Statistics about the MoE system
export interface MoeStats {
  totalTokensProcessed: number
  avgExpertUtilization: number
  maxExpertLoad: number
  minExpertLoad: number
  isBalanced: boolean // Whether load is evenly distributed
}

// Expert specializations (for visual variety)
export const SPECIALIZATIONS = [
  'Mathematics',
  'Language',
  'Science',
  'History',
  'Art',
  'Music',
  'Geography',
  'Logic',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'Philosophy',
  'Engineering',
  'Economics',
  'Psychology',
] as const

// Color palette for experts
export const EXPERT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#84cc16', // Lime
  '#a855f7', // Violet
  '#ef4444', // Red
  '#22c55e', // Green
  '#eab308', // Yellow
  '#0ea5e9', // Sky
  '#f97316', // Orange
] as const


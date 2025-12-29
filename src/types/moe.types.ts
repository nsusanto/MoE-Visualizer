// Position in 2D space for visualization
export interface Position {
  x: number
  y: number
}

// Represents an expert in the MoE system
export interface Expert {
  id: number
  name: string
  specialization: string
  color: string
  position: Position
  loadCount: number
  isActive: boolean
  batchStartTime: number | null
  batchProcessingTime: number | null
}

// Status of a token as it moves through the system
export type TokenStatus = 'idle' | 'routing' | 'processing' | 'complete'

// FFN processing stage for detailed visualization
export type FFNStage = 'input' | 'ffn1' | 'relu' | 'ffn2' | 'output' | null

// Represents a token (input) being processed
export interface Token {
  id: string
  content: string
  position: Position
  targetExperts: number[]
  routingWeights: number[]
  gatingProbabilities: number[] // Softmax probabilities for ALL experts (for aux loss)
  status: TokenStatus
  timestamp: number
  ffnStage?: FFNStage
  processingExpertId?: number
}

// A routing decision made by the gating network
export interface RoutingDecision {
  tokenId: string
  expertId: number
  weight: number
  timestamp: number
  gatingProbabilities: number[]
}

// Statistics about the MoE system
export interface MoeStats {
  totalTokensProcessed: number
  avgExpertUtilization: number
  maxExpertLoad: number
  minExpertLoad: number
  isBalanced: boolean
  auxiliaryLoss: number
  loadImbalanceFactor: number
  expertUtilization: number[]
  tokensPerExpert: number[]
}

// Animation step for educational visualization
export type AnimationStep =
  | 'idle'
  | 'tokenizing'
  | 'scoring'
  | 'selecting'
  | 'routing'
  | 'complete'

export interface AnimationState {
  currentStep: AnimationStep
  currentTokenIndex: number
  expertScores: number[]
  selectedExperts: number[]
  allSelectedExperts: number[]
  isPlaying: boolean
}

// Expert specializations (syntactic/word-level patterns)
export const SPECIALIZATIONS = [
  'Punctuation',
  'Verbs',
  'Conjunctions',
  'Visual Descriptions',
  'Nouns',
  'Adjectives',
  'Prepositions',
  'Numbers & Digits',
  'Articles',
  'Pronouns',
  'Adverbs',
  'Proper Nouns',
  'Auxiliary Verbs',
  'Determiners',
  'Prefixes & Suffixes',
  'Special Characters',
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


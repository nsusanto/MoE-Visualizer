import { create } from 'zustand'
import type {
  Expert,
  Token,
  RoutingDecision,
  MoeStats,
  AnimationState,
} from '../types/moe.types'
import { initializeExperts, generateToken } from '../utils/moeInitialization'
import { routeToken } from '../utils/routing'
import { useMoeStore } from './moeStore'

interface SimulationStore {
  // Core simulation data
  experts: Expert[]
  tokens: Token[]
  routingHistory: RoutingDecision[]

  // Animation state
  isPlaying: boolean
  currentTime: number

  // Statistics
  stats: MoeStats

  // Animation state for visual feedback
  animationState: AnimationState

  // Actions - Initialization
  initializeSimulation: (numExperts: number) => void
  reset: () => void

  // Actions - Token management
  addToken: (content?: string) => void
  updateToken: (tokenId: string, updates: Partial<Token>) => void
  removeToken: (tokenId: string) => void

  // Actions - Expert management
  updateExpert: (expertId: number, updates: Partial<Expert>) => void
  incrementExpertLoad: (expertId: number) => void

  // Actions - Playback control
  play: () => void
  pause: () => void
  togglePlayback: () => void

  // Actions - Routing
  recordRouting: (decision: RoutingDecision) => void

  // Actions - Stats
  updateStats: () => void

  // Actions - Animation
  setAnimationState: (state: Partial<AnimationState>) => void
  resetAnimation: () => void
}

const initialStats: MoeStats = {
  totalTokensProcessed: 0,
  avgExpertUtilization: 0,
  maxExpertLoad: 0,
  minExpertLoad: 0,
  isBalanced: true,
}

const initialAnimationState: AnimationState = {
  currentStep: 'idle',
  currentTokenIndex: -1,
  expertScores: [],
  selectedExperts: [],
  allSelectedExperts: [],
  isPlaying: false,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  experts: [],
  tokens: [],
  routingHistory: [],
  isPlaying: false,
  currentTime: 0,
  stats: initialStats,
  animationState: initialAnimationState,

  // Initialize simulation with N experts
  initializeSimulation: numExperts => {
    const experts = initializeExperts(numExperts)
    set({
      experts,
      tokens: [],
      routingHistory: [],
      currentTime: 0,
      stats: initialStats,
    })
  },

  // Reset everything
  reset: () => {
    const { experts } = get()
    const resetExperts = experts.map(expert => ({
      ...expert,
      loadCount: 0,
      isActive: false,
    }))
    set({
      experts: resetExperts,
      tokens: [],
      routingHistory: [],
      currentTime: 0,
      isPlaying: false,
      stats: initialStats,
    })
  },

  // Add a new token to the simulation
  addToken: content => {
    const { tokens, experts } = get()
    const tokenId = `token-${Date.now()}`
    let newToken = generateToken(tokenId)
    
    // If custom content provided, use it
    if (content) {
      newToken.content = content
    }
    
    // Assign a stable position for this token
    // Find a position that doesn't overlap with existing tokens
    const existingPositions = tokens.map(t => t.position)
    const centerX = 450
    const centerY = 325
    const maxRadius = Math.min(300, 100 + tokens.length * 5)
    const minDistance = 32  // Reduced from 40 to fit smaller circles
    
    let position = { x: centerX, y: centerY }
    let attempts = 0
    const maxAttempts = 100
    
    // Try to find a non-overlapping position
    while (attempts < maxAttempts) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * maxRadius * 0.7
      const testPos = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      }
      
      // Check if this position is far enough from all existing tokens
      const isTooClose = existingPositions.some(existingPos => {
        const dx = testPos.x - existingPos.x
        const dy = testPos.y - existingPos.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < minDistance
      })
      
      if (!isTooClose) {
        position = testPos
        break
      }
      
      attempts++
    }
    
    // Assign the stable position to the token
    newToken.position = position
    
    // Route the token to experts
    const topK = useMoeStore.getState().topK
    newToken = routeToken(newToken, experts, topK)
    
    // Record routing decisions
    newToken.targetExperts.forEach((expertId, index) => {
      get().recordRouting({
        tokenId: newToken.id,
        expertId,
        weight: newToken.routingWeights[index],
        timestamp: Date.now(),
      })
      
      // Mark expert as active
      get().updateExpert(expertId, { isActive: true })
    })
    
    set({ tokens: [...tokens, newToken] })
    
    // Calculate processing time based on expert load (realistic!)
    // Base time: 3 seconds
    // + 0.5s for each token already on the same experts
    // + random jitter (±10%)
    const expertLoads = newToken.targetExperts.map(expertId => {
      // Count how many other tokens are currently processing on this expert
      const tokensOnExpert = get().tokens.filter(
        t => t.status === 'processing' && t.targetExperts.includes(expertId)
      ).length
      return tokensOnExpert
    })
    
    // Use the maximum load across all target experts
    const maxLoad = Math.max(...expertLoads, 0)
    const baseProcessingTime = 3000 // 3 seconds
    const loadPenalty = maxLoad * 500 // +0.5s per token on same expert
    const jitter = (Math.random() - 0.5) * 0.2 // ±10% random variance
    const processingTime = Math.round((baseProcessingTime + loadPenalty) * (1 + jitter))
    
    // Auto-progress token through states
    setTimeout(() => {
      get().updateToken(tokenId, { 
        status: 'processing',
        ffnStage: 'input'
      })
      
      // Progress through FFN stages once, then stop at output
      const ffnStages: Array<'ffn1' | 'relu' | 'ffn2' | 'output'> = 
        ['ffn1', 'relu', 'ffn2', 'output']
      const stageTime = processingTime / (ffnStages.length + 1)
      ffnStages.forEach((stage, index) => {
        setTimeout(() => {
          get().updateToken(tokenId, { ffnStage: stage })
        }, stageTime * (index + 1))
      })
      
      // After processing, mark as complete and remove
      setTimeout(() => {
        get().updateToken(tokenId, { status: 'complete', ffnStage: 'output' })
        
        // Increment expert load and deactivate
        newToken.targetExperts.forEach(expertId => {
          get().incrementExpertLoad(expertId)
          get().updateExpert(expertId, { isActive: false })
        })
        
        // Remove token after brief delay
        setTimeout(() => {
          get().removeToken(tokenId)
          get().updateStats()
        }, 1000) // Show complete state for 1 second
      }, processingTime)
    }, 100)
  },

  // Update a specific token
  updateToken: (tokenId, updates) => {
    set(state => ({
      tokens: state.tokens.map(token =>
        token.id === tokenId ? { ...token, ...updates } : token
      ),
    }))
  },

  // Remove a token (when processing is complete)
  removeToken: tokenId => {
    set(state => ({
      tokens: state.tokens.filter(token => token.id !== tokenId),
    }))
  },

  // Update a specific expert
  updateExpert: (expertId, updates) => {
    set(state => ({
      experts: state.experts.map(expert =>
        expert.id === expertId ? { ...expert, ...updates } : expert
      ),
    }))
  },

  // Increment expert's load count
  incrementExpertLoad: expertId => {
    set(state => ({
      experts: state.experts.map(expert =>
        expert.id === expertId ? { ...expert, loadCount: expert.loadCount + 1 } : expert
      ),
    }))
  },

  // Playback controls
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayback: () => set(state => ({ isPlaying: !state.isPlaying })),

  // Record a routing decision
  recordRouting: decision => {
    set(state => ({
      routingHistory: [...state.routingHistory, decision],
    }))
  },

  // Update statistics
  updateStats: () => {
    const { experts, routingHistory } = get()

    const loads = experts.map(e => e.loadCount)
    const totalLoad = loads.reduce((sum, load) => sum + load, 0)
    const maxLoad = Math.max(...loads, 0)
    const minLoad = Math.min(...loads, 0)
    const avgLoad = experts.length > 0 ? totalLoad / experts.length : 0

    // Check if load is balanced (within 20% of average)
    const isBalanced = experts.every(
      expert => Math.abs(expert.loadCount - avgLoad) <= avgLoad * 0.2
    )

    set({
      stats: {
        totalTokensProcessed: routingHistory.length,
        avgExpertUtilization: avgLoad,
        maxExpertLoad: maxLoad,
        minExpertLoad: minLoad,
        isBalanced,
      },
    })
  },

  // Animation state management
  setAnimationState: state => {
    set(prevState => ({
      animationState: { ...prevState.animationState, ...state },
    }))
  },

  resetAnimation: () => {
    set({ animationState: initialAnimationState })
  },
}))


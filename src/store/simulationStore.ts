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
  completeExpertBatch: (expertId: number) => void

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
  auxiliaryLoss: 0,
  loadImbalanceFactor: 0,
  expertUtilization: [],
  tokensPerExpert: [],
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
      batchStartTime: null,
      batchProcessingTime: null,
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
    newToken.status = 'routing'

    // Record routing decisions
    newToken.targetExperts.forEach((expertId, index) => {
      get().recordRouting({
        tokenId: newToken.id,
        expertId,
        weight: newToken.routingWeights[index],
        timestamp: Date.now(),
        gatingProbabilities: newToken.gatingProbabilities,
      })
    })
    
    set({ tokens: [...tokens, newToken] })
    
    // Update stats after adding token
    get().updateStats()
    
    const routingDelay = 800 // Time for lines to draw
    setTimeout(() => {
      // Check if token still exists
      const token = get().tokens.find(t => t.id === tokenId)
      if (!token) return

      get().updateToken(tokenId, { 
        status: 'processing',
        ffnStage: 'input'
      })
      
      token.targetExperts.forEach((expertId) => {
        const expert = get().experts.find(e => e.id === expertId)
        if (expert && !expert.isActive) {
          const batchSize = get().tokens.filter(t =>
            (t.status === 'routing' || t.status === 'processing') &&
            t.targetExperts.includes(expertId)
          ).length

          // Processing time scales significantly with batch size
          // Base: 2 seconds, +1.5s per additional token
          // 1 token = 2s, 2 tokens = 7s, 3 tokens = 12s, 4 tokens = 17s
          const baseTime = 2000
          const timePerToken = 500
          const processingTime = baseTime + (batchSize - 1) * timePerToken

          get().updateExpert(expertId, {
            isActive: true,
            batchStartTime: Date.now(),
            batchProcessingTime: processingTime
          })

          setTimeout(() => {
            get().completeExpertBatch(expertId)
          }, processingTime)
        }
      })

      // Progress token through FFN stages for visualization
      const avgProcessingTime = 3000
      const ffnStages: Array<'ffn1' | 'relu' | 'ffn2' | 'output'> = 
        ['ffn1', 'relu', 'ffn2', 'output']
      const stageTime = avgProcessingTime / (ffnStages.length + 1)

      ffnStages.forEach((stage, index) => {
        setTimeout(() => {
          const currentToken = get().tokens.find(t => t.id === tokenId)
          if (currentToken && currentToken.status === 'processing') {
            get().updateToken(tokenId, { ffnStage: stage })
          }
        }, stageTime * (index + 1))
      })
    }, routingDelay)
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

  // Complete all tokens in an expert's batch
  completeExpertBatch: expertId => {
    const { tokens } = get()

    const batchTokens = tokens.filter(
      t => t.status === 'processing' && t.targetExperts.includes(expertId)
    )

    // Mark all tokens as complete
    batchTokens.forEach(token => {
      get().updateToken(token.id, { status: 'complete', ffnStage: 'output' })
    })

    // Deactivate expert
    get().updateExpert(expertId, {
      isActive: false,
      batchStartTime: null,
      batchProcessingTime: null,
      loadCount: get().experts.find(e => e.id === expertId)!.loadCount + batchTokens.length
    })

    setTimeout(() => {
      const completeTokens = get().tokens.filter(t => t.status === 'complete')

      completeTokens.forEach(token => {
        // Check if ALL of this token's experts are done processing
        const allExpertsDone = token.targetExperts.every(expId => {
          const expert = get().experts.find(e => e.id === expId)
          return expert?.isActive === false
        })

        if (allExpertsDone) {
          get().removeToken(token.id)
        }
      })
      get().updateStats()
    }, 1000)
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

    // Calculate auxiliary loss: L_aux = N * Σ(f_e * P_e)
    // where:
    // - N = number of experts
    // - f_e = fraction of tokens dispatched to expert e
    // - P_e = average gating probability for expert e
    let auxiliaryLoss = 0
    if (totalLoad > 0 && routingHistory.length > 0) {
      const avgGatingProbs = new Array(experts.length).fill(0)
      const tokenGatingProbs = new Map<string, number[]>()
      routingHistory.forEach(decision => {
        if (!tokenGatingProbs.has(decision.tokenId) && decision.gatingProbabilities) {
          tokenGatingProbs.set(decision.tokenId, decision.gatingProbabilities)
        }
      })
      tokenGatingProbs.forEach(probs => {
        probs.forEach((prob, expertIdx) => {
          avgGatingProbs[expertIdx] += prob
        })
      })
      const numTokens = tokenGatingProbs.size
      avgGatingProbs.forEach((sum, idx) => {
        avgGatingProbs[idx] = sum / numTokens
      })
      
      const dispatchFractions = loads.map(load => load / totalLoad)
      const dotProduct = dispatchFractions.reduce((sum, f_e, expertIdx) => {
        const P_e = avgGatingProbs[expertIdx]
        return sum + (f_e * P_e)
      }, 0)
      auxiliaryLoss = experts.length * dotProduct
    }
    
    // CV = (standard deviation) / mean
    const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / experts.length
    const stdDev = Math.sqrt(variance)
    const loadImbalanceFactor = avgLoad > 0 ? stdDev / avgLoad : 0
    const expertUtilization = totalLoad > 0 
      ? loads.map(load => (load / totalLoad) * 100)
      : loads.map(() => 0)
    const tokensPerExpert = [...loads]

    set({
      stats: {
        totalTokensProcessed: routingHistory.length,
        avgExpertUtilization: avgLoad,
        maxExpertLoad: maxLoad,
        minExpertLoad: minLoad,
        isBalanced,
        auxiliaryLoss,
        loadImbalanceFactor,
        expertUtilization,
        tokensPerExpert,
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


import { create } from 'zustand'
import type { Expert, Token, RoutingDecision, MoeStats } from '../types/moe.types'
import { initializeExperts, generateToken } from '../utils/moeInitialization'

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

  // Actions - Initialization
  initializeSimulation: (numExperts: number) => void
  reset: () => void

  // Actions - Token management
  addToken: () => void
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
}

const initialStats: MoeStats = {
  totalTokensProcessed: 0,
  avgExpertUtilization: 0,
  maxExpertLoad: 0,
  minExpertLoad: 0,
  isBalanced: true,
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  experts: [],
  tokens: [],
  routingHistory: [],
  isPlaying: false,
  currentTime: 0,
  stats: initialStats,

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
  addToken: () => {
    const { tokens } = get()
    const newToken = generateToken(`token-${Date.now()}`)
    set({ tokens: [...tokens, newToken] })
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
}))


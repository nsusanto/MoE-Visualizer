import { create } from 'zustand'
import { useSimulationStore } from './simulationStore'

// Define the shape of our store
interface MoeStore {
  // Configuration values
  numExperts: number
  topK: number
  animationSpeed: number

  // Functions to update them
  setNumExperts: (value: number) => void
  setTopK: (value: number) => void
  setAnimationSpeed: (value: number) => void

  // Reset to defaults
  resetConfig: () => void
}

// Default configuration
const defaultConfig = {
  numExperts: 8,
  topK: 2,
  animationSpeed: 5,
}

// Create the store
export const useMoeStore = create<MoeStore>(set => ({
  // Initial state
  numExperts: defaultConfig.numExperts,
  topK: defaultConfig.topK,
  animationSpeed: defaultConfig.animationSpeed,

  // Setters
  setNumExperts: value => {
    set(state => ({
      numExperts: value,
      // Ensure topK never exceeds numExperts
      topK: Math.min(state.topK, value),
    }))
    // Re-initialize simulation with new number of experts
    useSimulationStore.getState().initializeSimulation(value)
  },

  setTopK: value => set({ topK: value }),

  setAnimationSpeed: value => set({ animationSpeed: value }),

  // Reset everything to defaults
  resetConfig: () => {
    set(defaultConfig)
    // Re-initialize simulation with default number of experts
    useSimulationStore.getState().initializeSimulation(defaultConfig.numExperts)
  },
}))

// Initialize simulation on app load
useSimulationStore.getState().initializeSimulation(defaultConfig.numExperts)


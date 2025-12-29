import { useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { useMoeStore } from '../../store/moeStore'
import { computeGatingScores, selectTopK } from '../../utils/routing'
import type { Token } from '../../types/moe.types'
import styles from './AnimationPanel.module.css'

function AnimationPanel() {
  const experts = useSimulationStore(state => state.experts)
  const tokens = useSimulationStore(state => state.tokens)
  const topK = useMoeStore(state => state.topK)
  const addToken = useSimulationStore(state => state.addToken)

  const MAX_TOKENS = 20

  const [input, setInput] = useState('')
  const setAnimationState = useSimulationStore(state => state.setAnimationState)
  const resetAnimation = useSimulationStore(state => state.resetAnimation)
  const animationState = useSimulationStore(state => state.animationState)

  const [inputTokens, setInputTokens] = useState<string[]>([])

  const runAnimation = async () => {
    if (!input.trim()) return

    // Validate token count before processing
    const words = input.trim().split(/\s+/).filter(w => w.length > 0)
    if (tokens.length + words.length > MAX_TOKENS) {
      alert(
        `Cannot process: This would create ${words.length} tokens, but you already have ${tokens.length}/${MAX_TOKENS}.\n\nYou can only add ${MAX_TOKENS - tokens.length} more token(s).`
      )
      return
    }

    setAnimationState({ isPlaying: true })

    // Step 1: Tokenizing
    setAnimationState({ currentStep: 'tokenizing' })
    setInputTokens(words)
    await sleep(2000)

    // Step 2: Scoring
    setAnimationState({ currentStep: 'scoring' })
    // Compute scores for all tokens at once (batch processing)
    const allTokenScores: number[][] = []
    for (const word of words) {
      const mockToken = { content: word } as Token
      const tokenScores = computeGatingScores(mockToken, experts)
      allTokenScores.push(tokenScores)
    }
    // Show scores for FIRST token only (for visualization clarity)
    const firstTokenScores = allTokenScores[0] || []
    setAnimationState({ expertScores: firstTokenScores })
    await sleep(2000)

    // Step 3: Selecting Top-K (for each token in parallel)
    setAnimationState({ currentStep: 'selecting' })
    const allSelectedExperts: number[][] = []
    for (const tokenScores of allTokenScores) {
      const topExperts = selectTopK(tokenScores, topK)
      allSelectedExperts.push(topExperts)
    }
    // Show selected experts for FIRST token only (for histogram visualization)
    const firstTokenSelectedExperts = allSelectedExperts[0] || []
    // Show all unique experts across all tokens (for main view highlighting)
    const allUniqueExperts = [...new Set(allSelectedExperts.flat())]
    setAnimationState({ 
      selectedExperts: firstTokenSelectedExperts,
      allSelectedExperts: allUniqueExperts
    })
    await sleep(2000)

    // Step 4: Routing (all tokens routed simultaneously)
    setAnimationState({ currentStep: 'routing' })
    await sleep(2000)

    // Add tokens with staggered timing (100ms between each) for cinematic effect
    for (let i = 0; i < words.length; i++) {
      addToken(words[i])
      if (i < words.length - 1) {
        await sleep(100) // Stagger arrival
      }
    }

    // Step 5: Complete
    setAnimationState({ currentStep: 'complete' })
    await sleep(2000)

    // Reset
    reset()
  }

  const reset = () => {
    resetAnimation()
    setInputTokens([])
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Calculate how many tokens the current input would create
  const inputWordCount = input.trim() ? input.trim().split(/\s+/).filter(w => w.length > 0).length : 0
  const wouldExceedLimit = tokens.length + inputWordCount > MAX_TOKENS

  const getStepDescription = () => {
    const { currentStep } = animationState

    switch (currentStep) {
      case 'idle':
        return 'Enter text to tokenize and route through the MoE network'
      case 'tokenizing':
        return `Tokenizing: Split input into ${inputTokens.length} tokens`
      case 'scoring':
        return `Scoring: Computing gating scores for all ${inputTokens.length} token(s) in parallel`
      case 'selecting':
        return `Selecting: Choosing top-${topK} experts for each token`
      case 'routing':
        return `Routing: All ${inputTokens.length} tokens to their experts`
      case 'complete':
        return `Complete! ${inputTokens.length} token(s) have been routed in parallel`
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h3>Tokenize & Route</h3>
          <p className={styles.description}>
            Enter text to see the step-by-step MoE routing process (each word becomes a
            token)
          </p>
        </div>
        <div className={styles.tokenCounter}>
          {tokens.length}/{MAX_TOKENS} tokens
        </div>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                // Check if button would be enabled
                if (
                  animationState.currentStep === 'idle' &&
                  input.trim() &&
                  tokens.length < MAX_TOKENS &&
                  !wouldExceedLimit
                ) {
                  runAnimation()
                }
              }
            }}
            placeholder="e.g., hello world from MoE"
            className={styles.input}
            disabled={animationState.currentStep !== 'idle'}
            maxLength={100}
          />
          {inputWordCount > 0 && (
            <span
              className={`${styles.wordCount} ${wouldExceedLimit ? styles.exceeded : ''}`}
            >
              +{inputWordCount} token{inputWordCount !== 1 ? 's' : ''}
              {wouldExceedLimit && ' ⚠️'}
            </span>
          )}
        </div>
        <button
          onClick={runAnimation}
          disabled={
            animationState.currentStep !== 'idle' ||
            !input.trim() ||
            tokens.length >= MAX_TOKENS ||
            wouldExceedLimit
          }
          className={styles.animateButton}
        >
          {animationState.currentStep !== 'idle' ? 'Animating...' : 'Process Tokens'}
        </button>
      </div>

      <div className={styles.statusSection}>
        {/* Routing Histogram - shows expert scores and top-K selection */}
        <div className={styles.routingHistogram}>
          <div className={styles.histogramContent}>
              <h4 className={styles.histogramTitle}>
                {animationState.expertScores.length > 0
                  ? <>Router Scores for <strong>{inputTokens[0] || 'token'}</strong></>
                  : 'Router Scores'}
                {animationState.currentStep === 'selecting' && animationState.expertScores.length > 0 && ` - Top-${topK} Selected`}
              </h4>
            <div className={styles.barsContainer}>
              {experts.map((expert, idx) => {
                const score = animationState.expertScores[idx] || 0
                const isSelected = animationState.selectedExperts.includes(idx)
                const showSelection = ['selecting', 'routing', 'complete'].includes(animationState.currentStep)
                const maxScore = Math.max(...animationState.expertScores, 0.01)
                const scaledHeight = (score / maxScore) * 100
                
                return (
                  <div key={expert.id} className={styles.barColumn}>
                    <div className={styles.barWrapper}>
                      <div 
                        className={`${styles.bar} ${showSelection && isSelected ? styles.barSelected : ''}`}
                        style={{ 
                          height: scaledHeight,
                          backgroundColor: expert.color,
                          opacity: showSelection && !isSelected ? 0.3 : 0.8
                        }}
                      >
                        {score > 0.08 && scaledHeight > 30 && (
                          <span className={styles.barLabel}>{score.toFixed(3)}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.expertLabel}>
                      <div 
                        className={styles.expertColorDot} 
                        style={{ backgroundColor: expert.color }}
                      />
                      <span className={styles.expertNameLabel}>E{expert.id + 1}</span>
                      {showSelection && isSelected && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className={styles.statusMessage}>{getStepDescription()}</div>
      </div>
    </div>
  )
}

export default AnimationPanel


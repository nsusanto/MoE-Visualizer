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

  const MAX_TOKENS = 18

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

    // Step 1: Tokenizing (show all tokens being split)
    setAnimationState({ currentStep: 'tokenizing' })
    setInputTokens(words)
    await sleep(2000)

    // Step 2: Scoring (ALL tokens scored in parallel - like real MoE!)
    setAnimationState({ currentStep: 'scoring' })
    // Compute scores for all tokens at once (batch processing)
    const allTokenScores: number[][] = []
    for (const word of words) {
      const mockToken = { content: word } as Token
      const tokenScores = computeGatingScores(mockToken, experts)
      allTokenScores.push(tokenScores)
    }
    // Show aggregate scores (average across all tokens)
    const aggregateScores = experts.map((_, expertIdx) => {
      const sum = allTokenScores.reduce((acc, scores) => acc + scores[expertIdx], 0)
      return sum / allTokenScores.length
    })
    setAnimationState({ expertScores: aggregateScores })
    await sleep(2000)

    // Step 3: Selecting Top-K (for each token in parallel)
    setAnimationState({ currentStep: 'selecting' })
    const allSelectedExperts: number[][] = []
    for (const tokenScores of allTokenScores) {
      const topExperts = selectTopK(tokenScores, topK)
      allSelectedExperts.push(topExperts)
    }
    // Show all unique experts that will be used
    const allUniqueExperts = [...new Set(allSelectedExperts.flat())]
    setAnimationState({ selectedExperts: allUniqueExperts })
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
        return `Tokenizing: Split input into ${inputTokens.length} token(s)`
      case 'scoring':
        return `Scoring: Computing gating scores for ALL ${inputTokens.length} token(s) in parallel (batch processing)`
      case 'selecting':
        return `Selecting: Choosing top-${topK} experts for each token simultaneously`
      case 'routing':
        return `Routing: All ${inputTokens.length} token(s) routed to their experts at once!`
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
        <div className={styles.stepIndicator}>
          <div
            className={`${styles.step} ${animationState.currentStep !== 'idle' ? styles.active : ''}`}
          >
            1. Tokenize
          </div>
          <div
            className={`${styles.step} ${['scoring', 'selecting', 'routing', 'complete'].includes(animationState.currentStep) ? styles.active : ''}`}
          >
            2. Score
          </div>
          <div
            className={`${styles.step} ${['selecting', 'routing', 'complete'].includes(animationState.currentStep) ? styles.active : ''}`}
          >
            3. Select Top-K
          </div>
          <div
            className={`${styles.step} ${['routing', 'complete'].includes(animationState.currentStep) ? styles.active : ''}`}
          >
            4. Route
          </div>
        </div>

        <div className={styles.statusMessage}>{getStepDescription()}</div>
      </div>
    </div>
  )
}

export default AnimationPanel


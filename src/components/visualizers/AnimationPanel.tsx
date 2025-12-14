import { useState } from 'react'
import { useSimulationStore } from '../../store/simulationStore'
import { useMoeStore } from '../../store/moeStore'
import { computeGatingScores, selectTopK } from '../../utils/routing'
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

    setAnimationState({ isPlaying: true })

    // Step 1: Tokenizing
    setAnimationState({ currentStep: 'tokenizing' })
    const words = input.trim().split(/\s+/).filter(w => w.length > 0)
    setInputTokens(words)
    await sleep(1000)

    // Process each token
    for (let i = 0; i < words.length; i++) {
      setAnimationState({ currentTokenIndex: i })

      // Step 2: Scoring
      setAnimationState({ currentStep: 'scoring' })
      const mockToken = { content: words[i] } as any
      const tokenScores = computeGatingScores(mockToken, experts)
      setAnimationState({ expertScores: tokenScores })
      await sleep(1500)

      // Step 3: Selecting Top-K
      setAnimationState({ currentStep: 'selecting' })
      const topExperts = selectTopK(tokenScores, topK)
      setAnimationState({ selectedExperts: topExperts })
      await sleep(1500)

      // Step 4: Routing
      setAnimationState({ currentStep: 'routing' })
      // Weights are normalized and will be applied when token is added
      await sleep(1500)

      // Add to visualization
      addToken(words[i])
    }

    // Step 5: Complete
    setAnimationState({ currentStep: 'complete' })
    await sleep(1500)

    // Reset
    reset()
  }

  const reset = () => {
    resetAnimation()
    setInputTokens([])
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const getStepDescription = () => {
    const { currentStep, currentTokenIndex } = animationState

    switch (currentStep) {
      case 'idle':
        return 'Enter text to tokenize and route through the MoE network'
      case 'tokenizing':
        return `Tokenizing: Split input into ${inputTokens.length} word(s)`
      case 'scoring':
        return `Scoring: Computing gating scores for token "${inputTokens[currentTokenIndex]}"`
      case 'selecting':
        return `Selecting: Choosing top-${topK} experts with highest scores`
      case 'routing':
        return `Routing: Normalizing weights and routing token to selected experts`
      case 'complete':
        return 'Complete! Tokens have been routed to experts'
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
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g., hello world from MoE"
          className={styles.input}
          disabled={animationState.currentStep !== 'idle'}
          maxLength={100}
        />
        <button
          onClick={runAnimation}
          disabled={
            animationState.currentStep !== 'idle' ||
            !input.trim() ||
            tokens.length >= MAX_TOKENS
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

      {animationState.currentStep !== 'idle' && (
        <div className={styles.detailsSection}>
          {animationState.currentStep === 'tokenizing' && (
            <div className={styles.detail}>
              <strong>Tokens:</strong> {inputTokens.map(t => `"${t}"`).join(', ')}
            </div>
          )}

          {(animationState.currentStep === 'scoring' ||
            animationState.currentStep === 'selecting' ||
            animationState.currentStep === 'routing') && (
            <>
              <div className={styles.detail}>
                <strong>Current Token:</strong> "{inputTokens[animationState.currentTokenIndex]}"
              </div>

              {animationState.expertScores.length > 0 && (
                <div className={styles.scoresGrid}>
                  {experts.slice(0, 8).map(expert => {
                    const isSelected = animationState.selectedExperts.includes(expert.id)
                    return (
                      <div
                        key={expert.id}
                        className={`${styles.expertScore} ${isSelected ? styles.selected : ''}`}
                      >
                        <div
                          className={styles.expertColor}
                          style={{ backgroundColor: expert.color }}
                        />
                        <div className={styles.expertInfo}>
                          <div className={styles.expertName}>{expert.name}</div>
                          <div className={styles.score}>
                            Score: {animationState.expertScores[expert.id]?.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default AnimationPanel


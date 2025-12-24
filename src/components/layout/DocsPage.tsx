import { Link } from 'react-router-dom'
import styles from './DocsPage.module.css'

function DocsPage() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoText}>MoE Visualizer</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">Home</Link>
            <a href="/visualizer">Demo</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          {/* What is MoE */}
          <section className={styles.section}>
            <h2>What the helly is Mixture of Experts?</h2>
            <p>
              Mixture of Experts (MoE) is a neural network architecture that uses multiple specialized 
              sub-networks (experts) to process different parts of the input. Instead of routing all data 
              through the same network, a <strong>gating network</strong> learns to dynamically select which 
              experts should process each token.
            </p>

            <div className={styles.infoBox}>
              <h4>Key Benefits</h4>
              <ul>
                <li><strong>Scalability:</strong> Increase model capacity without proportionally increasing compute</li>
                <li><strong>Specialization:</strong> Experts specialize in different syntactic patterns (e.g. verbs, nouns, adjectives, etc.)</li>
                <li><strong>Sparse activation:</strong> Only activate a subset of experts per token</li>
              </ul>
            </div>
          </section>

          {/* How it Works */}
          <section className={styles.section}>
              <h3>MoE consists of two key components:</h3>
              <ul>
                <li>
                  <strong>Router (Gate Network):</strong> A learned network that decides which experts should process 
                  each token. For every input, it computes a score for each expert and selects the top-K 
                  highest-scoring ones to handle that token.
                </li>
                <li>
                  <strong>Experts:</strong> A set of specialized Feed-Forward Neural Networks (FFNNs). Instead of 
                  one shared FFNN processing all tokens, MoE has multiple expert FFNNs, each learning to handle 
                  different patterns or input types (Usually syntactic patterns like verbs, nouns, adjectives, etc.).
                </li>
                <div className={styles.imageContainer}>
                  <img src="/assets/expert_specialization.png" alt="Expert Specialization" className={styles.image} />
                  <p className={styles.imageCaption}>Each expert specializes in different syntactic patterns during training</p>
                </div>
              </ul>

            <h3>Sparse vs. Dense Models</h3>
            <p>
              To understand MoE, it's important to contrast it with traditional dense models:
            </p>
            
            <div className={styles.techDetail}>
              <h4>Dense Model (Traditional)</h4>
              <p>
                In a standard transformer, every token passes through the <strong>same Feed-Forward Neural Network (FFNN) </strong> 
                at each layer. This means:
              </p>
              <ul>
                <li>All parameters are activated for every token</li>
                <li>Computation scales linearly with model size</li>
                <li>Simple and stable, but inefficient for very large models</li>
              </ul>
              <div className={styles.imageContainer}>
                <img src="/assets/dense_model.png" alt="Dense MoE Model Architecture" className={styles.image} />
                <p className={styles.imageCaption}>Dense MoE architecture: All experts are selected and activated per token</p>
              </div>
            </div>

            <div className={styles.techDetail}>
              <h4>Sparse Model (MoE)</h4>
              <p>
                In MoE, each FFNN layer is replaced by <strong>multiple expert FFNNs</strong>, but only a subset 
                of experts process each token. This means:
              </p>
              <ul>
                <li>Only top-K experts are activated per token <strong>(sparse activation)</strong></li>
                <li>Computation remains constant regardless of total expert count</li>
                <li>More complex to train, but enables massive model scaling</li>

              </ul>
              <div className={styles.imageContainer}>
                <img src="/assets/sparse_model.png" alt="Sparse MoE Model Architecture" className={styles.image} />
                <p className={styles.imageCaption}>Sparse MoE architecture: Only selected experts (highlighted) are activated per token</p>
              </div>
            </div>



            <h3>Step-by-Step Process:</h3>

              <h3>1. Gating Network (Router)</h3>
              <div className={styles.imageContainer}>
                    <img src="/assets/routing_diagram.png" alt="MoE Routing Diagram" className={styles.image} />
                    <p className={styles.imageCaption}>Token routing process: Gating → Top-K Selection → Expert Processing</p>
                </div>
              <p>
                For each input token, the gating network computes a score for every expert.
              </p>
              
              <h4>Step 1a: Linear Transformation</h4>
              <p>
                First, the token embedding is multiplied by the gating weight matrix <code>W_gate</code>:
              </p>
              <pre className={styles.codeBlock}>
                <code>h = token_embedding * W_gate</code>
              </pre>
              
              <div className={styles.imageContainer}>
                <img src="/assets/x_times_w.png" alt="Matrix multiplication h = x × W" className={styles.image} />
                <p className={styles.imageCaption}>Linear transformation: token embedding (x) multiplied by weight matrix (W)</p>
              </div>
              
              <p>
                Where:
              </p>
              <ul>
                <li><code>token_embedding</code>: Vector representation of the input token (e.g., 512 dimensions)</li>
                <li><code>W_gate</code>: Learned weight matrix (e.g., 512 × num_experts)</li>
                <li><code>h</code>: Raw logits/scores for each expert (one score per expert)</li>
              </ul>
              
              <h4>Step 1b: Softmax Normalization</h4>
              <p>
                The raw scores are then normalized using the softmax function to produce probabilities:
              </p>
              <pre className={styles.codeBlock}>
                <code>scores = softmax(h)</code>
              </pre>
              
              <div className={styles.imageContainer}>
                <img src="/assets/softmax.png" alt="Softmax function" className={styles.image} />
                <p className={styles.imageCaption}>Softmax converts raw scores into a probability distribution that sums to 1</p>
              </div>
              
              <p>
                Softmax ensures all scores are between 0-1 and all scores sum to exactly 1. The result is a probability distribution over all experts, indicating how suitable each expert 
                is for processing this particular token.
              </p>
              <h4>Step 1c: Repeat!</h4>
                <div className={styles.imageContainer}>
                    <img src="/assets/expert_layers.png" alt="Expert FFN Layers" className={styles.image} />
                    <p className={styles.imageCaption}>Multi-layer MoE architecture: Each token goes through multiple MoE layers</p>
                </div>
                <p>
                  At each MoE layer, the router independently computes scores and selects experts for every token. 
                  This means a token may be routed to <strong>different experts at different layers</strong>.
                  Each layer's routing decision is independent and learned during training.
                </p>
              <h3>2. Top-K Selection</h3>
              <p>
                Instead of using all experts, we select only the <strong>top-K</strong> experts with 
                the highest scores. Common values: K=1 or K=2.
              </p>

              <div className={styles.infoBox}>
                <strong>Trade-off:</strong> Higher K = more compute but potentially better quality. 
                Lower K = faster but experts must be more specialized.
              </div>

              <h3>3. Token Routing</h3>
              <p>
                Each token is routed to its top-K selected experts. Tokens assigned to the same 
                expert are batched together for efficient processing.
              </p>
              <div>
              <h4>Batch Processing</h4>
              <p>
                Tokens routed to the same expert are batched together for efficiency:
              </p>
              <ul>
                <li>Input shape changes from <code>[1, 512]</code> to <code>[batch_size, 512]</code></li>
                <li>Processing time scales with batch size</li>
                <li>All tokens in a batch complete simultaneously</li>
              </ul>
            </div>
              <h3>4. Expert Processing (FFN)</h3>
              <p>
                Each expert is a Feed-Forward Network (FFN) that transforms the input:
              </p>
              <pre className={styles.codeBlock}>
                <code>FFN(x) = W₂ × ReLU(W₁ × x)</code>
              </pre>

              <p>
                Where:
              </p>
              <ul>
                <li><strong>W₁:</strong> First linear layer (token_embedding → hidden_dimensions)</li>
                <li><strong>ReLU:</strong> Activation function (element-wise)</li>
                <li><strong>W₂:</strong> Second linear layer (hidden_dimensions → token_embedding)</li>
              </ul>

              <h3>5. Output Combination</h3>
              <p>
                The outputs from selected experts are weighted by their gating scores and summed:
              </p>
              <pre className={styles.codeBlock}>
                <code>output = Σ (score_i × expert_i(token))</code>
              </pre>
          </section>

          {/* Load Balancing */}
          <section className={styles.section}>
            <h2>Load Balancing Challenge</h2>
            <p>
              A key challenge in MoE is <strong>load balancing</strong>. Without constraints, the gating 
              network often learns to overuse a few "favorite" experts while ignoring others.
            </p>
            <div className={styles.infoBox}>
              <h4>Why This Happens</h4>
              <ul>
                <li>The gating network optimizes for accuracy, not balance</li>
                <li>Popular experts get more gradient updates, improving faster</li>
                <li>Creates a feedback loop: good experts → more use → better experts</li>
              </ul>
            </div>
            <p>
              Solutions include auxiliary losses, capacity constraints, and expert dropout to encourage 
              more balanced routing.
            </p>
          </section>

          {/* Getting Started */}
          <section className={styles.section}>
            <h2>Getting Started</h2>
            <ol className={styles.steps}>
              <li>Navigate to the <Link to="/visualizer">Demo</Link></li>
              <li>Enter a text prompt or word in the input box</li>
              <li>Click "Process Tokens" or press Enter</li>
              <li>Watch the token get scored, routed, and processed</li>
              <li>Click on experts to see FFN internals</li>
              <li>Adjust controls to experiment with different configurations</li>
              <li>Add more tokens to see batch processing and load distribution</li>
            </ol>
          </section>

          {/* Resources */}
          <section className={styles.section}>
            <h2>Further Reading</h2>
            <ul className={styles.resources}>
              <li>
                <a href="https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-mixture-of-experts" target="_blank" rel="noopener noreferrer">
                  A Visual Guide to Mixture of Experts
                </a> (Maarten Grootendorst - Comprehensive visual explanations with 50+ diagrams. Diagrams in this documentation are sourced from this excellent guide.)
              </li>
              <li>
                <a href="https://arxiv.org/abs/1701.06538" target="_blank" rel="noopener noreferrer">
                  Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer
                </a> (Original MoE Paper)
              </li>
              <li>
                <a href="https://arxiv.org/abs/2101.03961" target="_blank" rel="noopener noreferrer">
                  Switch Transformers: Scaling to Trillion Parameter Models
                </a> (Google's Switch Transformer)
              </li>
              <li>
                <a href="https://huggingface.co/blog/moe" target="_blank" rel="noopener noreferrer">
                  Mixture of Experts Explained
                </a> (Hugging Face Blog)
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Built with React, TypeScript, and SVG</p>
          <div className={styles.footerLinks}>
            <a href="https://github.com/nsusanto/MoE-Visualizer" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Link to="/">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DocsPage


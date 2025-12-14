# MoE Visualizer

An interactive visualization tool for Mixture of Experts (MoE) models built with React.

## Overview

MoE Visualizer helps users understand and visualize how Mixture of Experts models work. It provides interactive demonstrations of:

- **Expert Routing**: Visualize how tokens are routed to different experts
- **Load Balancing**: Monitor expert utilization and load distribution
- **Gating Mechanism**: Understand how the gating network decides expert selection
- **Architecture Overview**: Interactive diagrams of MoE model architecture
- **Performance Metrics**: Real-time visualization of expert performance and statistics

## Features (Planned)

- 🎨 **Interactive Visualizations**: Dynamic, animated representations of MoE processes
- 📊 **Real-time Analytics**: Live charts showing expert utilization and performance
- 🔄 **Token Flow Animation**: Watch how inputs flow through the expert network
- 📈 **Configurable Parameters**: Adjust number of experts, routing strategies, and more
- 💾 **Example Scenarios**: Pre-built examples demonstrating different MoE behaviors
- 🎓 **Educational Mode**: Step-by-step explanations of MoE concepts

## Project Structure

```
MoE-Visualizer/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── common/      # Reusable UI components
│   │   ├── visualizers/ # Visualization-specific components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── styles/          # Global styles and themes
│   ├── data/            # Sample data and configurations
│   └── App.tsx          # Main application component
├── docs/                # Additional documentation
└── tests/               # Test files
```

## Tech Stack

- **Frontend Framework**: React 18+
- **Language**: TypeScript
- **Styling**: CSS Modules / Tailwind CSS
- **Visualization**: D3.js / Three.js / React Flow
- **State Management**: React Context / Zustand
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Roadmap

### Phase 1: Foundation
- [ ] Basic project setup
- [ ] Core component structure
- [ ] Simple MoE architecture diagram

### Phase 2: Interactive Visualizations
- [ ] Token routing animation
- [ ] Expert selection visualization
- [ ] Gating network weights display

### Phase 3: Analytics & Metrics
- [ ] Real-time performance charts
- [ ] Load balancing visualizations
- [ ] Expert utilization heatmaps

### Phase 4: Advanced Features
- [ ] Multiple routing strategies
- [ ] Custom MoE configurations
- [ ] Export/share visualizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Resources

- [Mixture of Experts Explained](https://arxiv.org/abs/1701.06538)
- [Switch Transformers Paper](https://arxiv.org/abs/2101.03961)
- [GLaM: Efficient Scaling of Language Models](https://arxiv.org/abs/2112.06905)

## Acknowledgments

Inspired by the growing interest in efficient large language models and the need for better educational tools to understand complex ML architectures.


# Project Structure Guide

This document explains the organization and purpose of each directory in the MoE Visualizer project.

## Directory Overview

### `/src`
The main source code directory containing all application logic.

#### `/src/components`
React components organized by purpose:

- **`/components/common`**: Reusable UI components
  - Buttons, Cards, Modals, Inputs
  - Typography components
  - Loading spinners, tooltips
  
- **`/components/visualizers`**: MoE-specific visualization components
  - ExpertNetwork: Visual representation of expert architecture
  - TokenFlow: Animated token routing
  - GatingVisualization: Gating network weights display
  - LoadBalancingChart: Expert utilization graphs
  - PerformanceMetrics: Real-time statistics
  
- **`/components/layout`**: Layout and navigation components
  - Header, Sidebar, Footer
  - Navigation menus
  - Page containers

#### `/src/hooks`
Custom React hooks for reusable logic:
- `useMoESimulation`: Hook for MoE simulation state
- `useAnimation`: Animation control utilities
- `useVisualizationState`: Manage visualization parameters

#### `/src/utils`
Utility functions and helpers:
- `moeCalculations.ts`: Expert routing algorithms
- `animationHelpers.ts`: Animation utilities
- `dataTransforms.ts`: Data transformation functions
- `constants.ts`: Application constants

#### `/src/types`
TypeScript type definitions:
- `moe.types.ts`: MoE model types (Expert, Token, Gate, etc.)
- `visualization.types.ts`: Visualization-related types
- `api.types.ts`: API response types (if applicable)

#### `/src/styles`
Global styles and theming:
- `global.css`: Global CSS resets and base styles
- `theme.css`: CSS variables for theming
- `animations.css`: Reusable animation keyframes

#### `/src/data`
Sample data and configurations:
- `exampleMoEConfigs.ts`: Pre-built MoE configurations
- `demoScenarios.ts`: Educational demo scenarios
- `mockData.ts`: Mock data for testing

### `/public`
Static assets served directly:
- Images, icons
- Favicon
- Static JSON files

### `/docs`
Additional documentation:
- Architecture decisions
- API documentation
- Development guides
- Tutorial content

### `/tests`
Test files mirroring src structure:
- Unit tests
- Integration tests
- Component tests

## Configuration Files

- **`package.json`**: Dependencies and scripts
- **`vite.config.ts`**: Vite bundler configuration
- **`tsconfig.json`**: TypeScript compiler options
- **`.gitignore`**: Files to exclude from version control
- **`.prettierrc`**: Code formatting rules

## Development Workflow

1. **Component Development**: Create components in appropriate `/components` subdirectory
2. **Type Safety**: Define types in `/types` before implementation
3. **Utilities**: Extract reusable logic to `/utils` or `/hooks`
4. **Styling**: Use module CSS or reference global theme variables
5. **Testing**: Write tests in `/tests` mirroring source structure

## Naming Conventions

- **Components**: PascalCase (e.g., `ExpertNetwork.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useMoESimulation.ts`)
- **Utils**: camelCase (e.g., `moeCalculations.ts`)
- **Types**: PascalCase with '.types' suffix (e.g., `moe.types.ts`)
- **Constants**: UPPER_SNAKE_CASE

## Next Steps

When ready to implement:
1. Define core types in `/src/types/moe.types.ts`
2. Create basic layout components
3. Implement first visualization component
4. Add interactivity with hooks
5. Style with theme system


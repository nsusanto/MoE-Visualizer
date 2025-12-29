import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/layout/LandingPage'
import VisualizerPage from './components/layout/VisualizerPage'
import DocsPage from './components/layout/DocsPage'

function App() {
  return (
    <BrowserRouter basename="/MoE-Visualizer">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './components/layout/LandingPage'
import VisualizerPage from './components/layout/VisualizerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/visualizer" element={<VisualizerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { EditorPage } from './pages/EditorPage'
import { FillPage } from './pages/FillPage'
import { HomePage } from './pages/HomePage'
import { StatsPage } from './pages/StatsPage'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor/:id" element={<EditorPage />} />
          <Route path="/fill/:id" element={<FillPage />} />
          <Route path="/stats/:id" element={<StatsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}

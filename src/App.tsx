import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Group from '@/pages/Group'

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/g/:slug" element={<Group />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

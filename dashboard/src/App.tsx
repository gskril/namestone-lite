import { Route, Routes } from 'react-router-dom'

import { Home } from './screens/Home'

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:domain" element={<Home />} />
      </Routes>
    </main>
  )
}

export default App

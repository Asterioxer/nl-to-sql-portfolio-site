import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import ModelPage from './pages/ModelPage.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/models/:slug" element={<ModelPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

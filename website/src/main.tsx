import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import WebApp from './pages/WebApp'
import Nav from './components/Nav'
import { JoinPage } from './app/pages/JoinPage'
import { AdminRecoveryPage } from './app/pages/AdminRecoveryPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<WebApp />} />
        <Route
          path="/join/:code"
          element={
            <div style={{ paddingTop: 64 }}>
              <JoinPage />
            </div>
          }
        />
        <Route
          path="/admin/:code"
          element={
            <div style={{ paddingTop: 64 }}>
              <AdminRecoveryPage />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Demo from './pages/Demo'
import Nav from './components/Nav'
import { AppShell } from './app/AppShell'
import { AppRoutes } from './app/AppRoutes'
import { JoinPage } from './app/pages/JoinPage'
import { AdminRecoveryPage } from './app/pages/AdminRecoveryPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/app/*" element={<AppShell><AppRoutes /></AppShell>} />
        <Route path="/join/:code" element={<AppShell><JoinPage /></AppShell>} />
        <Route path="/admin/:code" element={<AppShell><AdminRecoveryPage /></AppShell>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

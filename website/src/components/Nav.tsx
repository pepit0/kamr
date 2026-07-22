import { useState, useEffect, type MouseEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'

const CREAM = '#F5EDDA'
const INK = '#1A1209'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const isApp =
    pathname.startsWith('/app') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/demo')

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  const solid = isApp || scrolled

  const goHome = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return
    e.preventDefault()
    window.scrollTo(0, 0)
    setScrolled(false)
    window.dispatchEvent(new CustomEvent('kamr-landing-reset'))
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64, display: 'flex', alignItems: 'center',
        padding: '0 clamp(16px, 5vw, 40px)', justifyContent: 'space-between',
        background: solid ? 'rgba(245,237,218,0.88)' : 'transparent',
        backdropFilter: solid ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: solid ? 'blur(20px)' : 'none',
        borderBottom: solid ? '1px solid rgba(26,18,9,0.08)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}
    >
      <Link
        to="/"
        onClick={goHome}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {/* Inline logo mark */}
        <svg width="26" height="26" viewBox="-52 -8 146 106" fill="none">
          <path
            d="M -50 92 C -48 70, -28 56, -16 64 C -4 72, -2 52, 4 56"
            stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none"
          />
          <rect x="4" y="20" width="58" height="38" rx="6" stroke={INK} strokeWidth="6" fill="none" />
          <rect x="20" y="13" width="18" height="9" rx="4" stroke={INK} strokeWidth="6" fill="none" />
          <circle cx="33" cy="39" r="11" stroke={INK} strokeWidth="6" fill="none" />
          <circle cx="33" cy="39" r="4.5" fill={INK} />
          <path
            d="M 60 20 C 70 6, 90 -6, 88 14 C 86 34, 66 32, 70 18 C 74 4, 90 8, 94 -4"
            stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none"
          />
        </svg>
        <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 24, color: INK }}>
          Kamr
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link
          to="/"
          onClick={goHome}
          style={{
            fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 400,
            color: pathname === '/' ? INK : 'rgba(26,18,9,0.5)',
            textDecoration: 'none', padding: '6px 14px', borderRadius: 999,
            transition: 'color 0.2s',
          }}
        >
          Home
        </Link>
        <Link
          to="/app"
          style={{
            fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: 500,
            color: CREAM, background: INK,
            textDecoration: 'none', padding: '8px 20px', borderRadius: 999,
            transition: 'opacity 0.2s',
          }}
        >
          Open App
        </Link>
      </div>
    </nav>
  )
}

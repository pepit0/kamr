import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

// ─── Palette ──────────────────────────────────────────────────────────────────

const CREAM  = '#F5EDDA'
const CREAM2 = '#EDE2C8'
const CREAM3 = '#DDD0B0'
const INK    = '#1A1209'
const INK2   = '#5C4F38'
const INK3   = '#9E9080'

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// Fade up + scale — used for most elements
function reveal(inView: boolean, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0) scale(1)' : 'translateY(70px) scale(0.94)',
    transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
  }
}

// Slide in from left
function revealLeft(inView: boolean, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0)' : 'translateX(-80px)',
    transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
  }
}

// Slide in from right
function revealRight(inView: boolean, delay = 0) {
  return {
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0)' : 'translateX(80px)',
    transition: `opacity 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
  }
}

// ─── Static Logo (no theme context needed) ────────────────────────────────────

function LogoMark({ size = 36, color = INK, bg = CREAM }: { size?: number; color?: string; bg?: string }) {
  const sw = 5.5
  return (
    <svg width={size} height={size} viewBox="-52 -8 146 106" fill="none">
      <path d="M -50 92 C -48 70, -28 56, -16 64 C -4 72, -2 52, 4 56"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <rect x="4" y="20" width="58" height="38" rx="6" stroke={color} strokeWidth={sw} fill="none" />
      <rect x="20" y="13" width="18" height="9" rx="4" stroke={color} strokeWidth={sw} fill="none" />
      <circle cx="33" cy="39" r="11" stroke={color} strokeWidth={sw} fill="none" />
      <circle cx="33" cy="39" r="4.5" fill={color} />
      <circle cx="30.5" cy="36.5" r="1.8" fill={bg} />
      <path d="M 60 20 C 70 6, 90 -6, 88 14 C 86 34, 66 32, 70 18 C 74 4, 90 8, 94 -4"
        stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </svg>
  )
}

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup({ variant = 'home' }: { variant?: 'home' | 'qr' }) {
  return (
    <div style={{
      width: 260, height: 530, borderRadius: 40, background: CREAM,
      border: `2px solid ${INK}`, position: 'relative', overflow: 'hidden', flexShrink: 0,
      boxShadow: '0 40px 80px rgba(26,18,9,0.18), 0 8px 24px rgba(26,18,9,0.1)',
    }}>
      {/* Dynamic island */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 84, height: 24, borderRadius: 14, background: INK, zIndex: 10 }} />

      {variant === 'home' && (
        <div style={{ padding: '48px 16px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <LogoMark size={28} />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, fontWeight: 500, color: CREAM }}>AW</span>
            </div>
          </div>

          <p style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 28, color: INK, lineHeight: 1 }}>your events</p>

          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK3 }}>Hosting</p>

          {[
            { title: 'Rooftop at Dusk', sub: 'Jul 26 · 7:00 PM', loc: 'The Wythe Hotel', n: 9 },
            { title: 'Garden Brunch', sub: 'Aug 2 · 11:00 AM', loc: 'Prospect Park', n: 5 },
          ].map((e) => (
            <div key={e.title} style={{ background: CREAM3, borderRadius: 14, padding: '9px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 15, color: INK, lineHeight: 1.2 }}>{e.title}</p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, color: INK2, marginTop: 2 }}>{e.sub}</p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, color: INK3 }}>{e.loc}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 18, color: INK, lineHeight: 1 }}>{e.n}</p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, color: INK3 }}>guests</p>
              </div>
            </div>
          ))}

          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK3, marginTop: 4 }}>Attending</p>
          <div style={{ background: CREAM3, borderRadius: 14, padding: '9px 11px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 15, color: INK, lineHeight: 1.2 }}>Film Night: Criterion</p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, color: INK2, marginTop: 2 }}>Jul 28 · 8:30 PM</p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, color: INK3 }}>Metrograph, New York</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 18, color: INK, lineHeight: 1 }}>3</p>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, color: INK3 }}>guests</p>
            </div>
          </div>

          {/* bottom nav bar hint */}
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${CREAM2}`, paddingTop: 8, display: 'flex', justifyContent: 'space-around' }}>
            {['Events', 'Profile'].map((l) => (
              <span key={l} style={{ fontFamily: 'Jost, sans-serif', fontSize: 7, letterSpacing: '0.08em', textTransform: 'uppercase', color: l === 'Events' ? INK : INK3 }}>{l}</span>
            ))}
          </div>
        </div>
      )}

      {variant === 'qr' && (
        <div style={{ padding: '48px 16px 16px', height: '100%', display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box' }}>
          <p style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1 }}>Rooftop at Dusk</p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: INK2 }}>Jul 26, 2026 · 7:00 PM</p>

          <div style={{ display: 'flex', gap: 16, borderBottom: `1px solid ${CREAM2}`, paddingBottom: 8 }}>
            {['Details', 'Guests', 'Invite'].map((t, i) => (
              <span key={t} style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: i === 2 ? INK : INK3, borderBottom: i === 2 ? `2px solid ${INK}` : 'none', paddingBottom: 4 }}>{t}</span>
            ))}
          </div>

          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, color: INK3, textAlign: 'center', lineHeight: 1.5 }}>Invite guests by sharing<br/>any of the options below</p>

          {/* QR code visual */}
          <div style={{ background: '#fff', borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <QRCodeSVG
              value="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              size={120}
              fgColor={INK}
              bgColor="#ffffff"
              level="M"
            />
          </div>

          {/* Link row */}
          <div style={{ background: CREAM2, borderRadius: 12, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, color: INK2 }}>kamr.app/e/rftpdusk</span>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 8, fontWeight: 500, background: INK, color: CREAM, padding: '3px 8px', borderRadius: 999 }}>Copy</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section: Hero ────────────────────────────────────────────────────────────

function Hero() {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const fadeUp = (delay: number, extraStyle?: object) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(48px) scale(0.96)',
    transition: `opacity 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 1.1s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    willChange: 'opacity, transform',
    ...extraStyle,
  })

  return (
    <section style={{ minHeight: '100vh', background: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 80px', position: 'relative', overflow: 'hidden' }}>

      {/* Background watermark */}
      <div style={{ position: 'absolute', top: -60, right: -80, opacity: 0.035, pointerEvents: 'none', transform: 'rotate(15deg)' }}>
        <LogoMark size={480} />
      </div>

      {/* Content */}
      <div style={{ textAlign: 'center', maxWidth: 760, zIndex: 1 }}>

        <p style={{ ...fadeUp(0), fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK3, marginBottom: 28 }}>
          Capture · Share · Remember
        </p>

        <h1 style={{ ...fadeUp(120), fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(80px, 14vw, 160px)', lineHeight: 0.9, color: INK, margin: '0 0 32px' }}>
          Kamr
        </h1>

        <p style={{ ...fadeUp(240), fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 'clamp(16px, 2.2vw, 22px)', color: INK2, lineHeight: 1.6, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
          Every gathering, beautifully remembered.<br />
          Create events, invite guests instantly, no app required.
        </p>

        <div style={{ ...fadeUp(360), display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 80 }}>
          <button
            onClick={() => navigate('/app')}
            style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14, background: INK, color: CREAM, border: 'none', padding: '14px 34px', borderRadius: 999, cursor: 'pointer', letterSpacing: '0.02em', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.82')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Open App
          </button>
          <button
            onClick={() => navigate('/demo')}
            style={{ fontFamily: 'Jost, sans-serif', fontWeight: 400, fontSize: 14, color: INK2, background: 'transparent', border: `1px solid ${CREAM3}`, padding: '14px 34px', borderRadius: 999, cursor: 'pointer', letterSpacing: '0.02em', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = INK2)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = CREAM3)}
          >
            See how it works
          </button>
        </div>

        {/* Phone mockup */}
        <div style={{ ...fadeUp(480), display: 'flex', justifyContent: 'center', animation: 'kamrFloat 5s ease-in-out infinite' }}>
          <PhoneMockup variant="home" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK }}>Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'kamrBounce 1.8s ease-in-out infinite' }}>
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </div>
    </section>
  )
}

// ─── Section: Use cases ───────────────────────────────────────────────────────

const USE_CASES = [
  {
    label: 'Events',
    headline: 'City nights\nworth sharing',
    sub: 'Rooftop parties, gallery openings, concerts — create an event and get everyone in one place.',
    photo: 'https://images.unsplash.com/photo-1534448177492-6d698f12a59a?w=800&h=1000&fit=crop&auto=format',
  },
  {
    label: 'Vacations',
    headline: 'Adventures\nfor everyone',
    sub: 'Share trip details with your whole group. Every guest sees the plan, no group chat needed.',
    photo: 'https://images.unsplash.com/photo-1566371486490-560ded23b5e4?w=800&h=1000&fit=crop&auto=format',
  },
  {
    label: 'Gatherings',
    headline: 'Intimate\nmoments',
    sub: 'Dinner parties, brunches, small celebrations — make every gathering feel special.',
    photo: 'https://images.unsplash.com/photo-1688437307687-fe226bddfab1?w=800&h=1000&fit=crop&auto=format',
  },
]

function UseCaseCard({ item, index }: { item: typeof USE_CASES[0]; index: number }) {
  const { ref, inView } = useInView(0.08)
  const anim = index === 1 ? reveal(inView, 100) : index === 0 ? revealLeft(inView) : revealRight(inView, 80)
  return (
    <div
      ref={ref}
      style={{
        ...anim,
        flex: '1 1 280px', minHeight: 480, borderRadius: 24, overflow: 'hidden',
        position: 'relative', background: INK, cursor: 'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget.querySelector('.uc-img') as HTMLElement).style.transform = 'scale(1.05)' }}
      onMouseLeave={e => { (e.currentTarget.querySelector('.uc-img') as HTMLElement).style.transform = 'scale(1)' }}
    >
      <img
        className="uc-img"
        src={item.photo}
        alt={item.label}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,18,9,0.88) 0%, rgba(26,18,9,0.2) 50%, transparent 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28 }}>
        <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,237,218,0.6)', display: 'block', marginBottom: 10 }}>
          {item.label}
        </span>
        <h3 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 36, color: CREAM, lineHeight: 1.1, marginBottom: 12, whiteSpace: 'pre-line' }}>
          {item.headline}
        </h3>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: 'rgba(245,237,218,0.7)', lineHeight: 1.65, fontWeight: 300 }}>
          {item.sub}
        </p>
      </div>
    </div>
  )
}

function UseCases() {
  const { ref, inView } = useInView(0.1)
  return (
    <section style={{ background: INK, padding: '100px 40px' }}>
      <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ ...reveal(inView), marginBottom: 60 }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,218,0.4)', marginBottom: 14 }}>
            For every occasion
          </p>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(48px, 7vw, 84px)', color: CREAM, lineHeight: 0.95 }}>
            Made for every<br />gathering
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {USE_CASES.map((item, i) => <UseCaseCard key={item.label} item={item} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Section: How it works ────────────────────────────────────────────────────

const STEPS = [
  {
    n: '01',
    title: 'Create',
    body: 'Name your event, set the date and location. Takes less than thirty seconds.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
      </svg>
    ),
  },
  {
    n: '02',
    title: 'Share',
    body: 'Show a QR code, drop a link, or AirDrop. Guests join with just their name — no app needed.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        <path d="M14 14h2v2h-2z"/><path d="M18 14h2v2h-2z"/><path d="M14 18h2v2h-2z"/><path d="M18 18h2v2h-2z"/>
      </svg>
    ),
  },
  {
    n: '03',
    title: 'Gather',
    body: 'Everyone chooses their display name. You see your full guest list update in real time.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
]

function HowItWorks() {
  const { ref: headRef, inView: headIn } = useInView()
  const { ref: stepsRef, inView: stepsIn } = useInView(0.1)
  return (
    <section id="how" style={{ background: CREAM, padding: '110px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={headRef} style={{ ...reveal(headIn), marginBottom: 72 }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK3, marginBottom: 14 }}>
            How it works
          </p>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(48px, 7vw, 84px)', color: INK, lineHeight: 0.95 }}>
            Beautifully<br />simple
          </h2>
        </div>

        <div ref={stepsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40 }}>
          {STEPS.map((step, i) => (
            <div key={step.n} style={{ ...reveal(stepsIn, i * 140) }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 48, color: CREAM3, lineHeight: 1, flexShrink: 0 }}>{step.n}</span>
                <div style={{ background: CREAM2, borderRadius: 16, padding: 16, flexShrink: 0 }}>{step.icon}</div>
              </div>
              <h3 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 34, color: INK, marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 15, color: INK2, lineHeight: 1.7 }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: QR / invite feature ────────────────────────────────────────────

function InviteFeature() {
  const { ref: leftRef, inView: leftIn } = useInView()
  const { ref: rightRef, inView: rightIn } = useInView()
  return (
    <section style={{ background: CREAM2, padding: '110px 40px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Phone — slides in from left */}
        <div ref={rightRef} style={{ ...revealLeft(rightIn), display: 'flex', justifyContent: 'center' }}>
          <PhoneMockup variant="qr" />
        </div>

        {/* Text — slides in from right */}
        <div ref={leftRef} style={{ ...revealRight(leftIn, 120), flex: '1 1 320px', maxWidth: 440 }}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: INK3, marginBottom: 18 }}>
            Invite in seconds
          </p>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(42px, 6vw, 68px)', color: INK, lineHeight: 1, marginBottom: 24 }}>
            No app<br />download<br />needed
          </h2>
          <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 16, color: INK2, lineHeight: 1.75, marginBottom: 36 }}>
            Guests receive a link and choose a display name. That's it. No accounts, no downloads, no friction — just your people in one place.
          </p>

          {/* Feature chips */}
          {['QR code scanning', 'Copy & share a link', 'AirDrop to nearby guests', 'Send via message'].map((f) => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: INK, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 14, color: INK2, fontWeight: 300 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section: CTA ─────────────────────────────────────────────────────────────

function CTA() {
  const { ref, inView } = useInView()
  const navigate = useNavigate()
  return (
    <section style={{ background: INK, padding: '130px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background watermark */}
      <div style={{ position: 'absolute', bottom: -100, right: -120, opacity: 0.04, pointerEvents: 'none', transform: 'rotate(-10deg)' }}>
        <LogoMark size={520} color={CREAM} bg={INK} />
      </div>

      <div ref={ref} style={{ position: 'relative', zIndex: 1 }}>
        <div style={reveal(inView)}>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,237,218,0.4)', marginBottom: 20 }}>
            Ready when you are
          </p>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 'clamp(52px, 9vw, 110px)', color: CREAM, lineHeight: 0.92, marginBottom: 40 }}>
            Start your<br />first event
          </h2>
          <button
            onClick={() => navigate('/app')}
            style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 15, background: CREAM, color: INK, border: 'none', padding: '16px 44px', borderRadius: 999, cursor: 'pointer', letterSpacing: '0.02em', transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Open Kamr
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ background: INK, borderTop: '1px solid rgba(245,237,218,0.08)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <span style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 22, color: CREAM }}>Kamr</span>
      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: 'rgba(245,237,218,0.3)', letterSpacing: '0.04em' }}>© 2026 Kamr. Every moment, beautifully shared.</span>
    </footer>
  )
}

// ─── Landing ──────────────────────────────────────────────────────────────────

export default function Landing() {
  return (
    <>
      <style>{`
        @keyframes kamrFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes kamrBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(6px); opacity: 1; }
        }
      `}</style>
      <Hero />
      <UseCases />
      <HowItWorks />
      <InviteFeature />
      <CTA />
      <Footer />
    </>
  )
}

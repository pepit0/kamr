import { useState, useContext, createContext, type ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'

// ─── Theme ────────────────────────────────────────────────────────────────────

interface C {
  bg: string
  surface: string
  surfaceActive: string
  card: string
  text: string
  textSec: string
  textTer: string
  border: string
  inv: string
  invText: string
  shell: string
}

const LIGHT: C = {
  bg: '#FAF7F2',
  surface: '#F2EDE4',
  surfaceActive: '#EBE5DB',
  card: '#E8DED2',
  text: '#000000',
  textSec: '#666666',
  textTer: '#aaaaaa',
  border: '#E8E2D8',
  inv: '#000000',
  invText: '#FAF7F2',
  shell: '#E2D9CE',
}

const DARK: C = {
  bg: '#080808',
  surface: '#131313',
  surfaceActive: '#1c1c1c',
  card: '#181510',
  text: '#F5F0E8',
  textSec: '#888888',
  textTer: '#555555',
  border: '#1e1e1e',
  inv: '#F5F0E8',
  invText: '#080808',
  shell: '#1a1a1a',
}

interface Theme {
  isDark: boolean
  c: C
  toggle: () => void
}

const ThemeCtx = createContext<Theme>({ isDark: false, c: LIGHT, toggle: () => {} })
const useTheme = () => useContext(ThemeCtx)

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'home' | 'event' | 'create' | 'join' | 'profile' | 'profile-setup'

interface AppEvent {
  id: string
  title: string
  date: string
  time: string
  location: string
  hostName: string
  attendees: Array<{ id: string; name: string }>
  isHost: boolean
  inviteCode: string
}

interface Profile {
  name: string
  handle: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_EVENTS: AppEvent[] = [
  {
    id: '1',
    title: 'Rooftop at Dusk',
    date: 'Jul 26, 2026',
    time: '7:00 PM',
    location: 'The Wythe Hotel, Brooklyn',
    hostName: 'You',
    attendees: [
      { id: 'a1', name: 'Marcus Webb' },
      { id: 'a2', name: 'Clara Bennett' },
      { id: 'a3', name: 'Ji-Young Lee' },
      { id: 'a4', name: 'Rafael Pinto' },
      { id: 'a5', name: 'Amara Kone' },
      { id: 'a6', name: 'Soren Halm' },
      { id: 'a7', name: 'Priya Rao' },
      { id: 'a8', name: 'Tom Feld' },
      { id: 'a9', name: 'Nadia Osei' },
    ],
    isHost: true,
    inviteCode: 'kamr.app/e/rftpdusk',
  },
  {
    id: '2',
    title: 'Film Night: Criterion',
    date: 'Jul 28, 2026',
    time: '8:30 PM',
    location: 'Metrograph, New York',
    hostName: 'Clara Bennett',
    attendees: [
      { id: 'b1', name: 'You' },
      { id: 'b2', name: 'Marcus Webb' },
      { id: 'b3', name: 'Ji-Young Lee' },
    ],
    isHost: false,
    inviteCode: 'kamr.app/e/filmcrit',
  },
  {
    id: '3',
    title: 'Garden Brunch',
    date: 'Aug 2, 2026',
    time: '11:00 AM',
    location: 'Prospect Park Boathouse',
    hostName: 'You',
    attendees: [
      { id: 'c1', name: 'Soren Halm' },
      { id: 'c2', name: 'Priya Rao' },
      { id: 'c3', name: 'Nadia Osei' },
      { id: 'c4', name: 'Rafael Pinto' },
      { id: 'c5', name: 'Tom Feld' },
    ],
    isHost: true,
    inviteCode: 'kamr.app/e/grdnbrch',
  },
  {
    id: '4',
    title: 'Jazz Under the Stars',
    date: 'Aug 9, 2026',
    time: '9:00 PM',
    location: 'Smalls Jazz Club, NYC',
    hostName: 'Marcus Webb',
    attendees: [
      { id: 'd1', name: 'You' },
      { id: 'd2', name: 'Clara Bennett' },
    ],
    isHost: false,
    inviteCode: 'kamr.app/e/jazzstar',
  },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────

function KamrLogo({ size = 48 }: { size?: number }) {
  const { c } = useTheme()
  const col = c.text
  const sw = 2.6

  return (
    <svg
      width={size}
      height={size}
      viewBox="-52 -8 146 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*
        Entry flourish: a looping cursive stroke that sweeps from the
        lower-left, curls into a small hook, then flows into the
        bottom-left of the camera body.
      */}
      <path
        d="M -50 92 C -48 70, -28 56, -16 64 C -4 72, -2 52, 4 56"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Camera body — outline only */}
      <rect x="4" y="20" width="58" height="38" rx="6" stroke={col} strokeWidth={sw} fill="none" />

      {/* Viewfinder bump — outline only */}
      <rect x="20" y="13" width="18" height="9" rx="4" stroke={col} strokeWidth={sw} fill="none" />

      {/* Lens ring */}
      <circle cx="33" cy="39" r="11" stroke={col} strokeWidth={sw} fill="none" />

      {/* Lens inner dot */}
      <circle cx="33" cy="39" r="4.5" fill={col} />

      {/* Lens highlight */}
      <circle cx="30.5" cy="36.5" r="1.8" fill={c.bg} />

      {/*
        Exit flourish: a large sweeping loop that climbs from the
        top-right of the camera, arcs wide, closes into a tight inner
        loop, then tails away — like the swash on a cursive capital.
      */}
      <path
        d="M 60 20 C 70 6, 90 -6, 88 14 C 86 34, 66 32, 70 18 C 74 4, 90 8, 94 -4"
        stroke={col}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const ico = (d: string, size = 20, closed = false) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {closed ? <path d={d} /> : <path d={d} />}
  </svg>
)

function IcoChevronLeft({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  )
}

function IcoChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  )
}

function IcoPlus({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IcoCalendar({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IcoPin({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IcoPerson({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IcoGroup({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IcoSun({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function IcoMoon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function IcoScan({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </svg>
  )
}

function IcoShare({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16,6 12,2 8,6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function IcoEdit({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IcoNavEvents({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function IcoNavProfile({ size = 21 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  const { c } = useTheme()
  return (
    <div className="flex items-start gap-3">
      <span style={{ color: c.textTer, marginTop: 2 }}>{icon}</span>
      <div>
        <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textTer, marginBottom: 2 }}>
          {label}
        </p>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 14, color: c.text }}>{value}</p>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  const { c } = useTheme()
  return (
    <div>
      <label style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textTer, display: 'block', marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Pill({ label, inverted = false }: { label: string; inverted?: boolean }) {
  const { c } = useTheme()
  return (
    <span style={{
      fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 9,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      background: inverted ? c.inv : c.surface,
      color: inverted ? c.invText : c.textSec,
      padding: '2px 8px', borderRadius: 999, display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

function EventCard({ event, guestName, onPress }: { event: AppEvent; guestName?: string; onPress: () => void }) {
  const { c, isDark } = useTheme()
  const initials = event.attendees
    .slice(0, 4)
    .map((a) => a.name.split(' ').map((w) => w[0]).join('').slice(0, 2))

  return (
    <button
      onClick={onPress}
      style={{ width: '100%', textAlign: 'left', background: c.card, borderRadius: 20, padding: 16, display: 'block', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = c.surfaceActive)}
      onMouseLeave={(e) => (e.currentTarget.style.background = c.card)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 22, lineHeight: 1.2, marginBottom: 4, color: c.text }}>
            {event.title}
          </h3>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textSec, marginBottom: 2 }}>
            {event.date} · {event.time}
          </p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textTer, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 26, lineHeight: 1, color: c.text }}>
            {event.attendees.length}
          </span>
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 10, color: c.textTer }}>guests</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        {event.isHost && <Pill label="Host" inverted />}
        {!event.isHost && guestName && (
          <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: c.textTer }}>
            you're going as <em>{guestName}</em>
          </span>
        )}
        {initials.length > 0 && (
          <div style={{ display: 'flex', marginLeft: 'auto' }}>
            {initials.map((init, i) => (
              <div
                key={i}
                style={{
                  width: 22, height: 22, borderRadius: '50%',
                  border: `2px solid ${c.bg}`,
                  background: `hsl(${i * 55}, 12%, ${isDark ? 22 + i * 4 : 80 + i * 3}%)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontFamily: 'Jost, sans-serif', fontWeight: 500,
                  color: c.text, marginLeft: i === 0 ? 0 : -6, zIndex: 10 - i,
                  position: 'relative',
                }}
              >
                {init}
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  const { c } = useTheme()
  const items = [
    { id: 'home' as Screen, label: 'Events', icon: <IcoNavEvents /> },
    { id: 'profile' as Screen, label: 'Profile', icon: <IcoNavProfile /> },
  ]
  return (
    <div style={{ display: 'flex', borderTop: `1px solid ${c.border}`, background: c.bg }}>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '10px 0 8px', border: 'none', background: 'none', cursor: 'pointer',
            color: active === item.id ? c.text : c.textTer, transition: 'color 0.15s',
          }}
        >
          {item.icon}
          <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Home screen ──────────────────────────────────────────────────────────────

function HomeScreen({
  events,
  guestNames,
  onSelectEvent,
  onCreate,
  onJoin,
  onProfile,
}: {
  events: AppEvent[]
  guestNames: Record<string, string>
  onSelectEvent: (e: AppEvent) => void
  onCreate: () => void
  onJoin: () => void
  onProfile: () => void
}) {
  const { c, isDark, toggle } = useTheme()
  const hosted = events.filter((e) => e.isHost)
  const attending = events.filter((e) => !e.isHost)

  const sectionLabel = (label: string) => (
    <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textTer, marginBottom: 10 }}>
      {label}
    </p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <KamrLogo size={42} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              style={{ color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
            >
              {isDark ? <IcoSun /> : <IcoMoon />}
            </button>
            {/* Scan / join */}
            <button
              onClick={onJoin}
              style={{ color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', padding: 4, lineHeight: 0 }}
            >
              <IcoScan />
            </button>
            {/* Avatar */}
            <button
              onClick={onProfile}
              style={{ width: 34, height: 34, borderRadius: '50%', background: c.inv, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, fontWeight: 500, color: c.invText }}>AW</span>
            </button>
          </div>
        </div>
        <h1 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 42, lineHeight: 1.1, marginTop: 16, color: c.text }}>
          your events
        </h1>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }}>
        {hosted.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {sectionLabel('Hosting')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hosted.map((e) => (
                <EventCard key={e.id} event={e} onPress={() => onSelectEvent(e)} />
              ))}
            </div>
          </div>
        )}
        {attending.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {sectionLabel('Attending')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {attending.map((e) => (
                <EventCard key={e.id} event={e} guestName={guestNames[e.id]} onPress={() => onSelectEvent(e)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onCreate}
        style={{
          position: 'absolute', bottom: 96, right: 20,
          width: 54, height: 54, borderRadius: '50%',
          background: c.inv, color: c.invText,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer', zIndex: 10,
          boxShadow: isDark ? '0 4px 20px rgba(255,255,255,0.08)' : '0 4px 20px rgba(0,0,0,0.18)',
          transition: 'transform 0.12s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <IcoPlus />
      </button>
    </div>
  )
}

// ─── Event detail ─────────────────────────────────────────────────────────────

function EventDetailScreen({
  event,
  guestName,
  onBack,
  onRenameGuest,
  onRenameAttendee,
}: {
  event: AppEvent
  guestName?: string
  onBack: () => void
  onRenameGuest: (name: string) => void
  onRenameAttendee: (attendeeId: string, name: string) => void
}) {
  const { c, isDark } = useTheme()
  const [tab, setTab] = useState<'info' | 'guests' | 'invite'>(event.isHost ? 'info' : 'info')
  const [copied, setCopied] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(guestName ?? 'You')
  const [editingAttendeeId, setEditingAttendeeId] = useState<string | null>(null)
  const [attendeeNameInput, setAttendeeNameInput] = useState('')

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveName = () => {
    if (nameInput.trim()) onRenameGuest(nameInput.trim())
    setEditingName(false)
  }

  const handleSaveAttendee = () => {
    if (editingAttendeeId && attendeeNameInput.trim()) {
      onRenameAttendee(editingAttendeeId, attendeeNameInput.trim())
    }
    setEditingAttendeeId(null)
  }

  const tabs = event.isHost
    ? (['info', 'guests', 'invite'] as const)
    : (['info', 'guests'] as const)

  const tabLabel = { info: 'Details', guests: 'Guests', invite: 'Invite' }

  const shareOptions = [
    { label: 'QR Code', sub: 'display to scan', icon: '⬛' },
    { label: 'Copy Link', sub: event.inviteCode, icon: '🔗', action: handleCopy },
    { label: 'AirDrop', sub: 'share nearby', icon: '📡' },
    { label: 'Message', sub: 'send via SMS', icon: '💬' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 13, marginBottom: 14 }}>
          <IcoChevronLeft /> back
        </button>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: c.text }}>
          {event.title}
        </h2>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: c.textSec, marginTop: 4 }}>
          {event.date} · {event.time}
        </p>
        {!event.isHost && guestName && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textTer }}>
              you as <em style={{ color: c.text }}>{guestName}</em>
            </span>
            <button
              onClick={() => { setNameInput(guestName); setEditingName(true) }}
              style={{ color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
            >
              <IcoEdit />
            </button>
          </div>
        )}
      </div>

      {/* Edit own guest name */}
      {editingName && (
        <div style={{ padding: '12px 24px', background: c.surface, borderBottom: `1px solid ${c.border}`, display: 'flex', gap: 8 }}>
          <input
            autoFocus
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            style={{ flex: 1, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12, padding: '8px 14px', fontFamily: 'Jost, sans-serif', fontSize: 14, color: c.text, outline: 'none' }}
          />
          <button onClick={handleSaveName} style={{ background: c.inv, color: c.invText, border: 'none', borderRadius: 12, padding: '8px 16px', fontFamily: 'Jost, sans-serif', fontSize: 13, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '0 24px', borderBottom: `1px solid ${c.border}` }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: 'Jost, sans-serif', fontSize: 13, fontWeight: tab === t ? 500 : 400,
              color: tab === t ? c.text : c.textTer, background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === t ? c.text : 'transparent'}`,
              padding: '12px 0', marginRight: 20, cursor: 'pointer', transition: 'color 0.15s',
            }}
          >
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px' }}>
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <InfoRow icon={<IcoCalendar />} label="Date" value={`${event.date} at ${event.time}`} />
            <InfoRow icon={<IcoPin />} label="Location" value={event.location} />
            <InfoRow icon={<IcoPerson />} label="Host" value={event.hostName} />
            <InfoRow icon={<IcoGroup />} label="Guests" value={`${event.attendees.length} attending`} />
          </div>
        )}

        {tab === 'guests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {event.attendees.map((a) => (
              <div key={a.id}>
                {editingAttendeeId === a.id ? (
                  <div style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
                    <input
                      autoFocus
                      value={attendeeNameInput}
                      onChange={(e) => setAttendeeNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveAttendee()}
                      style={{ flex: 1, background: c.surface, border: `1px solid ${c.border}`, borderRadius: 12, padding: '8px 14px', fontFamily: 'Jost, sans-serif', fontSize: 14, color: c.text, outline: 'none' }}
                    />
                    <button onClick={handleSaveAttendee} style={{ background: c.inv, color: c.invText, border: 'none', borderRadius: 12, padding: '8px 16px', fontFamily: 'Jost, sans-serif', fontSize: 13, cursor: 'pointer' }}>
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'Jost, sans-serif', fontWeight: 500, color: c.textSec }}>
                        {a.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 14, color: c.text }}>{a.name}</span>
                    </div>
                    {event.isHost && (
                      <button
                        onClick={() => { setEditingAttendeeId(a.id); setAttendeeNameInput(a.name) }}
                        style={{ color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
                      >
                        <IcoEdit />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'invite' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textTer, textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
              Invite guests to <em style={{ color: c.text }}>{event.title}</em><br />
              by sharing any of the options below
            </p>

            {/* QR */}
            <div style={{ background: '#fff', borderRadius: 24, padding: 20, marginBottom: 24, boxShadow: isDark ? '0 0 0 1px rgba(255,255,255,0.06)' : '0 0 0 1px rgba(0,0,0,0.06)' }}>
              <QRCodeSVG
                value={`https://${event.inviteCode}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>

            {/* Share options */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {shareOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={opt.action}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    background: c.surface, borderRadius: 16, padding: '12px 16px',
                    border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.12s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = c.surfaceActive)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = c.surface)}
                >
                  <span style={{ fontSize: 18 }}>{opt.icon}</span>
                  <div>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 13, color: c.text, marginBottom: 1 }}>
                      {opt.label}{opt.label === 'Copy Link' && copied ? ' — Copied!' : ''}
                    </p>
                    <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: c.textTer }}>
                      {opt.sub}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create event screen ──────────────────────────────────────────────────────

function CreateEventScreen({ onBack, onCreate }: { onBack: () => void; onCreate: (e: AppEvent) => void }) {
  const { c } = useTheme()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')

  const canCreate = title.trim() && date && time && location.trim()

  const handleCreate = () => {
    if (!canCreate) return
    const d = new Date(`${date}T${time}`)
    onCreate({
      id: String(Date.now()),
      title: title.trim(),
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      location: location.trim(),
      hostName: 'You',
      attendees: [],
      isHost: true,
      inviteCode: `kamr.app/e/${Math.random().toString(36).slice(2, 9)}`,
    })
  }

  const inputStyle = {
    width: '100%', background: c.surface, borderRadius: 16,
    padding: '14px 16px', border: 'none', outline: 'none',
    color: c.text, fontFamily: 'Jost, sans-serif', fontSize: 14,
    boxSizing: 'border-box' as const, transition: 'background 0.12s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: c.bg }}>
      <div style={{ padding: '56px 24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 13, marginBottom: 14 }}>
          <IcoChevronLeft /> cancel
        </button>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: c.text }}>
          new event
        </h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField label="Event name">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="give it a name..."
            style={{ ...inputStyle, fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 22 }}
            onFocus={(e) => (e.target.style.background = c.surfaceActive)}
            onBlur={(e) => (e.target.style.background = c.surface)}
          />
        </FormField>
        <FormField label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle}
            onFocus={(e) => (e.target.style.background = c.surfaceActive)} onBlur={(e) => (e.target.style.background = c.surface)} />
        </FormField>
        <FormField label="Time">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={inputStyle}
            onFocus={(e) => (e.target.style.background = c.surfaceActive)} onBlur={(e) => (e.target.style.background = c.surface)} />
        </FormField>
        <FormField label="Location">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="where is it happening?" style={inputStyle}
            onFocus={(e) => (e.target.style.background = c.surfaceActive)} onBlur={(e) => (e.target.style.background = c.surface)} />
        </FormField>
      </div>

      <div style={{ padding: '16px 24px 36px', borderTop: `1px solid ${c.border}`, background: c.bg }}>
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          style={{
            width: '100%', padding: '16px', borderRadius: 18, border: 'none', cursor: canCreate ? 'pointer' : 'not-allowed',
            background: canCreate ? c.inv : c.surface, color: canCreate ? c.invText : c.textTer,
            fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14, transition: 'all 0.15s',
          }}
        >
          Create event
        </button>
      </div>
    </div>
  )
}

// ─── Join event screen ────────────────────────────────────────────────────────

function JoinScreen({
  events,
  onBack,
  onJoined,
}: {
  events: AppEvent[]
  onBack: () => void
  onJoined: (eventId: string, displayName: string) => void
}) {
  const { c } = useTheme()
  const [step, setStep] = useState<'code' | 'name'>('code')
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [foundEvent, setFoundEvent] = useState<AppEvent | null>(null)
  const [error, setError] = useState('')

  const handleFindEvent = () => {
    const found = events.find(
      (e) =>
        e.inviteCode.toLowerCase().includes(code.toLowerCase().trim()) ||
        e.id === code.trim(),
    )
    if (found) {
      setFoundEvent(found)
      setError('')
      setStep('name')
    } else {
      setError("We couldn't find that event. Check the code and try again.")
    }
  }

  const handleJoin = () => {
    if (foundEvent && displayName.trim()) {
      onJoined(foundEvent.id, displayName.trim())
    }
  }

  const inputStyle = {
    width: '100%', background: c.surface, borderRadius: 16,
    padding: '14px 16px', border: 'none', outline: 'none',
    color: c.text, fontFamily: 'Jost, sans-serif', fontSize: 14,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: c.bg }}>
      <div style={{ padding: '56px 24px 16px', borderBottom: `1px solid ${c.border}` }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textTer, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 13, marginBottom: 14 }}>
          <IcoChevronLeft /> back
        </button>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: c.text }}>
          {step === 'code' ? 'join an event' : "you're joining"}
        </h2>
        {step === 'name' && foundEvent && (
          <p style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 22, color: c.textSec, marginTop: 4 }}>
            {foundEvent.title}
          </p>
        )}
      </div>

      <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {step === 'code' && (
          <>
            <FormField label="Invite link or code">
              <input
                autoFocus
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError('') }}
                onKeyDown={(e) => e.key === 'Enter' && handleFindEvent()}
                placeholder="kamr.app/e/..."
                style={inputStyle}
              />
            </FormField>
            {error && (
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: '#e05252' }}>{error}</p>
            )}
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textTer, lineHeight: 1.6 }}>
              Paste the invite link or code from the host. You can also scan a QR code with your phone camera.
            </p>
          </>
        )}

        {step === 'name' && (
          <>
            <FormField label="Your display name for this event">
              <input
                autoFocus
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="how should guests know you?"
                style={{ ...inputStyle, fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 22 }}
              />
            </FormField>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 12, color: c.textTer, lineHeight: 1.6 }}>
              This name is only used for this event. You can change it anytime from the event page.
            </p>
          </>
        )}
      </div>

      <div style={{ padding: '16px 24px 36px', borderTop: `1px solid ${c.border}`, background: c.bg }}>
        {step === 'code' ? (
          <button
            onClick={handleFindEvent}
            disabled={!code.trim()}
            style={{
              width: '100%', padding: '16px', borderRadius: 18, border: 'none',
              cursor: code.trim() ? 'pointer' : 'not-allowed',
              background: code.trim() ? c.inv : c.surface,
              color: code.trim() ? c.invText : c.textTer,
              fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14, transition: 'all 0.15s',
            }}
          >
            Find event
          </button>
        ) : (
          <button
            onClick={handleJoin}
            disabled={!displayName.trim()}
            style={{
              width: '100%', padding: '16px', borderRadius: 18, border: 'none',
              cursor: displayName.trim() ? 'pointer' : 'not-allowed',
              background: displayName.trim() ? c.inv : c.surface,
              color: displayName.trim() ? c.invText : c.textTer,
              fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14, transition: 'all 0.15s',
            }}
          >
            Join event
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Profile setup screen ─────────────────────────────────────────────────────

function ProfileSetupScreen({ onSave, onSkip }: { onSave: (p: Profile) => void; onSkip: () => void }) {
  const { c } = useTheme()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')

  const inputStyle = {
    width: '100%', background: c.surface, borderRadius: 16,
    padding: '14px 16px', border: 'none', outline: 'none',
    color: c.text, fontFamily: 'Jost, sans-serif', fontSize: 14,
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: c.bg }}>
      <div style={{ padding: '56px 24px 24px' }}>
        <KamrLogo size={36} />
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: c.text, marginTop: 20 }}>
          create your profile
        </h2>
        <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: c.textSec, lineHeight: 1.6, marginTop: 8 }}>
          As a host, your profile is how guests know who invited them.
        </p>
      </div>

      <div style={{ flex: 1, padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Avatar placeholder */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: c.surface, border: `2px dashed ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 11, color: c.textTer, textAlign: 'center', lineHeight: 1.4 }}>add<br />photo</span>
          </div>
        </div>

        <FormField label="Full name">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="your name" style={inputStyle} />
        </FormField>
        <FormField label="Handle">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Jost, sans-serif', fontSize: 14, color: c.textTer }}>@</span>
            <input type="text" value={handle} onChange={(e) => setHandle(e.target.value.replace(/\s/g, '').toLowerCase())} placeholder="yourhandle" style={{ ...inputStyle, paddingLeft: 30 }} />
          </div>
        </FormField>
      </div>

      <div style={{ padding: '16px 24px 36px', display: 'flex', flexDirection: 'column', gap: 10, background: c.bg, borderTop: `1px solid ${c.border}` }}>
        <button
          onClick={() => name.trim() && onSave({ name: name.trim(), handle: handle.trim() || name.trim().toLowerCase().replace(/\s/g, '') })}
          disabled={!name.trim()}
          style={{
            width: '100%', padding: '16px', borderRadius: 18, border: 'none',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            background: name.trim() ? c.inv : c.surface,
            color: name.trim() ? c.invText : c.textTer,
            fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14,
          }}
        >
          Save profile
        </button>
        <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Jost, sans-serif', fontSize: 13, color: c.textTer, padding: 8 }}>
          skip for now
        </button>
      </div>
    </div>
  )
}

// ─── Profile screen ───────────────────────────────────────────────────────────

function ProfileScreen({
  events,
  profile,
  onSetupProfile,
}: {
  events: AppEvent[]
  profile: Profile | null
  onSetupProfile: () => void
}) {
  const { c, isDark, toggle } = useTheme()
  const hosting = events.filter((e) => e.isHost).length
  const attending = events.filter((e) => !e.isHost).length
  const initials = profile ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '56px 24px 16px' }}>
        <h2 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 42, lineHeight: 1.1, color: c.text }}>
          profile
        </h2>
      </div>

      {!profile ? (
        <div style={{ flex: 1, padding: '16px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: c.surface, border: `2px dashed ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 28, color: c.textTer }}>?</span>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 26, color: c.text, marginBottom: 6 }}>
              no profile yet
            </h3>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: c.textSec, lineHeight: 1.6 }}>
              Create a profile so guests know who invited them to your events.
            </p>
          </div>
          <button
            onClick={onSetupProfile}
            style={{ background: c.inv, color: c.invText, border: 'none', borderRadius: 18, padding: '14px 32px', fontFamily: 'Jost, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}
          >
            Create profile
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '8px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: c.surface, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <span style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 26, color: c.text }}>{initials}</span>
            </div>
            <h3 style={{ fontFamily: "'Dancing Script', cursive", fontWeight: 700, fontSize: 28, color: c.text, marginBottom: 2 }}>{profile.name}</h3>
            <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 13, color: c.textTer }}>@{profile.handle}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 32, margin: '20px 0 0' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 26, lineHeight: 1, marginBottom: 4, color: c.text }}>{hosting}</p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textTer }}>hosting</p>
              </div>
              <div style={{ width: 1, height: 32, background: c.border }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Jost, sans-serif', fontWeight: 300, fontSize: 26, lineHeight: 1, marginBottom: 4, color: c.text }}>{attending}</p>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textTer }}>attending</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '0 24px' }}>
            {['Edit profile', 'Notifications', 'Privacy', 'Help'].map((item) => (
              <button key={item} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${c.border}`, background: 'none', cursor: 'pointer', color: c.text }}>
                <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 14 }}>{item}</span>
                <span style={{ color: c.textTer }}><IcoChevronRight /></span>
              </button>
            ))}
            <button
              onClick={toggle}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${c.border}`, background: 'none', cursor: 'pointer', color: c.text }}
            >
              <span style={{ fontFamily: 'Jost, sans-serif', fontSize: 14 }}>
                {isDark ? 'Light mode' : 'Dark mode'}
              </span>
              <span style={{ color: c.textTer }}>{isDark ? <IcoSun /> : <IcoMoon />}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isDark, setIsDark] = useState(false)
  const [screen, setScreen] = useState<Screen>('home')
  const [navTab, setNavTab] = useState<Screen>('home')
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null)
  const [events, setEvents] = useState<AppEvent[]>(MOCK_EVENTS)
  const [guestNames, setGuestNames] = useState<Record<string, string>>({ '2': 'You', '4': 'You' })
  const [profile, setProfile] = useState<Profile | null>({ name: 'Ava Williams', handle: 'avawilliams' })

  const c = isDark ? DARK : LIGHT
  const theme: Theme = { isDark, c, toggle: () => setIsDark((d) => !d) }

  const showNav = screen === 'home' || screen === 'profile'

  const handleSelectEvent = (event: AppEvent) => {
    setSelectedEvent(event)
    setScreen('event')
  }

  const handleBack = () => {
    setScreen(navTab)
    setSelectedEvent(null)
  }

  const handleEventCreated = (event: AppEvent) => {
    setEvents((prev) => [event, ...prev])
    setSelectedEvent(event)
    setNavTab('home')
    setScreen('event')
  }

  const handleJoined = (eventId: string, displayName: string) => {
    const event = events.find((e) => e.id === eventId)
    if (!event) return
    setGuestNames((prev) => ({ ...prev, [eventId]: displayName }))
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, isHost: false, attendees: [...e.attendees.filter((a) => a.name !== 'You'), { id: `guest-${Date.now()}`, name: displayName }] }
          : e,
      ),
    )
    const updated = events.find((e) => e.id === eventId)
    if (updated) {
      setSelectedEvent({ ...updated, isHost: false })
      setNavTab('home')
      setScreen('event')
    }
  }

  const handleRenameGuest = (eventId: string, name: string) => {
    setGuestNames((prev) => ({ ...prev, [eventId]: name }))
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, attendees: e.attendees.map((a) => (a.name === guestNames[eventId] ? { ...a, name } : a)) }
          : e,
      ),
    )
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => prev ? {
        ...prev,
        attendees: prev.attendees.map((a) => a.name === guestNames[eventId] ? { ...a, name } : a),
      } : prev)
    }
  }

  const handleRenameAttendee = (eventId: string, attendeeId: string, name: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, attendees: e.attendees.map((a) => (a.id === attendeeId ? { ...a, name } : a)) }
          : e,
      ),
    )
    if (selectedEvent?.id === eventId) {
      setSelectedEvent((prev) => prev ? {
        ...prev,
        attendees: prev.attendees.map((a) => (a.id === attendeeId ? { ...a, name } : a)),
      } : prev)
    }
  }

  const handleNavChange = (s: Screen) => {
    setNavTab(s)
    setScreen(s)
    setSelectedEvent(null)
  }

  return (
    <ThemeCtx.Provider value={theme}>
      <div
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.shell, transition: 'background 0.3s' }}
      >
        {/* Phone shell */}
        <div
          style={{
            position: 'relative', width: 390, height: 844,
            borderRadius: 50, overflow: 'hidden',
            background: c.bg,
            boxShadow: isDark
              ? '0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)'
              : '0 0 0 1px rgba(0,0,0,0.1), 0 30px 80px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.8)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Dynamic island */}
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 126, height: 36, borderRadius: 20, background: '#000', zIndex: 50 }} />

          {/* Screen content */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              {screen === 'home' && (
                <HomeScreen
                  events={events}
                  guestNames={guestNames}
                  onSelectEvent={handleSelectEvent}
                  onCreate={() => setScreen('create')}
                  onJoin={() => setScreen('join')}
                  onProfile={() => handleNavChange('profile')}
                />
              )}
              {screen === 'profile' && (
                <ProfileScreen
                  events={events}
                  profile={profile}
                  onSetupProfile={() => setScreen('profile-setup')}
                />
              )}
              {screen === 'event' && selectedEvent && (
                <EventDetailScreen
                  event={selectedEvent}
                  guestName={guestNames[selectedEvent.id]}
                  onBack={handleBack}
                  onRenameGuest={(name) => handleRenameGuest(selectedEvent.id, name)}
                  onRenameAttendee={(id, name) => handleRenameAttendee(selectedEvent.id, id, name)}
                />
              )}
              {screen === 'create' && (
                <CreateEventScreen onBack={handleBack} onCreate={handleEventCreated} />
              )}
              {screen === 'join' && (
                <JoinScreen events={events} onBack={handleBack} onJoined={handleJoined} />
              )}
              {screen === 'profile-setup' && (
                <ProfileSetupScreen
                  onSave={(p) => { setProfile(p); setScreen('profile') }}
                  onSkip={() => setScreen('profile')}
                />
              )}
            </div>

            {showNav && (
              <div style={{ paddingBottom: 28 }}>
                <BottomNav active={navTab} onChange={handleNavChange} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  )
}

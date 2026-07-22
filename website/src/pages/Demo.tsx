import { useEffect } from 'react'
import App, { PHONE_HEIGHT, PHONE_WIDTH } from '../App'

const NAV_HEIGHT = 64

export default function Demo() {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: NAV_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,
        boxSizing: 'border-box',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#E2D9CE',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          containerType: 'size',
          width: `min(${PHONE_WIDTH}px, 100%)`,
          height: `min(${PHONE_HEIGHT}px, 100%)`,
          aspectRatio: `${PHONE_WIDTH} / ${PHONE_HEIGHT}`,
          flexShrink: 0,
        }}
      >
        <App embedded />
      </div>
    </div>
  )
}

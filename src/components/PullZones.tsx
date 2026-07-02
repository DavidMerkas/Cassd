import type { CSSProperties } from 'react'
import type { ClosetSkin } from '../skins'

export type PullZone = 'shelf' | 'crate' | null

interface Props {
  active: PullZone
  cb: ClosetSkin
  habit: boolean
  /** when true (EJECT armed), rails accept a direct tap as well as a drag drop */
  interactive?: boolean
  onShelf?: () => void
  onCrate?: () => void
}

const railBase: CSSProperties = {
  position: 'absolute', top: 0, bottom: 0, width: 122, zIndex: 60,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
  textAlign: 'center', padding: '0 10px',
  transition: 'transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, filter .18s ease',
  animation: 'cassd-fade .2s ease',
}

export default function PullZones({ active, cb, habit, interactive = false, onShelf, onCrate }: Props) {
  return (
    <>
      {/* left rail — drop here to send the tape back to the closet shelf */}
      <div
        onClick={interactive ? onShelf : undefined}
        style={{
          ...railBase, left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          background: cb.board,
          borderRight: '3px solid #16140F',
          borderTopRightRadius: 20, borderBottomRightRadius: 20,
          color: cb.ink,
          transform: active === 'shelf' ? 'translateX(0)' : 'translateX(-46px)',
          filter: active === 'shelf' ? 'brightness(1.08)' : 'brightness(0.9)',
          boxShadow: active === 'shelf'
            ? '10px 0 30px rgba(0,0,0,0.4), inset -6px 0 12px rgba(255,255,255,0.15)'
            : '5px 0 16px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{ transform: active === 'shelf' ? 'scale(1.12)' : 'scale(1)', transition: 'transform .18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="9" y1="5.5" x2="9" y2="6.5" /></svg>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '0.02em', lineHeight: 0.95 }}>SHELF</div>
          <div style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.7, letterSpacing: '0.04em' }}>still pending</div>
          <div style={{ fontSize: 20, lineHeight: 0.6, opacity: active === 'shelf' ? 1 : 0.5 }}>←</div>
        </div>
      </div>

      {/* right rail — drop here to finish the tape into the crate (or rewind a habit) */}
      <div
        onClick={interactive ? onCrate : undefined}
        style={{
          ...railBase, right: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          background: 'linear-gradient(180deg,#a9743f,#8a5c30)',
          borderLeft: '3px solid #16140F',
          borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
          color: '#F5EAD8',
          transform: active === 'crate' ? 'translateX(0)' : 'translateX(46px)',
          filter: active === 'crate' ? 'brightness(1.08)' : 'brightness(0.9)',
          boxShadow: active === 'crate'
            ? '-10px 0 30px rgba(0,0,0,0.4), inset 6px 0 12px rgba(255,255,255,0.15)'
            : '-5px 0 16px rgba(0,0,0,0.28)',
        }}
      >
        <div style={{ transform: active === 'crate' ? 'scale(1.12)' : 'scale(1)', transition: 'transform .18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {habit ? (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
          ) : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8h17l-1 12.5H4.5z" /><path d="M3.5 8l2.2-4h12.6L20.5 8" /><line x1="12" y1="8" x2="12" y2="20.5" /></svg>
          )}
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, letterSpacing: '0.02em', lineHeight: 0.95 }}>DONE</div>
          <div style={{ fontSize: 9.5, fontWeight: 800, opacity: 0.75, letterSpacing: '0.04em', color: habit ? '#F5EAD8' : '#FFD23F' }}>{habit ? 'rep done · rewinds' : 'into the crate · coins'}</div>
          <div style={{ fontSize: 20, lineHeight: 0.6, opacity: active === 'crate' ? 1 : 0.5 }}>→</div>
        </div>
      </div>
    </>
  )
}

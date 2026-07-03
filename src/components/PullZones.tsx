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

// wood grain, matching the closet's procedural texture
const grainH = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 8px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 13px)'

const railBase: CSSProperties = {
  position: 'absolute', top: '44%', zIndex: 60, width: 112, height: 190,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
  textAlign: 'center', padding: '0 8px',
  transition: 'transform .18s cubic-bezier(.22,1,.36,1), box-shadow .18s ease, filter .18s ease',
  animation: 'cassd-fade .2s ease',
}

export default function PullZones({ active, cb, habit, interactive = false, onShelf, onCrate }: Props) {
  return (
    <>
      {/* left target — a little wooden shelf poking in: drop = back to the closet */}
      <div
        onClick={interactive ? onShelf : undefined}
        style={{
          ...railBase, left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          background: `${grainH}, ${cb.board}`,
          border: '3px solid #16140F', borderLeft: 'none',
          borderRadius: '0 18px 18px 0',
          color: '#F5EAD8',
          transform: `translate(${active === 'shelf' ? '0' : '-30px'}, -50%)`,
          filter: active === 'shelf' ? 'brightness(1.1)' : 'brightness(0.94)',
          boxShadow: active === 'shelf'
            ? '10px 6px 26px rgba(0,0,0,0.42), inset -4px 0 0 rgba(255,255,255,0.2), inset 0 3px 0 rgba(255,255,255,0.22)'
            : '5px 4px 14px rgba(0,0,0,0.3), inset -3px 0 0 rgba(255,255,255,0.14), inset 0 3px 0 rgba(255,255,255,0.18)',
        }}
      >
        {/* two little shelf boards to sell "closet" */}
        <div style={{ position: 'absolute', left: 10, right: 14, top: 26, height: 7, borderRadius: '0 3px 3px 0', background: 'rgba(22,20,15,0.35)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)' }} />
        <div style={{ position: 'absolute', left: 10, right: 14, bottom: 26, height: 7, borderRadius: '0 3px 3px 0', background: 'rgba(22,20,15,0.35)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)' }} />

        <div style={{ transform: active === 'shelf' ? 'scale(1.12)' : 'scale(1)', transition: 'transform .18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></svg>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.03em', lineHeight: 0.95 }}>SHELF</div>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.8, letterSpacing: '0.04em' }}>still pending</div>
          <div style={{ fontSize: 17, lineHeight: 0.6, opacity: active === 'shelf' ? 1 : 0.55 }}>←</div>
        </div>
      </div>

      {/* right target — a wooden crate poking in: drop = tape is done */}
      <div
        onClick={interactive ? onCrate : undefined}
        style={{
          ...railBase, right: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.24) 0 2px, rgba(255,255,255,0.04) 2px 3px, transparent 3px 34px), ${grainH}, linear-gradient(180deg,#a9743f,#875a2f)`,
          border: '3px solid #16140F', borderRight: 'none',
          borderRadius: '18px 0 0 18px',
          color: '#F5EAD8',
          transform: `translate(${active === 'crate' ? '0' : '30px'}, -50%)`,
          filter: active === 'crate' ? 'brightness(1.1)' : 'brightness(0.94)',
          boxShadow: active === 'crate'
            ? '-10px 6px 26px rgba(0,0,0,0.42), inset 4px 0 0 rgba(255,255,255,0.2), inset 0 3px 0 rgba(255,255,255,0.22)'
            : '-5px 4px 14px rgba(0,0,0,0.3), inset 3px 0 0 rgba(255,255,255,0.14), inset 0 3px 0 rgba(255,255,255,0.18)',
        }}
      >
        {/* corner screws to sell "crate" */}
        <span style={{ position: 'absolute', top: 7, left: 9, width: 5, height: 5, borderRadius: '50%', background: '#2a1c11' }} />
        <span style={{ position: 'absolute', top: 7, right: 9, width: 5, height: 5, borderRadius: '50%', background: '#2a1c11' }} />
        <span style={{ position: 'absolute', bottom: 7, left: 9, width: 5, height: 5, borderRadius: '50%', background: '#2a1c11' }} />
        <span style={{ position: 'absolute', bottom: 7, right: 9, width: 5, height: 5, borderRadius: '50%', background: '#2a1c11' }} />

        <div style={{ transform: active === 'crate' ? 'scale(1.12)' : 'scale(1)', transition: 'transform .18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
          {habit ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8h17l-1 12.5H4.5z" /><path d="M3.5 8l2.2-4h12.6L20.5 8" /><line x1="12" y1="8" x2="12" y2="20.5" /></svg>
          )}
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.03em', lineHeight: 0.95 }}>DONE</div>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.85, letterSpacing: '0.04em', color: habit ? '#F5EAD8' : '#FFD23F' }}>{habit ? 'rep done · rewinds' : 'into the crate · coins'}</div>
          <div style={{ fontSize: 17, lineHeight: 0.6, opacity: active === 'crate' ? 1 : 0.55 }}>→</div>
        </div>
      </div>
    </>
  )
}

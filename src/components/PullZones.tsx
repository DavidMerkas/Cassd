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

// painted-metal locker surfaces, matching the closet
const metalFace = 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 15%, rgba(0,0,0,0.09) 56%, rgba(255,255,255,0.05) 94%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)'
const louver = 'repeating-linear-gradient(180deg, rgba(255,255,255,0.28) 0 1px, rgba(0,0,0,0.12) 1px 5px, rgba(0,0,0,0.6) 5px 6px)'
// crate wood stays wood
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
      {/* left target — the closet with CLOSED doors: drop = back inside. Doors crack open when hovered */}
      <div
        onClick={interactive ? onShelf : undefined}
        style={{
          ...railBase, left: 0,
          pointerEvents: interactive ? 'auto' : 'none',
          cursor: interactive ? 'pointer' : 'default',
          background: `${metalFace}, ${cb.frame}`,
          border: '3px solid #16140F', borderLeft: 'none',
          borderRadius: '0 12px 12px 0',
          color: '#F5EAD8',
          transform: `translate(${active === 'shelf' ? '0' : '-30px'}, -50%)`,
          filter: active === 'shelf' ? 'brightness(1.08)' : 'brightness(0.94)',
          boxShadow: active === 'shelf'
            ? '10px 6px 26px rgba(0,0,0,0.42), inset 0 3px 0 rgba(255,255,255,0.24)'
            : '5px 4px 14px rgba(0,0,0,0.3), inset 0 3px 0 rgba(255,255,255,0.2)',
          padding: 0, overflow: 'hidden',
        }}
      >
        {/* top + bottom vent strips */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: `${louver}, ${cb.frame}`, borderBottom: '2px solid #16140F' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 9, background: `${louver}, ${cb.frame}`, borderTop: '2px solid #16140F' }} />

        {/* dark interior peeking through the seam */}
        <div style={{ position: 'absolute', inset: '12px 5px 11px 0', background: 'linear-gradient(180deg, #2c2e28, #171815)' }} />

        {/* the two metal doors, hinged at the outer edges */}
        <div style={{ position: 'absolute', inset: '12px 5px 11px 0', perspective: 420 }}>
          {[0, 1].map(side => (
            <div
              key={side}
              style={{
                position: 'absolute', top: 0, bottom: 0,
                [side === 0 ? 'left' : 'right']: 0, width: '50%',
                transformOrigin: side === 0 ? 'left center' : 'right center',
                transform: active === 'shelf' ? `rotateY(${side === 0 ? -26 : 26}deg)` : 'rotateY(0deg)',
                transition: 'transform .2s cubic-bezier(.22,1,.36,1)',
                background: `${metalFace}, ${cb.frame}`,
                border: '2px solid #16140F',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)',
              } as CSSProperties}
            >
              {/* vent louvers */}
              <div style={{ position: 'absolute', top: 8, left: 6, right: 6, height: 14, background: louver, border: '1px solid #16140F', borderRadius: 2 }} />
              <div style={{ position: 'absolute', bottom: 8, left: 6, right: 6, height: 14, background: louver, border: '1px solid #16140F', borderRadius: 2 }} />
              {/* chrome latch by the seam */}
              <div style={{ position: 'absolute', [side === 0 ? 'right' : 'left']: 4, top: '50%', width: 5, height: 24, borderRadius: 2, background: 'linear-gradient(90deg,#cfcfcf,#6a6a6a 52%,#a4a4a4)', border: '1px solid #16140F', transform: 'translateY(-50%)' } as CSSProperties} />
            </div>
          ))}
        </div>

        {/* label plate over the doors */}
        <div style={{ position: 'relative', zIndex: 2, transform: active === 'shelf' ? 'scale(1.1)' : 'scale(1)', transition: 'transform .18s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></svg>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.03em', lineHeight: 0.95 }}>CLOSET</div>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.85, letterSpacing: '0.04em' }}>still pending</div>
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

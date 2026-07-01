import type { CSSProperties } from 'react'
import type { Task } from '../types'
import { VALUE_PER } from '../skins'
import { inkOn } from '../util'

interface Props {
  crateItems: Task[]
  playedLifetime: number
  emptyCrate: () => void
}

const coinStyle: CSSProperties = {
  width: 20, height: 20, borderRadius: '50%',
  background: 'radial-gradient(circle at 38% 34%, #FFE79A, #FFD23F 55%, #E0A81E)',
  border: '2px solid #B7860E',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'Anton, sans-serif', fontSize: 11, color: '#7a5b06',
}

export default function Crate({ crateItems, playedLifetime, emptyCrate }: Props) {
  const crateValue = crateItems.length * VALUE_PER
  const has = crateItems.length > 0

  return (
    <div style={{ padding: '6px 18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '2px 2px 14px' }}>
        <div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 19, color: '#16140F', letterSpacing: '0.02em' }}>THE CRATE</div>
          <div style={{ fontSize: 12, color: 'rgba(22,20,15,0.5)', marginTop: 2 }}>Tapes you've played all the way through.</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 26, lineHeight: 0.9, color: '#16140F' }}>{playedLifetime}</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(22,20,15,0.4)' }}>ALL-TIME</div>
        </div>
      </div>

      {/* the crate box */}
      <div style={{ background: 'linear-gradient(180deg,#a9743f,#8a5c30)', border: '3px solid #16140F', borderRadius: 14, padding: 12, boxShadow: '0 12px 26px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.2)' }}>
        <div style={{ background: 'repeating-linear-gradient(90deg,#7c4f26 0 3px,transparent 3px 8px), linear-gradient(180deg,#6b4a2d,#4a3220)', border: '2px solid #3a2416', borderRadius: 8, minHeight: 150, padding: 12, display: 'flex', flexDirection: 'column' }}>
          {!has && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8, padding: '14px 10px' }}>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 18, color: '#F5EAD8' }}>Crate's empty</div>
              <div style={{ fontSize: 12, color: 'rgba(245,234,216,0.7)', maxWidth: 220, lineHeight: 1.5 }}>
                Load a tape in the boombox and play it through to fill this up.
              </div>
            </div>
          )}
          {has && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
              {crateItems.map(t => (
                <div
                  key={t.id}
                  title={t.name}
                  style={{
                    width: 26, height: 104, borderRadius: 3, background: t.color,
                    border: '2px solid #16140F', boxShadow: '1px 0 0 rgba(0,0,0,0.25)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 0', filter: 'saturate(0.82)', flex: 'none',
                  }}
                >
                  <span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #16140F', background: '#0D0C09' }} />
                  <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 800, fontSize: 9.5, color: inkOn(t.color), whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: 62, textOverflow: 'ellipsis' }}>
                    {t.name}
                  </span>
                  <span style={{ fontSize: 9, color: '#2BB3A3' }}>✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* cash-in bar */}
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, background: '#16140F', border: '3px solid #16140F', borderRadius: 14, padding: '12px 12px 12px 16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(245,241,232,0.5)' }}>CRATE VALUE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={coinStyle}>¢</span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 24, color: '#FFD23F', fontVariantNumeric: 'tabular-nums' }}>{crateValue}</span>
          </div>
        </div>
        <button
          onClick={emptyCrate}
          className="press"
          style={{
            border: '2.5px solid #0D0C09', background: has ? '#FFD23F' : '#3a3630',
            color: '#16140F', fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.03em',
            padding: '12px 16px', borderRadius: 12, cursor: has ? 'pointer' : 'not-allowed',
            '--sh': '0 4px 0 #0D0C09', '--sh-a': '0 1px 0 #0D0C09',
          } as CSSProperties}
        >
          EMPTY CRATE ↦
        </button>
      </div>
    </div>
  )
}
